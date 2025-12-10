# Environment Variables Setup Guide

This document lists all required and optional environment variables for the Campus Management System Backend.

## Quick Start

1. Create a `.env` file in the project root
2. Copy the variables below and fill in your values
3. Never commit `.env` to version control

---

## Required Environment Variables

### Server Configuration
```env
NODE_ENV=development
PORT=5000
```

### Database (PostgreSQL)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_management
DB_USER=postgres
DB_PASSWORD=your_database_password
```

**Alternative for cloud deployments:**
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

### JWT Authentication
```env
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

### Email Service (NodeMailer)

#### Option 1: Gmail (Recommended for quick setup)
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=Campus Management System <noreply@campus.com>
```

**Gmail App Password Setup:**
1. Go to Google Account → Security → 2-Step Verification
2. Enable 2FA if not already enabled
3. Go to "App Passwords"
4. Generate a new app password for "Mail"
5. Use that 16-character password in `EMAIL_PASSWORD`

#### Option 2: Custom SMTP Server
```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
EMAIL_FROM=Campus System <noreply@yourdomain.com>
```

### Cloudinary (Image Upload)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Cloudinary Setup:**
1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret from the dashboard

### Frontend Configuration
```env
FRONTEND_URL=http://localhost:5173
```

---

## Optional Environment Variables

### CORS Origins
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Rate Limiting
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Logging
```env
LOG_LEVEL=info
```

---

## Email Service Behavior

The email service has a **graceful fallback mechanism**:

- If `EMAIL_USER` and `EMAIL_PASSWORD` are configured → Sends real emails via SMTP
- If not configured → Runs in **mock mode** and logs email content to console

This allows you to:
- Test the system without email configuration
- Develop locally without setting up SMTP
- Switch to production email by simply adding credentials

---

## Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. Use strong, random values for `JWT_SECRET` in production
3. For Gmail, always use App Passwords, never your real password
4. Rotate API keys and secrets regularly
5. Use environment-specific values (dev, staging, production)

---

## Example `.env` File

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_management
DB_USER=postgres
DB_PASSWORD=mySecurePassword123

# JWT
JWT_SECRET=my-super-secret-jwt-key-change-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=campus-system@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=Campus System <noreply@campus-system.com>

# Cloudinary
CLOUDINARY_CLOUD_NAME=my-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## Troubleshooting

### Email not sending
- Check `EMAIL_USER` and `EMAIL_PASSWORD` are correctly set
- For Gmail: Verify you're using an App Password, not your regular password
- Check logs for specific error messages
- Test with: `node -e "console.log(process.env.EMAIL_USER)"`

### Cloudinary upload failing
- Verify all three Cloudinary variables are set
- Check credentials are correct in Cloudinary dashboard
- Ensure file size is under 5MB
- Verify file format is jpg, jpeg, or png

### Database connection issues
- Check PostgreSQL is running
- Verify database exists: `psql -l`
- Test connection: `psql -h localhost -U postgres -d campus_management`
- Check firewall rules if using remote database

---

## Production Checklist

Before deploying to production:

- [ ] Change `NODE_ENV` to `production`
- [ ] Use a strong random `JWT_SECRET` (minimum 32 characters)
- [ ] Configure real SMTP email service
- [ ] Set production `FRONTEND_URL`
- [ ] Use secure database connection (SSL if remote)
- [ ] Verify all Cloudinary credentials
- [ ] Set appropriate rate limits
- [ ] Review and tighten CORS origins
- [ ] Enable database backups
- [ ] Set up monitoring and error tracking