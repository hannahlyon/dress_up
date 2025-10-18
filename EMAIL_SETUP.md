# Email Server Setup

This document explains how to use the "Send to Hannah" feature which automatically sends outfit images via email.

## How It Works

When users click "Send to Hannah" in the Share modal, the outfit image is automatically sent to Hannah's email (hbylyon1@gmail.com) using the configured Gmail account.

## Running Locally

To enable the email feature, you need to run both servers:

1. **Start the web server** (for the website):
   ```bash
   python3 -m http.server 8000
   ```

2. **Start the email server** (for sending emails):
   ```bash
   python3 email_server.py
   ```

The email server runs on port 5000 and handles email sending with attachments.

## Dependencies

Install required Python packages:
```bash
pip3 install -r requirements.txt
```

Required packages:
- flask
- flask-cors
- python-dotenv

## Environment Variables

The `.env` file contains the Gmail credentials:
- `EMAIL_SERVICE`: Email service provider (gmail)
- `EMAIL_USER`: Gmail account for sending emails
- `EMAIL_PASS`: Gmail app password (not regular password)
- `NOTIFICATION_EMAIL`: Destination email (Hannah's email)

## Gmail App Password

The `EMAIL_PASS` in `.env` is a Gmail App Password, not the regular account password. This is more secure and required when using 2FA.

## For Deployment

For GitHub Pages deployment, you'll need to:
1. Deploy the email server to a hosting service (Heroku, Railway, Render, etc.)
2. Update the API endpoint in `script.js` from `http://localhost:5000` to your deployed server URL
3. Ensure CORS is properly configured for your GitHub Pages domain

## Security Note

The `.env` file should never be committed to GitHub. Make sure it's in `.gitignore`.
