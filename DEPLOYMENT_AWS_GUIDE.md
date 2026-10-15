# DSA Tracker - AWS EC2 Deployment Guide (Complete Step-by-Step)

## 🎯 Overview
This guide will help you deploy your DSA Tracker application on AWS using:
- **EC2** for backend (Node.js API)
- **S3 + CloudFront** for frontend (React)
- **GitHub Actions** for CI/CD
- **Free Tier** eligible services

---

## 💰 AWS Free Tier (First 12 Months)
✅ **What's Free:**
- EC2 t2.micro instance (750 hours/month)
- 5GB S3 storage
- 50GB CloudFront data transfer
- Elastic IP (when attached)

⚠️ **Cost Estimates After Free Tier:**
- EC2 t2.micro: ~$8-10/month
- S3 + CloudFront: ~$1-3/month
- **Total: ~$10-15/month**

---

## 📋 Prerequisites Checklist

### 1. AWS Account Setup
- [ ] Create AWS account (requires credit card, but won't charge if staying in free tier)
- [ ] Enable MFA (Multi-Factor Authentication) for security
- [ ] Create IAM user (don't use root account)

### 2. Local Requirements
- [ ] Git installed
- [ ] GitHub account
- [ ] SSH client (Windows: Git Bash, macOS/Linux: Terminal)
- [ ] Code pushed to GitHub repository

### 3. Application Requirements
- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured
- [ ] MongoDB Atlas database ready
- [ ] All console logs removed ✅

---

## 🚀 PART 1: AWS ACCOUNT & IAM SETUP

### Step 1: Create AWS Account
```
1. Go to: https://aws.amazon.com
2. Click "Create an AWS Account"
3. Fill in:
   - Email address
   - Password
   - Account name: "DSA-Tracker-Production"
4. Choose: Personal Account
5. Enter payment information (won't be charged in free tier)
6. Verify phone number
7. Select "Basic Support - Free"
```

### Step 2: Enable MFA (Security)
```
1. Sign in to AWS Console
2. Click your name (top right) → Security Credentials
3. Scroll to "Multi-factor authentication (MFA)"
4. Click "Assign MFA device"
5. Choose "Virtual MFA device"
6. Use Google Authenticator app or Authy
7. Scan QR code and enter 2 consecutive codes
```

### Step 3: Create IAM User (Don't Use Root!)
```
1. AWS Console → Search "IAM"
2. Click "Users" → "Add users"
3. User name: "dsa-tracker-deployer"
4. Select: "Provide user access to the AWS Management Console"
5. Choose: "I want to create an IAM user"
6. Set custom password
7. Uncheck "User must create new password at next sign-in"
8. Click "Next"

Permissions:
9. Choose "Attach policies directly"
10. Search and select these policies:
    ✅ AmazonEC2FullAccess
    ✅ AmazonS3FullAccess
    ✅ CloudFrontFullAccess
    ✅ IAMReadOnlyAccess
11. Click "Next" → "Create user"
12. Save the login URL and credentials!
```

### Step 4: Create Access Keys for GitHub Actions
```
1. IAM → Users → "dsa-tracker-deployer"
2. Click "Security credentials" tab
3. Scroll to "Access keys"
4. Click "Create access key"
5. Choose "Command Line Interface (CLI)"
6. Check "I understand..." → Next
7. Description: "GitHub Actions CI/CD"
8. Create access key

⚠️ SAVE THESE - YOU'LL ONLY SEE THEM ONCE:
   - Access Key ID: AKIAXXXXXXXXXXXXXXXX
   - Secret Access Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🖥️ PART 2: EC2 INSTANCE SETUP (BACKEND)

### Step 1: Launch EC2 Instance
```
1. AWS Console → Search "EC2"
2. Click "Launch instance"

Configuration:
3. Name: "dsa-tracker-backend"
4. Application and OS Images:
   - Choose "Ubuntu Server 22.04 LTS"
   - Architecture: 64-bit (x86)
   - Free tier eligible ✅

5. Instance type:
   - Choose "t2.micro" (Free tier eligible)
   - 1 vCPU, 1 GB RAM

6. Key pair (login):
   - Click "Create new key pair"
   - Key pair name: "dsa-tracker-key"
   - Key pair type: RSA
   - Private key format: .pem
   - Click "Create key pair"
   - ⚠️ SAVE THIS FILE - You can't download it again!
   - Move to safe location: C:\Users\YourName\.ssh\dsa-tracker-key.pem

7. Network settings:
   - Click "Edit"
   - Auto-assign public IP: Enable
   - Firewall (security groups):
     ✅ Create security group
     Name: "dsa-tracker-backend-sg"
     Description: "Security group for DSA Tracker backend"
     
   - Inbound rules:
     Rule 1: SSH
       - Type: SSH
       - Port: 22
       - Source: My IP (your current IP)
     
     Rule 2: HTTP
       - Type: HTTP
       - Port: 80
       - Source: Anywhere (0.0.0.0/0)
     
     Rule 3: HTTPS
       - Type: HTTPS
       - Port: 443
       - Source: Anywhere (0.0.0.0/0)
     
     Rule 4: Custom TCP (Backend API)
       - Type: Custom TCP
       - Port: 5000
       - Source: Anywhere (0.0.0.0/0)

8. Configure storage:
   - 8 GB gp3 (Free tier eligible: up to 30 GB)
   - Change to 15 GB for more space

9. Click "Launch instance"
10. Wait for "Instance state" to be "Running" (2-3 minutes)
11. Select your instance
12. Copy "Public IPv4 address" (e.g., 54.123.45.67)
```

### Step 2: Allocate Elastic IP (Optional but Recommended)
```
Why? EC2 public IP changes on restart. Elastic IP is permanent and FREE when attached.

1. EC2 Console → Elastic IPs (left sidebar)
2. Click "Allocate Elastic IP address"
3. Click "Allocate"
4. Select the allocated IP
5. Actions → "Associate Elastic IP address"
6. Instance: Select "dsa-tracker-backend"
7. Click "Associate"
8. Note your Elastic IP (e.g., 52.123.45.67)
```

### Step 3: Connect to EC2 Instance

**Windows (Git Bash):**
```bash
# Navigate to where you saved the key
cd ~/.ssh

# Set correct permissions
chmod 400 dsa-tracker-key.pem

# Connect (replace with your Elastic IP or Public IP)
ssh -i dsa-tracker-key.pem ubuntu@52.123.45.67
```

**macOS/Linux:**
```bash
chmod 400 ~/.ssh/dsa-tracker-key.pem
ssh -i ~/.ssh/dsa-tracker-key.pem ubuntu@52.123.45.67
```

You should see:
```
Welcome to Ubuntu 22.04 LTS
...
ubuntu@ip-xxx-xxx-xxx-xxx:~$
```

### Step 4: Install Node.js and Dependencies on EC2
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v  # Should show v18.x.x
npm -v   # Should show 9.x.x

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install nginx (reverse proxy)
sudo apt install -y nginx

# Install git
sudo apt install -y git
```

### Step 5: Setup Application Directory
```bash
# Create directory for your app
sudo mkdir -p /var/www/dsa-tracker
sudo chown -R ubuntu:ubuntu /var/www/dsa-tracker
cd /var/www/dsa-tracker

# Clone your repository (we'll setup GitHub Actions later)
# For now, we'll do manual deployment
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# Navigate to backend
cd Backend

# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Step 6: Configure Environment Variables on EC2
```bash
# Create .env file
nano .env

# Paste this (update with your values):
```

```env
PORT=5000
NODE_ENV=production
APP_ORIGIN=http://YOUR_ELASTIC_IP
BASE_PATH=/api/v1

JWT_SECRET=GENERATE_STRONG_SECRET_HERE
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=GENERATE_DIFFERENT_STRONG_SECRET_HERE
JWT_REFRESH_EXPIRES_IN=30d

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dsa_tracker

EMAIL_URL=your-email-service-url
EMAIL_API_KEY=your-email-api-key

JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-judge0-api-key
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
```

```bash
# Save: Ctrl+X, then Y, then Enter

# Generate strong secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy this for JWT_SECRET

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy this for JWT_REFRESH_SECRET
```

### Step 7: Start Backend with PM2
```bash
# Make sure you're in Backend directory
cd /var/www/dsa-tracker/Backend

# Start with PM2
pm2 start dist/index.js --name dsa-tracker-api

# Check status
pm2 status

# View logs
pm2 logs dsa-tracker-api

# Setup PM2 to start on system boot
pm2 startup
# Copy and run the command it shows

pm2 save

# Test API
curl http://localhost:5000
# Should return: {"message":"🚀 DSA Tracker API - Master Data Structures & Algorithms",...}
```

### Step 8: Configure Nginx Reverse Proxy
```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/dsa-tracker
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name YOUR_ELASTIC_IP;

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend (will add later)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Save and enable configuration
sudo ln -s /etc/nginx/sites-available/dsa-tracker /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Enable nginx on boot
sudo systemctl enable nginx
```

### Step 9: Test Backend API
```bash
# From your local machine:
curl http://YOUR_ELASTIC_IP/api/v1

# Should return the API welcome message
```

---

## 📦 PART 3: FRONTEND DEPLOYMENT (Two Options)

### Option A: Deploy Frontend on Same EC2 (Simpler)

```bash
# SSH into EC2
ssh -i ~/.ssh/dsa-tracker-key.pem ubuntu@YOUR_ELASTIC_IP

cd /var/www/dsa-tracker/Frontend/vms-psi

# Install dependencies
npm install

# Update .env for production
nano .env
```

Update `.env`:
```env
VITE_API_URL=http://YOUR_ELASTIC_IP/api/v1
```

```bash
# Build frontend
npm run build

# Install serve globally
sudo npm install -g serve

# Start frontend with PM2
pm2 start "serve -s dist -l 3000" --name dsa-tracker-frontend

# Save PM2 configuration
pm2 save

# Check status
pm2 status
```

Now visit `http://YOUR_ELASTIC_IP` in your browser!

### Option B: Deploy Frontend on S3 + CloudFront (Better Performance, Free Tier)

**(Skip to Part 4 if you chose Option A)**

#### Step 1: Create S3 Bucket
```
1. AWS Console → S3
2. Click "Create bucket"
3. Bucket name: "dsa-tracker-frontend" (must be unique globally)
4. Region: Select closest to your users
5. Uncheck "Block all public access"
6. Check "I acknowledge..."
7. Click "Create bucket"
```

#### Step 2: Configure S3 for Static Website
```
1. Click your bucket
2. Go to "Properties" tab
3. Scroll to "Static website hosting"
4. Click "Edit"
5. Enable: "Static website hosting"
6. Index document: index.html
7. Error document: index.html
8. Save changes
9. Note the "Bucket website endpoint" URL
```

#### Step 3: Add Bucket Policy
```
1. Go to "Permissions" tab
2. Scroll to "Bucket policy"
3. Click "Edit"
4. Paste this policy (replace BUCKET_NAME):
```

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::BUCKET_NAME/*"
        }
    ]
}
```

#### Step 4: Build and Upload Frontend
```bash
# On your local machine
cd Frontend/vms-psi

# Update .env
echo "VITE_API_URL=http://YOUR_ELASTIC_IP/api/v1" > .env

# Build
npm run build

# Install AWS CLI (if not installed)
# Windows: https://aws.amazon.com/cli/
# macOS: brew install awscli
# Linux: sudo apt install awscli

# Configure AWS CLI
aws configure
# Enter:
# - AWS Access Key ID: (from IAM user)
# - AWS Secret Access Key: (from IAM user)
# - Default region: us-east-1 (or your region)
# - Default output format: json

# Upload to S3
aws s3 sync dist/ s3://dsa-tracker-frontend --delete
```

#### Step 5: Create CloudFront Distribution
```
1. AWS Console → CloudFront
2. Click "Create distribution"
3. Origin domain: Select your S3 bucket website endpoint
4. Origin path: leave empty
5. Name: dsa-tracker-frontend
6. Viewer protocol policy: Redirect HTTP to HTTPS
7. Allowed HTTP methods: GET, HEAD, OPTIONS
8. Cache policy: CachingOptimized
9. Price class: Use only North America and Europe (cheapest)
10. Alternate domain name: (leave empty for now)
11. Default root object: index.html
12. Click "Create distribution"
13. Wait 5-10 minutes for deployment
14. Copy "Distribution domain name" (e.g., d1234abcd.cloudfront.net)
```

#### Step 6: Configure Error Pages (SPA Support)
```
1. Select your distribution
2. Go to "Error pages" tab
3. Click "Create custom error response"
4. HTTP error code: 403
5. Customize error response: Yes
6. Response page path: /index.html
7. HTTP Response code: 200
8. Click "Create"
9. Repeat for error code 404
```

Now visit your CloudFront URL: `https://d1234abcd.cloudfront.net`

---

## 🔄 PART 4: GITHUB ACTIONS CI/CD SETUP

### Step 1: Prepare Repository Structure
```
your-repo/
├── .github/
│   └── workflows/
│       ├── deploy-backend.yml
│       └── deploy-frontend.yml
├── Backend/
├── Frontend/
└── README.md
```

### Step 2: Add GitHub Secrets
```
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"

Add these secrets:
- AWS_ACCESS_KEY_ID: (from IAM user)
- AWS_SECRET_ACCESS_KEY: (from IAM user)
- EC2_HOST: (your Elastic IP)
- EC2_USERNAME: ubuntu
- EC2_SSH_KEY: (paste content of dsa-tracker-key.pem)
- S3_BUCKET: dsa-tracker-frontend (if using S3)
- CLOUDFRONT_DISTRIBUTION_ID: (from CloudFront, if using)
```

### Step 3: Create Backend Deployment Workflow

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to EC2

on:
  push:
    branches: [main]
    paths:
      - 'Backend/**'
      - '.github/workflows/deploy-backend.yml'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies and build
        run: |
          cd Backend
          npm ci
          npm run build
      
      - name: Deploy to EC2
        env:
          PRIVATE_KEY: ${{ secrets.EC2_SSH_KEY }}
          HOST: ${{ secrets.EC2_HOST }}
          USER: ${{ secrets.EC2_USERNAME }}
        run: |
          echo "$PRIVATE_KEY" > private_key.pem
          chmod 600 private_key.pem
          
          # Create deployment package
          cd Backend
          tar -czf ../deploy.tar.gz dist/ package.json package-lock.json
          cd ..
          
          # Copy to EC2
          scp -i private_key.pem -o StrictHostKeyChecking=no \
            deploy.tar.gz ${USER}@${HOST}:/tmp/
          
          # Extract and restart on EC2
          ssh -i private_key.pem -o StrictHostKeyChecking=no ${USER}@${HOST} << 'EOF'
            cd /var/www/dsa-tracker/Backend
            tar -xzf /tmp/deploy.tar.gz
            npm install --production
            pm2 restart dsa-tracker-api
            rm /tmp/deploy.tar.gz
          EOF
          
          rm private_key.pem
      
      - name: Verify deployment
        run: |
          sleep 10
          curl -f http://${{ secrets.EC2_HOST }}/api/v1 || exit 1
```

### Step 4: Create Frontend Deployment Workflow

Create `.github/workflows/deploy-frontend.yml`:

**For EC2 Deployment:**
```yaml
name: Deploy Frontend to EC2

on:
  push:
    branches: [main]
    paths:
      - 'Frontend/**'
      - '.github/workflows/deploy-frontend.yml'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Build frontend
        env:
          VITE_API_URL: http://${{ secrets.EC2_HOST }}/api/v1
        run: |
          cd Frontend/vms-psi
          echo "VITE_API_URL=$VITE_API_URL" > .env
          npm ci
          npm run build
      
      - name: Deploy to EC2
        env:
          PRIVATE_KEY: ${{ secrets.EC2_SSH_KEY }}
          HOST: ${{ secrets.EC2_HOST }}
          USER: ${{ secrets.EC2_USERNAME }}
        run: |
          echo "$PRIVATE_KEY" > private_key.pem
          chmod 600 private_key.pem
          
          # Create deployment package
          cd Frontend/vms-psi
          tar -czf ../../frontend-deploy.tar.gz dist/
          cd ../..
          
          # Copy to EC2
          scp -i private_key.pem -o StrictHostKeyChecking=no \
            frontend-deploy.tar.gz ${USER}@${HOST}:/tmp/
          
          # Extract and restart on EC2
          ssh -i private_key.pem -o StrictHostKeyChecking=no ${USER}@${HOST} << 'EOF'
            cd /var/www/dsa-tracker/Frontend/vms-psi
            rm -rf dist
            tar -xzf /tmp/frontend-deploy.tar.gz
            pm2 restart dsa-tracker-frontend
            rm /tmp/frontend-deploy.tar.gz
          EOF
          
          rm private_key.pem
```

**For S3 + CloudFront Deployment:**
```yaml
name: Deploy Frontend to S3

on:
  push:
    branches: [main]
    paths:
      - 'Frontend/**'
      - '.github/workflows/deploy-frontend.yml'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Build frontend
        env:
          VITE_API_URL: http://${{ secrets.EC2_HOST }}/api/v1
        run: |
          cd Frontend/vms-psi
          echo "VITE_API_URL=$VITE_API_URL" > .env
          npm ci
          npm run build
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: |
          cd Frontend/vms-psi
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

### Step 5: Test CI/CD
```bash
# Make a small change to test
cd Backend/src/index.ts
# Add a comment
git add .
git commit -m "test: CI/CD deployment"
git push origin main

# Check GitHub Actions
# Go to your repo → Actions tab
# Watch the workflow run
```

---

## 🔐 PART 5: SECURITY & OPTIMIZATION

### Step 1: Update Backend .env with Elastic IP
```bash
ssh -i ~/.ssh/dsa-tracker-key.pem ubuntu@YOUR_ELASTIC_IP

cd /var/www/dsa-tracker/Backend
nano .env

# Update:
APP_ORIGIN=http://YOUR_ELASTIC_IP

# Restart
pm2 restart dsa-tracker-api
```

### Step 2: Setup Firewall (UFW)
```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status

# Reload
sudo ufw reload
```

### Step 3: Monitor Application
```bash
# View PM2 logs
pm2 logs

# Monitor resources
pm2 monit

# View specific app logs
pm2 logs dsa-tracker-api --lines 100

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🌐 PART 6: CUSTOM DOMAIN (OPTIONAL)

### Step 1: Buy Domain (Namecheap, GoDaddy, etc.)
```
Example: dsatracker.com
Cost: ~$10-15/year
```

### Step 2: Point Domain to EC2
```
1. Go to your domain provider
2. DNS Management
3. Add A Record:
   - Type: A
   - Host: @
   - Value: YOUR_ELASTIC_IP
   - TTL: Automatic

4. Add www subdomain:
   - Type: CNAME
   - Host: www
   - Value: dsatracker.com
   - TTL: Automatic
```

### Step 3: Setup SSL with Let's Encrypt (Free HTTPS)
```bash
# SSH into EC2
ssh -i ~/.ssh/dsa-tracker-key.pem ubuntu@YOUR_ELASTIC_IP

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d dsatracker.com -d www.dsatracker.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose: Redirect HTTP to HTTPS (option 2)

# Auto-renewal is already setup
# Test renewal:
sudo certbot renew --dry-run
```

---

## 📊 PART 7: MONITORING & MAINTENANCE

### Setup CloudWatch Alarms (Free Tier: 10 alarms)
```
1. AWS Console → CloudWatch
2. Alarms → Create alarm
3. Select metric → EC2 → Per-Instance Metrics
4. Select your instance → CPUUtilization
5. Threshold: Greater than 80%
6. Create new SNS topic
7. Email: your-email@gmail.com
8. Create alarm
```

### Regular Maintenance Tasks
```bash
# Update system packages (monthly)
sudo apt update && sudo apt upgrade -y

# Check disk space
df -h

# Check memory usage
free -h

# Restart PM2 processes if needed
pm2 restart all

# Clean old logs
pm2 flush

# Check PM2 startup script
pm2 startup
pm2 save
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

### Backend
- [ ] API accessible at http://YOUR_IP/api/v1
- [ ] Login works
- [ ] MongoDB connection successful
- [ ] Email service works (test password reset)
- [ ] Reminder service running
- [ ] PM2 running and saved

### Frontend
- [ ] Website loads
- [ ] Can register user
- [ ] Can login
- [ ] Dashboard shows data
- [ ] Study plan creation works
- [ ] Code execution works

### CI/CD
- [ ] GitHub Actions workflows created
- [ ] Secrets added to GitHub
- [ ] Test deployment successful
- [ ] Automatic deployment on push works

### Security
- [ ] Firewall enabled
- [ ] Only necessary ports open
- [ ] Environment variables secure
- [ ] MongoDB IP whitelist configured
- [ ] SSL certificate installed (if using domain)

---

## 💡 COST OPTIMIZATION TIPS

1. **Use Free Tier Wisely**
   - 1 t2.micro instance = 750 hours/month (24/7 for 31 days = 744 hours)
   - You can run ONE instance 24/7 free

2. **Stop Instance When Not Testing**
   ```bash
   # Stop instance (from AWS Console or CLI)
   aws ec2 stop-instances --instance-ids i-1234567890abcdef0
   
   # Start when needed
   aws ec2 start-instances --instance-ids i-1234567890abcdef0
   ```

3. **Use CloudWatch Billing Alerts**
   ```
   1. AWS Console → Billing → Budgets
   2. Create budget
   3. Set threshold: $5
   4. Email alert when exceeded
   ```

4. **Release Elastic IP if Not Using**
   - Unattached Elastic IPs cost $0.005/hour
   - Either attach to instance or release it

---

## 🆘 TROUBLESHOOTING

### Can't SSH to EC2
```bash
# Check security group allows SSH from your IP
# Check key permissions: chmod 400 key.pem
# Try verbose mode:
ssh -v -i key.pem ubuntu@YOUR_IP
```

### API Not Responding
```bash
# SSH into EC2
# Check PM2 status
pm2 status
pm2 logs dsa-tracker-api

# Check if port is listening
sudo netstat -tulpn | grep 5000

# Restart API
pm2 restart dsa-tracker-api
```

### Frontend Not Loading
```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Database Connection Issues
```bash
# Check MongoDB Atlas IP whitelist
# Add EC2 Elastic IP to whitelist
# Or allow access from anywhere: 0.0.0.0/0

# Test connection from EC2
cd /var/www/dsa-tracker/Backend
node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_MONGO_URI').then(() => console.log('Connected')).catch(e => console.error(e))"
```

---

## 🎉 SUCCESS!

Your DSA Tracker is now deployed! 

**Access your application:**
- Backend API: `http://YOUR_ELASTIC_IP/api/v1`
- Frontend: `http://YOUR_ELASTIC_IP`

**Next Steps:**
1. Test all features thoroughly
2. Monitor logs for errors
3. Setup domain name (optional)
4. Share with friends! 🚀

---

## 📞 Quick Reference

**SSH Command:**
```bash
ssh -i ~/.ssh/dsa-tracker-key.pem ubuntu@YOUR_ELASTIC_IP
```

**PM2 Commands:**
```bash
pm2 status              # View all processes
pm2 logs                # View all logs
pm2 restart all         # Restart all apps
pm2 stop all            # Stop all apps
pm2 delete all          # Delete all apps
pm2 save                # Save current list
```

**Useful Paths:**
```
Application: /var/www/dsa-tracker
Nginx Config: /etc/nginx/sites-available/dsa-tracker
PM2 Logs: ~/.pm2/logs/
```

**AWS Console Quick Links:**
- EC2 Instances: https://console.aws.amazon.com/ec2/home#Instances
- S3 Buckets: https://console.aws.amazon.com/s3/home
- CloudFront: https://console.aws.amazon.com/cloudfront/home
- IAM Users: https://console.aws.amazon.com/iam/home#/users

---

Good luck with your deployment! 🚀
