#!/bin/bash
# Start both the web server and email server

echo "Starting Hannahbunnn's Outfit Creator..."
echo ""

# Start email server in background
echo "Starting email server on port 5000..."
python3 email_server.py &
EMAIL_PID=$!

# Wait a moment for email server to start
sleep 2

# Start web server
echo "Starting web server on port 8000..."
echo ""
echo "✨ Outfit Creator is ready!"
echo "   - Website: http://localhost:8000"
echo "   - Email API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start web server (this will run in foreground)
python3 -m http.server 8000

# When web server stops, also kill email server
kill $EMAIL_PID 2>/dev/null
