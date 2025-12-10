# 🚀 Cloud Deployment - Quick Reference Card

## ⚡ 30-Second Quickstart

```bash
# Option 1: Auto-Deploy to AWS (Recommended)
cd /home/ahsan/Code/chatbot/deployment
chmod +x deploy.sh
./deploy.sh

# Option 2: Test Locally with Docker
cd /home/ahsan/Code/chatbot
docker-compose up -d
# Then visit: http://localhost:8080
```

---

## 📋 Deployment Methods Comparison

| Feature | Docker Compose | Deploy Script | Manual AWS |
|---------|---|---|---|
| **Time** | 2-3 min | 10-15 min | 20-30 min |
| **Effort** | 1 command | Interactive | Multiple steps |
| **Cost** | FREE (local) | FREE (12mo) | FREE (12mo) |
| **Learning** | ⭐⭐ | ⭐ | ⭐⭐⭐ |
| **Best For** | Testing | Deployment | Learning |

---

## 🎯 What Gets Deployed

### **Infrastructure** 
- ✅ VPC (Virtual Private Cloud)
- ✅ EC2 Instance (Ubuntu 20.04)
- ✅ Security Groups (Firewall rules)
- ✅ Elastic IP (Static public IP)

### **Services**
- ✅ Node.js Backend (Port 3000)
- ✅ Nginx Web Server (Port 80/443)
- ✅ MongoDB Database
- ✅ PM2 Process Manager

### **Networking**
- ✅ HTTP/HTTPS traffic allowed
- ✅ SSH access enabled
- ✅ WebSocket support

---

## 💰 Cost Breakdown

```
First 12 Months (AWS Free Tier):
  EC2 t2.micro:    FREE (750 hrs/month)
  Data Transfer:   FREE (100 GB/month)
  CloudFormation:  FREE
  ─────────────────────────────────────
  TOTAL:           FREE ✅

After Free Tier:
  EC2 t2.micro:    $10/month
  Data:            $0.09/GB (after 100GB)
  ─────────────────────────────────────
  TOTAL:           ~$10-20/month
```

---

## 🗂️ Key Files

```
📁 deployment/
  ├── deploy.sh                      ⭐ Use this to deploy
  ├── AWS_DEPLOYMENT_GUIDE.md        📖 Detailed guide
  ├── Dockerfile                     🐳 Container image
  ├── aws-config/
  │   ├── cloudformation.yaml        ☁️  AWS infrastructure
  │   └── ec2_setup_script.sh        🔧 Auto-setup
  └── ecs-task-definition.json       📦 For ECS

📁 .github/
  └── workflows/deploy.yml           🤖 CI/CD pipeline

📄 docker-compose.yml                🐳 Local testing
📄 nginx.conf                        🌐 Web server config
📄 .env.example                      🔐 Environment template
```

---

## 🔐 Security Quick Tips

```bash
# Protect your key file
chmod 400 chatbot-key.pem

# Keep it safe (don't commit to git)
echo "chatbot-key.pem" >> .gitignore

# Rotate keys periodically
aws ec2 create-key-pair --key-name chatbot-key-v2

# Use IAM roles instead of hardcoded credentials
# Store secrets in AWS Secrets Manager
```

---

## 🛠️ Essential Commands

### **Deployment**
```bash
./deploy.sh                          # Interactive deployment
aws cloudformation describe-stacks   # Check status
ssh -i chatbot-key.pem ubuntu@IP    # SSH to instance
```

### **Docker**
```bash
docker-compose up -d                # Start services
docker-compose logs -f              # View logs
docker-compose down                 # Stop services
```

### **Monitoring**
```bash
pm2 logs chatbot                    # App logs
tail -f /var/log/nginx/error.log   # Web server logs
htop                                # System resources
```

### **Database**
```bash
mongo --username admin --password password123  # MongoDB
sudo systemctl status mongodb                  # Service status
```

---

## 📊 Accessing Your Application

### **Local (Docker Compose)**
```
🌐 Frontend:    http://localhost:8080
🔌 API:         http://localhost:3000
🗂️  Database:    mongodb://localhost:27017
```

### **AWS Deployment**
```
🌐 Frontend:    http://YOUR_PUBLIC_IP:8000
🔌 API:         http://YOUR_PUBLIC_IP:3000
📧 SSH:         ssh -i key.pem ubuntu@YOUR_IP
```

### **With Custom Domain**
```
🌐 Frontend:    https://yourdomain.com
🔌 API:         https://api.yourdomain.com
```

---

## 🆘 Quick Troubleshooting

### **Can't Deploy?**
```bash
# Check AWS CLI is installed
aws --version

# Check credentials
aws sts get-caller-identity

# View stack errors
aws cloudformation describe-stack-events --stack-name chatbot-stack
```

### **Can't Connect?**
```bash
# Check instance is running
aws ec2 describe-instances

# Verify security group
aws ec2 describe-security-groups

# Try SSH
ssh -i chatbot-key.pem ubuntu@INSTANCE_IP
```

### **App Not Running?**
```bash
# SSH into instance
ssh -i chatbot-key.pem ubuntu@YOUR_IP

# Check services
pm2 list
systemctl status nginx
systemctl status mongodb

# View logs
pm2 logs chatbot
tail -f /var/log/nginx/error.log
```

---

## 🔄 Common Updates

### **Update Application Code**
```bash
# SSH into instance
ssh -i chatbot-key.pem ubuntu@YOUR_IP

# Pull latest changes
cd /app && git pull origin main

# Restart app
pm2 restart chatbot
```

### **Scale to 2+ Instances**
```bash
# Update CloudFormation with Auto Scaling Group
# Or manually create another instance and load balance
```

### **Setup HTTPS**
```bash
ssh -i chatbot-key.pem ubuntu@YOUR_IP
sudo certbot --nginx -d yourdomain.com
```

### **Increase Instance Size**
```bash
# Update CloudFormation InstanceType parameter
# From t2.micro to t2.small (requires restart)
```

---

## 📈 Performance Checklist

- [ ] Enable Nginx caching
- [ ] Enable gzip compression
- [ ] Optimize database indexes
- [ ] Setup CloudWatch monitoring
- [ ] Configure CDN (CloudFront)
- [ ] Enable connection pooling
- [ ] Setup auto-scaling

---

## 🎓 Learning Resources

```
AWS Docs:        https://docs.aws.amazon.com/
Docker Docs:     https://docs.docker.com/
Node.js Guide:   https://nodejs.org/docs/
MongoDB Docs:    https://docs.mongodb.com/
Nginx Docs:      https://nginx.org/
```

---

## ✅ Pre-Deployment Checklist

- [ ] AWS account created
- [ ] AWS CLI installed & configured
- [ ] Docker installed (optional but helpful)
- [ ] Git ready to push changes
- [ ] Backup of sensitive files
- [ ] Project tested locally

---

## 📞 Need Help?

**Check these files in order:**
1. `DEPLOYMENT_QUICKSTART.md` - Quick overview
2. `AWS_DEPLOYMENT_GUIDE.md` - Detailed guide
3. `deployment/deploy.sh --help` - Script help
4. AWS CloudFormation events - Stack errors

---

## 🎯 Success Metrics

After deployment, verify:
- ✅ Can SSH into EC2 instance
- ✅ Application responds on port 3000
- ✅ Frontend loads in browser
- ✅ Chatbot responds to messages
- ✅ Database persists data
- ✅ Health check returns 200 OK
- ✅ CloudWatch logs showing activity

---

**You're ready to deploy! 🚀**

**Choose one:**
```bash
./deployment/deploy.sh          # ⭐ Recommended: Auto-deploy
docker-compose up -d            # 🐳 Quick: Local test
# Or see AWS_DEPLOYMENT_GUIDE.md # 📖 Detailed: Step by step
```

---

**Estimated Time to Live:**
- Docker: 3 minutes ⚡
- AWS: 15 minutes ⏱️
- Manual: 30 minutes 🔧
