# Security Features

This document outlines the security measures implemented to protect the email server from spam and abuse.

## Security Measures Implemented

### 1. **Rate Limiting**
Prevents users from sending too many emails:
- **Per Minute Limit**: Maximum 2 requests per minute per IP address
- **Per Hour Limit**: Maximum 10 requests per hour per IP address
- **Automatic Cleanup**: Old entries are automatically removed after 1 hour

If limits are exceeded, users receive a clear error message:
- "Too many requests. Please wait a minute."
- "Too many requests. Please try again later."

### 2. **CORS (Cross-Origin Resource Sharing) Restrictions**
Only allows requests from authorized domains:
- `https://dressup.hannahbunnn.com` (production)
- `http://localhost:8000` (local development)
- `http://127.0.0.1:8000` (local development)

Any requests from other domains are automatically blocked.

### 3. **Domain Verification**
Double-checks the request origin by verifying:
- **Origin Header**: Checks the origin of the request
- **Referer Header**: Validates the referring page

Returns `403 Unauthorized origin` error if verification fails.

### 4. **API Authentication**
Requires a secret token in request headers:
- Token is stored as `API_SECRET` environment variable on Heroku
- Frontend must include `X-API-Secret` header with valid token
- Returns `401 Invalid authentication` if token is missing or incorrect

**Note**: The API secret is hardcoded in the frontend JavaScript, which is acceptable for this use case since:
- The secret alone isn't enough (rate limiting + domain verification are also in place)
- The email endpoint only sends to a single hardcoded recipient
- The worst case is someone could send emails on your behalf (but still limited by rate limits)

### 5. **Request Size Limits**
Prevents abuse through large file uploads:
- Maximum image size: 10MB
- Returns `413 Image too large` error if exceeded

### 6. **IP-Based Tracking**
Tracks requests by IP address:
- Works behind Heroku's proxy (reads `X-Forwarded-For` header)
- Stores timestamps of recent requests
- Automatically cleans up old data

## Rate Limit Examples

### Normal Usage (Allowed)
- User sends 1 outfit → ✅ Success
- Waits 30 seconds → ✅ Can send another
- Sends 2 more within an hour → ✅ Success (3 total)

### Spam Attempt (Blocked)
- User sends 1 outfit → ✅ Success
- Immediately sends another → ✅ Success
- Tries to send a 3rd within 1 minute → ❌ Blocked ("Please wait a minute")
- After waiting 1 minute, sends 3rd → ✅ Success
- Continues and reaches 10 emails in an hour → ❌ Blocked ("Try again later")

## Error Codes

- `400` - Bad Request (missing image data)
- `401` - Unauthorized (invalid API secret)
- `403` - Forbidden (unauthorized origin)
- `413` - Payload Too Large (image too big)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error (email sending failed)

## Environment Variables

Required on Heroku:
- `EMAIL_SERVICE`: Email service provider (gmail)
- `EMAIL_USER`: Gmail account for sending
- `EMAIL_PASS`: Gmail app password
- `NOTIFICATION_EMAIL`: Recipient email (Hannah's email)
- `API_SECRET`: Authentication token

## Additional Security Recommendations

For even stronger security, consider:

1. **Use a more secure secret storage**: Store the API secret in backend only and use session tokens
2. **Add CAPTCHA**: Prevent automated bots (e.g., hCaptcha, reCAPTCHA)
3. **Email verification**: Require sender to verify their email
4. **Admin dashboard**: Monitor and block abusive IPs
5. **Database storage**: Use Redis or PostgreSQL for persistent rate limiting across server restarts

## Monitoring

To monitor for abuse, check Heroku logs:
```bash
heroku logs --tail -a dressup-email-server
```

Look for patterns of:
- Multiple `429` errors from same IP
- Repeated `403` errors (someone trying different origins)
- High volume of requests in short time

## Current Limitations

The rate limiting is **in-memory**, which means:
- Resets when the Heroku dyno restarts
- Not shared across multiple server instances (if you scale up)
- For better persistence, upgrade to Redis-based rate limiting

For your current use case (personal project with limited traffic), these security measures are more than sufficient!
