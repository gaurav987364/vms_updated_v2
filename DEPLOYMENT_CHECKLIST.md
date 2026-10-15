# 🚀 DSA Tracker Deployment - Quick Checklist

## ⏱️ Estimated Time: 2-3 hours (first time)

---

## 📋 Phase 1: AWS Account Setup (30 minutes)

- [ ] Create AWS account
- [ ] Enable MFA on root account
- [ ] Create IAM user: `dsa-tracker-deployer`
- [ ] Attach permissions: EC2, S3, CloudFront
- [ ] Create access keys for GitHub Actions
- [ ] **Save credentials securely!**

---

## 🖥️ Phase 2: EC2 Backend Setup (45 minutes)

- [ ] Launch EC2 t2.micro instance (Ubuntu 22.04)
- [ ] Name: `dsa-tracker-backend`
- [ ] Create & download key pair: `dsa-tracker-key.pem`
- [ ] Configure security group (ports: 22, 80, 443, 5000)
- [ ] Allocate Elastic IP
- [ ] Associate Elastic IP with instance
- [ ] **Save Elastic IP:** ___________________

### SSH Connection
- [ ] Set key permissions: `chmod 400 dsa-tracker-key.pem`
- [ ] Test SSH connection
- [ ] Install Node.js 18
- [ ] Install PM2
- [ ] Install Nginx
- [ ] Install Git

### Application Deployment
- [ ] Clone repository to `/var/www/dsa-tracker`
- [ ] Create `.env` file with production values
- [ ] Install backend dependencies
- [ ] Build TypeScript: `npm run build`
- [ ] Start with PM2: `pm2 start dist/index.js --name dsa-tracker-api`
- [ ] Configure PM2 startup: `pm2 startup` → `pm2 save`
- [ ] Configure Nginx reverse proxy
- [ ] Test API: `curl http://localhost:5000`

---

## 🌐 Phase 3: Frontend Setup (30 minutes)

### Option A: EC2 Hosting (Simpler)
- [ ] Build frontend on EC2
- [ ] Update `.env`: `VITE_API_URL=http://YOUR_ELASTIC_IP/api/v1`
- [ ] Install serve: `sudo npm install -g serve`
- [ ] Start with PM2: `pm2 start "serve -s dist -l 3000" --name dsa-tracker-frontend`
- [ ] Save PM2: `pm2 save`
- [ ] Test: Visit `http://YOUR_ELASTIC_IP`

### Option B: S3 + CloudFront (Better)
- [ ] Create S3 bucket: `dsa-tracker-frontend`
- [ ] Enable static website hosting
- [ ] Add bucket policy (public read)
- [ ] Build frontend locally
- [ ] Configure AWS CLI
- [ ] Upload to S3: `aws s3 sync dist/ s3://dsa-tracker-frontend`
- [ ] Create CloudFront distribution
- [ ] Configure error pages for SPA
- [ ] **Save CloudFront URL:** ___________________

---

## 🔄 Phase 4: GitHub Actions CI/CD (30 minutes)

### Add GitHub Secrets
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `EC2_HOST` (your Elastic IP)
- [ ] `EC2_USERNAME` (ubuntu)
- [ ] `EC2_SSH_KEY` (content of .pem file)
- [ ] `S3_BUCKET` (if using S3)
- [ ] `CLOUDFRONT_DISTRIBUTION_ID` (if using CloudFront)

### Create Workflows
- [ ] Create `.github/workflows/deploy-backend.yml`
- [ ] Create `.github/workflows/deploy-frontend.yml`
- [ ] Commit and push to GitHub
- [ ] Watch workflows run in Actions tab
- [ ] Verify deployment successful

---

## 🔐 Phase 5: Security & Final Setup (15 minutes)

- [ ] Update backend `.env` with Elastic IP in `APP_ORIGIN`
- [ ] Restart backend: `pm2 restart dsa-tracker-api`
- [ ] Enable UFW firewall
- [ ] Configure firewall rules (22, 80, 443)
- [ ] Test all features end-to-end

---

## ✅ Phase 6: Verification (15 minutes)

### Backend Tests
- [ ] API responds: `http://YOUR_IP/api/v1`
- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens working
- [ ] MongoDB connected
- [ ] Email service works (password reset)
- [ ] Study plan CRUD works

### Frontend Tests
- [ ] Website loads
- [ ] Login page accessible
- [ ] Can register account
- [ ] Can login
- [ ] Dashboard loads with data
- [ ] Study plan creation works
- [ ] Calendar view works
- [ ] Profile page works
- [ ] Responsive design works

### CI/CD Tests
- [ ] Make small code change
- [ ] Commit and push
- [ ] GitHub Actions runs
- [ ] Deployment successful
- [ ] Changes visible on live site

---

## 📊 Phase 7: Monitoring Setup (10 minutes)

- [ ] Setup CloudWatch alarm for CPU
- [ ] Setup CloudWatch alarm for disk
- [ ] Configure billing alert ($5 threshold)
- [ ] Test PM2 monitoring: `pm2 monit`
- [ ] Check logs: `pm2 logs`

---

## 🌐 Optional: Custom Domain (30 minutes)

- [ ] Purchase domain name
- [ ] Add A record pointing to Elastic IP
- [ ] Update Nginx configuration with domain
- [ ] Install Let's Encrypt SSL
- [ ] Force HTTPS redirect
- [ ] Update `APP_ORIGIN` in backend `.env`
- [ ] Update `VITE_API_URL` in frontend
- [ ] Redeploy both frontend and backend
- [ ] Test HTTPS site

---

## 💰 Cost Tracking

### Free Tier (First 12 Months)
- ✅ EC2 t2.micro: 750 hours/month
- ✅ S3: 5GB storage
- ✅ CloudFront: 50GB data transfer
- ✅ Elastic IP: Free when attached

### After Free Tier
- 💵 EC2: ~$8-10/month
- 💵 S3 + CloudFront: ~$1-3/month
- 💵 Domain (optional): ~$10-15/year
- 💵 **Total: ~$10-15/month**

---

## 🆘 Emergency Commands

### Access EC2
```bash
ssh -i ~/.ssh/dsa-tracker-key.pem ubuntu@YOUR_ELASTIC_IP
```

### Check Status
```bash
pm2 status
sudo systemctl status nginx
sudo ufw status
```

### View Logs
```bash
pm2 logs dsa-tracker-api --lines 100
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
pm2 restart all
sudo systemctl restart nginx
```

### Stop/Start EC2 (to save costs)
```bash
# AWS Console → EC2 → Instance State → Stop
# To start: Instance State → Start
```

---

## 📱 Contact Info to Save

- **AWS Account Email:** ___________________
- **IAM User:** dsa-tracker-deployer
- **Elastic IP:** ___________________
- **CloudFront URL:** ___________________
- **Domain (if purchased):** ___________________
- **MongoDB Atlas:** ___________________

---

## 🎉 Deployment Complete!

Once all checkboxes are ticked:
1. Your app is live on AWS
2. CI/CD pipeline is active
3. Auto-deployment on git push
4. Monitoring is setup
5. Secured with firewall

**Share your app:**
- http://YOUR_ELASTIC_IP (or your domain)

**Monitor costs:**
- AWS Console → Billing Dashboard

---

## 📚 References

- Full Guide: See `DEPLOYMENT_AWS_GUIDE.md`
- AWS Free Tier: https://aws.amazon.com/free
- PM2 Docs: https://pm2.keymetrics.io
- Let's Encrypt: https://letsencrypt.org

---

**Questions? Issues?**
1. Check logs first: `pm2 logs`
2. Refer to Troubleshooting section in main guide
3. Check AWS service health dashboard

Good luck! 🚀
