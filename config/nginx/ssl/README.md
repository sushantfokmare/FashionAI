# SSL Certificates Directory

Place your SSL certificates here for HTTPS support.

## Required Files (for production with HTTPS):

- `fullchain.pem` - Full certificate chain
- `privkey.pem` - Private key

## Getting SSL Certificates:

### Option 1: Let's Encrypt (Free, Recommended)
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate for your domain
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to this directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./
```

### Option 2: Self-Signed Certificate (Development/Testing)
```bash
# Generate self-signed certificate (valid for 365 days)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

### Option 3: Commercial SSL Provider
Purchase from providers like Namecheap, DigiCert, or GoDaddy and place the files here.

## File Permissions:
```bash
chmod 600 privkey.pem
chmod 644 fullchain.pem
```

**Note:** This directory is gitignored for security. Never commit SSL certificates to version control.
