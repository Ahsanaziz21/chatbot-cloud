# Cloud Deployment - Complete Setup Summary

## 📋 What We've Set Up

### ✅ Deployment Files Created

```
deployment/
├── Dockerfile                          # Container image for AWS deployment
├── docker-compose.yml                  # Local Docker testing setup
├── nginx.conf                          # Reverse proxy configuration
├── AWS_DEPLOYMENT_GUIDE.md             # Detailed AWS documentation
├── deploy.sh                           # Interactive deployment script ⭐
├── aws-config/
│   ├── cloudformation.yaml             # AWS infrastructure template
│   ├── ec2_setup_script.sh             # Auto-setup for EC2 instances
│   └── ecs-task-definition.json        # ECS container configuration
└── DEPLOYMENT_QUICKSTART.md            # Quick reference guide

.github/
└── workflows/
    └── deploy.yml                      # CI/CD GitHub Actions pipeline

.env.example                            # Environment variables template
```

---

## 🚀 Three Ways to Deploy

### **Option 1: Auto-Deployment Script** ⭐ (EASIEST)
```bash
cd /home/ahsan/Code/chatbot/deployment
chmod +x deploy.sh
./deploy.sh
```
**What it does:**
- ✅ Checks AWS CLI is installed
- ✅ Creates EC2 key pair
- ✅ Deploys CloudFormation stack
- ✅ Monitors deployment progress
- ✅ Provides SSH connection details
- ✅ Shows application URL

**Time: 10-15 minutes**

---

### **Option 2: Local Docker Testing** (FASTEST)
```bash
cd /home/ahsan/Code/chatbot
docker-compose up -d
```
**Access:**
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000`
- MongoDB: `mongodb://admin:password123@localhost:27017`

**Time: 2-3 minutes**

**Includes:**
- ✅ MongoDB database
- ✅ Node.js backend
- ✅ Nginx proxy
- ✅ Health checks

---

### **Option 3: Manual AWS Deployment** (MOST CONTROL)

**Step 1: Prerequisites**
```bash
# Install AWS CLI
aws --version

# Configure credentials
aws configure
```

**Step 2: Create Key Pair**
```bash
aws ec2 create-key-pair --key-name chatbot-key \
  --query 'KeyMaterial' --output text > chatbot-key.pem
chmod 400 chatbot-key.pem
```

**Step 3: Deploy CloudFormation**
```bash
aws cloudformation create-stack \
  --stack-name chatbot-stack \
  --template-body file://deployment/aws-config/cloudformation.yaml \
  --parameters \
    ParameterKey=InstanceType,ParameterValue=t2.micro \
    ParameterKey=KeyPairName,ParameterValue=chatbot-key \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

**Step 4: Monitor Deployment**
```bash
aws cloudformation describe-stacks \
  --stack-name chatbot-stack \
  --region us-east-1 \
  --query 'Stacks[0].StackStatus'
```

**Step 5: Get Server IP**
```bash
aws cloudformation describe-stacks \
  --stack-name chatbot-stack \
  --query 'Stacks[0].Outputs' \
  --region us-east-1
```

**Step 6: SSH Access**
```bash
ssh -i chatbot-key.pem ubuntu@YOUR_PUBLIC_IP
```

**Time: 15-20 minutes**

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Internet Users                     │
└────────────┬────────────────────────────────────────┘
             │ HTTPS/HTTP
             ▼
    ┌────────────────┐
    │  Elastic IP    │
    └────────┬───────┘
             │
             ▼
    ┌──────────────────┐
    │  AWS Security    │
    │    Group         │
    └────────┬─────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │     EC2 Instance (t2.micro)         │
    │  ┌──────────────────────────────┐   │
    │  │ Nginx (Reverse Proxy)        │   │
    │  │ - Port 80/443                │   │
    │  │ - SSL termination            │   │
    │  │ - Static file serving        │   │
    │  └──────────┬───────────────────┘   │
    │             │                       │
    │  ┌──────────▼───────────────────┐   │
    │  │ Node.js Backend Server       │   │
    │  │ - Port 3000                  │   │
    │  │ - Express.js API             │   │
    │  │ - WebSocket support          │   │
    │  │ - Chatbot logic              │   │
    │  └──────────┬───────────────────┘   │
    │             │                       │
    │  ┌──────────▼───────────────────┐   │
    │  │ MongoDB Database             │   │
    │  │ - Port 27017                 │   │
    │  │ - Message history            │   │
    │  │ - User sessions              │   │
    │  └──────────────────────────────┘   │
    │                                     │
    │ VPC: 10.0.0.0/16                   │
    │ Subnet: 10.0.1.0/24                │
    └─────────────────────────────────────┘
             │
             ▼
    ┌──────────────────────┐
    │   AWS CloudWatch     │
    │  - Monitoring        │
    │  - Logs              │
    │  - Alarms            │
    └──────────────────────┘
```

---

## 📊 AWS Resources Created

| Resource | Details | Cost |
|----------|---------|------|
| **EC2 Instance** | t2.micro (1GB RAM, 1vCPU) | FREE (12 months) |
| **VPC** | 10.0.0.0/16 with 1 subnet | FREE |
| **Security Group** | Inbound rules for HTTP/SSH | FREE |
| **Elastic IP** | Static public IP | FREE (if associated) |
| **Data Transfer** | Up to 100GB/month | FREE (12 months) |
| **CloudFormation** | Infrastructure as Code | FREE |
| **CloudWatch** | Basic metrics & logs | FREE (within limits) |
| **Total** | | **FREE** ✅ |

**After 12-month free tier: ~$10-15/month**

---

## 🔒 Security Features Included

✅ **Network Security**
- VPC isolation
- Security groups with restricted access
- Elastic IP for consistent access

✅ **Application Security**
- CORS enabled
- Rate limiting configured
- Security headers in Nginx

✅ **Data Protection**
- Database password protected
- Environment variables for secrets
- AWS Secrets Manager ready

✅ **Monitoring**
- CloudWatch integration
- Health checks on containers
- Application logging

---

## 📱 Accessing Your Application

### **Local Testing (Docker Compose)**
```
Frontend:   http://localhost:8080
Backend:    http://localhost:3000
API:        http://localhost:3000/api/messages
Health:     http://localhost:3000/health
```

### **AWS Deployment**
```
Frontend:   http://YOUR_PUBLIC_IP:8000
Backend:    http://YOUR_PUBLIC_IP:3000
API:        http://YOUR_PUBLIC_IP:3000/api/messages
```

### **With Custom Domain** (After setup)
```
Frontend:   https://yourdomain.com
Backend:    https://api.yourdomain.com
```

---

## 🛠️ Useful Commands Reference

### **Docker Compose**
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend

# Rebuild containers
docker-compose build --no-cache

# Scale services
docker-compose up -d --scale frontend=3
```

### **AWS CloudFormation**
```bash
# Create stack
aws cloudformation create-stack --stack-name chatbot-stack \
  --template-body file://deployment/aws-config/cloudformation.yaml

# List stacks
aws cloudformation list-stacks --region us-east-1

# Describe stack
aws cloudformation describe-stacks --stack-name chatbot-stack

# Delete stack
aws cloudformation delete-stack --stack-name chatbot-stack

# Get outputs
aws cloudformation describe-stacks \
  --query 'Stacks[0].Outputs' \
  --stack-name chatbot-stack
```

### **EC2 Management**
```bash
# List instances
aws ec2 describe-instances

# SSH into instance
ssh -i chatbot-key.pem ubuntu@YOUR_IP

# Get instance details
aws ec2 describe-instances --query 'Reservations[0].Instances[0]'

# Stop instance
aws ec2 stop-instances --instance-ids i-xxxxx

# Start instance
aws ec2 start-instances --instance-ids i-xxxxx

# Terminate instance
aws ec2 terminate-instances --instance-ids i-xxxxx
```

### **On EC2 Instance**
```bash
# View logs
pm2 logs chatbot

# Monitor resources
htop

# Check services
systemctl status nginx
systemctl status mongodb

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔧 Customization Options

### **Change Instance Size**
Edit `cloudformation.yaml`:
```yaml
InstanceType:
  Default: t2.small  # or t2.medium, t3.micro, etc.
```

### **Change Region**
```bash
./deploy.sh  # Will prompt for region
# Or use: --region eu-west-1
```

### **Add Environment Variables**
Create `server/.env`:
```env
DATABASE_URL=mongodb+srv://...
API_KEY=your_api_key
ENABLE_FEATURE=true
```

### **Enable HTTPS**
On EC2 instance:
```bash
sudo certbot --nginx -d yourdomain.com
```

---

## 📈 Scaling for Production

### **When You Need More Power**

1. **Upgrade Instance Type**
   ```bash
   # Change t2.micro to t3.small (more resources)
   aws cloudformation update-stack ...
   ```

2. **Add Load Balancer**
   ```bash
   # Configure AWS Application Load Balancer (ALB)
   # Distribute traffic across multiple instances
   ```

3. **Auto-Scaling Group**
   ```bash
   # Automatically scale based on CPU/Memory
   # Min: 1, Max: 5 instances
   ```

4. **RDS Database**
   ```bash
   # Use AWS RDS instead of self-hosted MongoDB
   # Automatic backups, high availability
   ```

5. **CloudFront CDN**
   ```bash
   # Cache static assets globally
   # Faster content delivery
   ```

---

## 📞 Support & Troubleshooting

### **Quick Fixes**

**Stack Creation Failed:**
```bash
# Check events
aws cloudformation describe-stack-events --stack-name chatbot-stack

# Check CloudFormation logs
# AWS Console → CloudFormation → Events tab
```

**Can't SSH to Instance:**
```bash
# Verify security group allows SSH from your IP
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Check instance is running
aws ec2 describe-instances --filters "Name=instance-state-name,Values=running"
```

**Application Not Responsive:**
```bash
# SSH into instance
ssh -i chatbot-key.pem ubuntu@YOUR_IP

# Check services
pm2 list
pm2 logs chatbot
sudo systemctl status nginx
```

**Database Connection Issues:**
```bash
# On EC2 instance
sudo systemctl status mongodb
sudo systemctl restart mongodb

# Test connection
mongo --username admin --password password123
```

---

## 🎯 Next Steps After Deployment

1. ✅ **Test Application**
   - Open in browser
   - Send test messages
   - Verify API responses

2. 📝 **Configure Domain Name** (Optional)
   - Buy domain (GoDaddy, Namecheap, etc.)
   - Update Route 53 in AWS
   - Point to Elastic IP

3. 🔐 **Setup HTTPS**
   - Install Let's Encrypt certificate
   - Configure Nginx for SSL
   - Redirect HTTP to HTTPS

4. 📊 **Enable Monitoring**
   - Setup CloudWatch dashboards
   - Configure alarms for high CPU/memory
   - Enable detailed logging

5. 💾 **Setup Backups**
   - Enable EBS snapshots
   - Configure automated backups
   - Test restore process

6. 🚀 **Optimize Performance**
   - Enable compression
   - Setup caching
   - Optimize database queries

---

## 📚 Key Files Reference

| File | Purpose | Edit For |
|------|---------|----------|
| `cloudformation.yaml` | AWS infrastructure | Instance type, region, VPC settings |
| `ec2_setup_script.sh` | EC2 initialization | Dependencies, startup commands |
| `Dockerfile` | Container image | Base image, dependencies |
| `docker-compose.yml` | Local testing | Port mappings, environment vars |
| `nginx.conf` | Web server config | Domains, SSL, caching, compression |
| `deploy.sh` | Deployment automation | Stack name, region, defaults |
| `.env.example` | Configuration template | Environment variables |

---

## 🏁 Deployment Checklist

### Pre-Deployment
- [ ] AWS account created
- [ ] AWS CLI installed: `aws --version`
- [ ] AWS credentials configured: `aws configure`
- [ ] Docker installed (for testing): `docker --version`

### During Deployment
- [ ] CloudFormation stack created
- [ ] Stack shows CREATE_COMPLETE status
- [ ] Elastic IP assigned
- [ ] Security groups configured

### Post-Deployment
- [ ] Can SSH into instance
- [ ] Node.js running: `ps aux | grep node`
- [ ] MongoDB started: `sudo systemctl status mongodb`
- [ ] Nginx running: `sudo systemctl status nginx`
- [ ] API responding: `curl http://YOUR_IP:3000/health`
- [ ] Frontend loading: `curl http://YOUR_IP:8000`
- [ ] Chatbot responding to messages

### Production Readiness
- [ ] HTTPS configured
- [ ] CloudWatch monitoring enabled
- [ ] Automated backups enabled
- [ ] DNS/domain configured
- [ ] Error logging setup
- [ ] Performance optimized

---

## 💡 Pro Tips

1. **Use AWS free tier calculator** to estimate costs
2. **Enable billing alerts** to avoid surprises
3. **Document your setup** for future reference
4. **Use tags** on AWS resources for easy management
5. **Setup IAM roles** instead of hardcoding credentials
6. **Enable VPC Flow Logs** for security monitoring
7. **Use AWS Secrets Manager** for sensitive data
8. **Schedule daily backups** of database
9. **Test disaster recovery** regularly
10. **Monitor CloudWatch logs** for issues

---

## 📖 Additional Resources

- **AWS CloudFormation:** https://docs.aws.amazon.com/cloudformation/
- **EC2 User Guide:** https://docs.aws.amazon.com/ec2/
- **Docker Docs:** https://docs.docker.com/
- **Node.js Deployment:** https://nodejs.org/en/docs/guides/
- **MongoDB Cloud:** https://www.mongodb.com/cloud/atlas
- **Let's Encrypt:** https://letsencrypt.org/

---

**You're all set! 🎉 Choose your deployment method and get your chatbot live!**

**Questions?** Check the detailed guides:
- `deployment/AWS_DEPLOYMENT_GUIDE.md` - Complete AWS guide
- `DEPLOYMENT_QUICKSTART.md` - Quick reference
- `deployment/deploy.sh` - Interactive script help
