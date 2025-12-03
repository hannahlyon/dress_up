#!/usr/bin/env python3
"""
Email server for sending outfit images to Hannah
"""
import os
import base64
import time
import secrets
from collections import defaultdict
from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS to only allow your domain
ALLOWED_ORIGINS = [
    'https://dressup.hannahbunnn.com',
    'http://localhost:8000',
    'http://127.0.0.1:8000'
]

CORS(app, origins=ALLOWED_ORIGINS, resources={
    r"/obs/*": {"origins": "*"},
    r"/send-outfit": {"origins": ALLOWED_ORIGINS}
})

# Rate limiting storage (IP -> list of timestamps)
rate_limit_storage = defaultdict(list)

# OBS outfit storage (simple in-memory storage)
obs_outfit_data = {'outfit': None}

# Security configuration
MAX_REQUESTS_PER_HOUR = 10  # Max 10 emails per hour per IP
MAX_REQUESTS_PER_MINUTE = 2  # Max 2 emails per minute per IP
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB max image size
REQUEST_WINDOW_HOUR = 3600  # 1 hour in seconds
REQUEST_WINDOW_MINUTE = 60  # 1 minute in seconds

# Simple shared secret for authentication
API_SECRET = os.getenv('API_SECRET', secrets.token_urlsafe(32))

def get_client_ip():
    """Get the real client IP address"""
    # Check if behind a proxy (Heroku)
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    return request.remote_addr

def is_rate_limited(ip_address):
    """Check if IP address has exceeded rate limits"""
    now = time.time()

    # Clean up old entries
    rate_limit_storage[ip_address] = [
        timestamp for timestamp in rate_limit_storage[ip_address]
        if now - timestamp < REQUEST_WINDOW_HOUR
    ]

    timestamps = rate_limit_storage[ip_address]

    # Check minute limit
    recent_minute = [t for t in timestamps if now - t < REQUEST_WINDOW_MINUTE]
    if len(recent_minute) >= MAX_REQUESTS_PER_MINUTE:
        return True, 'Too many requests. Please wait a minute.'

    # Check hour limit
    if len(timestamps) >= MAX_REQUESTS_PER_HOUR:
        return True, 'Too many requests. Please try again later.'

    return False, None

def verify_origin():
    """Verify the request is coming from an allowed origin"""
    origin = request.headers.get('Origin', '')
    referer = request.headers.get('Referer', '')

    # Check if either origin or referer matches allowed domains
    for allowed in ALLOWED_ORIGINS:
        if origin.startswith(allowed) or referer.startswith(allowed):
            return True

    return False

@app.route('/send-outfit', methods=['POST'])
def send_outfit():
    """Send outfit image via email to Hannah"""
    try:
        # 1. Verify origin
        if not verify_origin():
            return jsonify({'success': False, 'error': 'Unauthorized origin'}), 403

        # 2. Check rate limiting
        client_ip = get_client_ip()
        is_limited, limit_msg = is_rate_limited(client_ip)
        if is_limited:
            return jsonify({'success': False, 'error': limit_msg}), 429

        # 3. Verify authentication token
        auth_header = request.headers.get('X-API-Secret')
        if not auth_header or auth_header != API_SECRET:
            return jsonify({'success': False, 'error': 'Invalid authentication'}), 401

        # Get the image data from the request
        data = request.json
        image_data = data.get('image')

        if not image_data:
            return jsonify({'success': False, 'error': 'No image data provided'}), 400

        # 4. Check image size
        estimated_size = len(image_data) * 0.75  # Base64 is ~33% larger than binary
        if estimated_size > MAX_IMAGE_SIZE:
            return jsonify({'success': False, 'error': 'Image too large'}), 413

        # Remove the data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]

        # Decode base64 image
        image_bytes = base64.b64decode(image_data)

        # Get email credentials from environment
        email_service = os.getenv('EMAIL_SERVICE', 'gmail')
        email_user = os.getenv('EMAIL_USER')
        email_pass = os.getenv('EMAIL_PASS')
        notification_email = os.getenv('NOTIFICATION_EMAIL')

        if not all([email_user, email_pass, notification_email]):
            return jsonify({'success': False, 'error': 'Email configuration missing'}), 500

        # Create email message
        msg = MIMEMultipart()
        msg['From'] = email_user
        msg['To'] = notification_email
        msg['Subject'] = 'New Outfit from Outfit Creator!'

        # Email body
        body = """
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Someone created a new outfit for you!</h2>
                <p>Check out this outfit combination from your Outfit Creator:</p>
                <p><img src="cid:outfit_image" style="max-width: 600px; border: 2px solid #000;"></p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    Generated from Hannahbunnn's Outfit Creator
                </p>
            </body>
        </html>
        """

        msg.attach(MIMEText(body, 'html'))

        # Attach image
        image = MIMEImage(image_bytes, name='outfit.png')
        image.add_header('Content-ID', '<outfit_image>')
        image.add_header('Content-Disposition', 'inline', filename='outfit.png')
        msg.attach(image)

        # Send email via Gmail SMTP
        if email_service == 'gmail':
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.starttls()
                server.login(email_user, email_pass)
                server.send_message(msg)

        # Record successful request for rate limiting
        rate_limit_storage[client_ip].append(time.time())

        return jsonify({'success': True, 'message': 'Outfit sent to Hannah successfully!'})

    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

@app.route('/obs/outfit', methods=['POST', 'OPTIONS'])
def save_obs_outfit():
    """Save outfit data for OBS overlay"""
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS')
        return response

    try:
        data = request.json
        outfit = data.get('outfit')

        if outfit is None:
            return jsonify({'success': False, 'error': 'No outfit data provided'}), 400

        # Store the outfit
        obs_outfit_data['outfit'] = outfit
        print(f"Outfit saved: {outfit}")

        return jsonify({'success': True, 'message': 'Outfit saved for OBS'})

    except Exception as e:
        print(f"Error saving OBS outfit: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/obs/outfit', methods=['GET'])
def get_obs_outfit():
    """Get outfit data for OBS overlay"""
    try:
        response = jsonify({'success': True, 'outfit': obs_outfit_data['outfit']})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as e:
        print(f"Error getting OBS outfit: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/obs/outfit', methods=['DELETE'])
def clear_obs_outfit():
    """Clear outfit data for OBS overlay"""
    try:
        obs_outfit_data['outfit'] = None
        print("OBS outfit cleared")
        return jsonify({'success': True, 'message': 'OBS outfit cleared'})

    except Exception as e:
        print(f"Error clearing OBS outfit: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
