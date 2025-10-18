#!/usr/bin/env python3
"""
Email server for sending outfit images to Hannah
"""
import os
import base64
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
CORS(app)  # Enable CORS for all routes

@app.route('/send-outfit', methods=['POST'])
def send_outfit():
    """Send outfit image via email to Hannah"""
    try:
        # Get the image data from the request
        data = request.json
        image_data = data.get('image')

        if not image_data:
            return jsonify({'success': False, 'error': 'No image data provided'}), 400

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

        return jsonify({'success': True, 'message': 'Outfit sent to Hannah successfully!'})

    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
