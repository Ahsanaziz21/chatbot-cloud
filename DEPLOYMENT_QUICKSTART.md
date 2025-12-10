# Cloud Deployment Guide - Quick Summary

## 🚀 Quick Start Options

### 1. **Simplest Way: Using Deploy Script** (Recommended)
```bash
cd /home/ahsan/Code/chatbot/deployment
chmod +x deploy.sh
./deploy.sh
```
This interactive script handles everything automatically!

---

## 2. **Using Docker Compose Locally** (Test First)
```bash
cd /home/ahsan/Code/chatbot
docker-compose up -d
```
Then open `http://localhost:8080` in your browser.

**What it sets up:**
- ✅ Backend server on port 3000
- ✅ Frontend on port 8080
- ✅ MongoDB database
- ✅ Nginx reverse proxy

---

## 3. **Manual AWS Deployment** (Step by Step)

### Prerequisites:
```bash
# Install AWS CLI
brew install awscli  # macOS
# or visit: https://aws.amazon.com/cli/

# Configure AWS
aws configure
# Enter your Access Key ID, Secret Access Key, Region (us-east-1), Output (json)

# Create EC2 Key Pair
aws ec2 create-key-pair --key-name chatbot-key --region us-east-1 \
  --query 'KeyMaterial' --output text > chatbot-key.pem
chmod 400 chatbot-key.pem
```

### Deploy using CloudFormation:
```bash
cd /home/ahsan/Code/chatbot

# Create stack
aws cloudformation create-stack \
  --stack-name chatbot-stack \
  --template-body file://deployment/aws-config/cloudformation.yaml \
  --parameters \
    ParameterKey=InstanceType,ParameterValue=t2.micro \
    ParameterKey=Environment,ParameterValue=development \
    ParameterKey=KeyPairName,ParameterValue=chatbot-key \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Monitor deployment
aws cloudformation describe-stacks \
  --stack-name chatbot-stack \
  --region us-east-1
```

### Get your server IP:
```bash
aws cloudformation describe-stacks \
  --stack-name chatbot-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`PublicIP`].OutputValue' \
  --output text \
  --region us-east-1
```

### SSH into your server:
```bash
ssh -i chatbot-key.pem ubuntu@YOUR_PUBLIC_IP
```

---

## 4. **Push to Docker Registry (ECR)**

```bash
# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create ECR repository
aws ecr create-repository \
  --repository-name chatbot-app \
  --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t chatbot-app:latest -f deployment/Dockerfile .

# Tag image
docker tag chatbot-app:latest \
  $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/chatbot-app:latest

# Push to ECR
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/chatbot-app:latest
```

---

## 📊 Cost Breakdown

| Resource | Monthly Cost (Free Tier) | Monthly Cost (Paid) |
|----------|--------------------------|-------------------|
| EC2 t2.micro | FREE (12 months) | ~$10 |
| Data Transfer | FREE (100GB) | ~$0.09/GB |
| CloudFormation | FREE | FREE |
| **Total** | **FREE** | **~$10** |

---

## 📝 Configuration Files Included

| File | Purpose |
|------|---------|
| `cloudformation.yaml` | AWS infrastructure template |
| `ec2_setup_script.sh` | Auto-setup script for EC2 |
| `docker-compose.yml` | Local Docker testing |
| `Dockerfile` | Container image definition |
| `nginx.conf` | Reverse proxy & web server config |
| `ecs-task-definition.json` | For ECS deployment |
| `deploy.sh` | Interactive deployment script |
| `.github/workflows/deploy.yml` | CI/CD pipeline |

---

## 🔐 Security Best Practices

1. **Protect your key file:**
   ```bash
   chmod 400 chatbot-key.pem
   ```

2. **Store secrets securely:**
   - Use AWS Secrets Manager for API keys
   - Use `.env` files only in development
   - Never commit secrets to Git

3. **Update security groups:**
   ```bash
   # Only allow your IP to SSH (replace with your IP)
   aws ec2 authorize-security-group-ingress \
     --group-id sg-xxxxx \
     --protocol tcp \
     --port 22 \
     --cidr YOUR_IP/32
   ```

4. **Enable HTTPS:**
   - After deployment, run: `sudo certbot --nginx -d yourdomain.com`

---

## 🐛 Troubleshooting

### Stack creation fails:
```bash
# Check events
aws cloudformation describe-stack-events \
  --stack-name chatbot-stack \
  --region us-east-1
```

### Can't connect to EC2:
```bash
# Verify security group allows SSH
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Check instance is running
aws ec2 describe-instances --instance-ids i-xxxxx
```

### Application won't start:
```bash
# SSH into instance and check logs
ssh -i chatbot-key.pem ubuntu@YOUR_IP
pm2 logs chatbot
```

### Database issues:
```bash
# Check MongoDB
sudo systemctl status mongodb

# Restart MongoDB
sudo systemctl restart mongodb
```

---

## 📚 Additional Resources

- [AWS CloudFormation Docs](https://docs.aws.amazon.com/cloudformation/)
- [EC2 Getting Started](https://docs.aws.amazon.com/ec2/index.html)
- [Docker Docs](https://docs.docker.com/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-performance/)

---

## ✅ Deployment Checklist

- [ ] AWS account created
- [ ] AWS CLI installed and configured
- [ ] EC2 key pair created
- [ ] CloudFormation stack deployed
- [ ] Stack shows CREATE_COMPLETE status
- [ ] Can SSH into EC2 instance
- [ ] Application running on port 3000
- [ ] Frontend accessible on port 8080
- [ ] API responding to `/health` endpoint
- [ ] Chatbot responds to messages
- [ ] Set up custom domain (optional)
- [ ] Configure SSL/HTTPS (optional)

---

## 🎯 Next Steps After Deployment

1. **Access Your Application**
   ```
   http://YOUR_PUBLIC_IP:8000
   ```

2. **Connect Custom Domain** (Optional)
   - Route 53 → Create hosted zone
   - Create A record pointing to Elastic IP
   - Update application URLs

3. **Setup Monitoring**
   - CloudWatch dashboards
   - Set up alarms for CPU/Memory
   - Enable VPC Flow Logs

4. **Backup Strategy**
   - Enable EBS snapshots
   - Auto-backup database
   - Store database backups in S3

5. **Scale Application** (When Ready)
   - Setup Auto Scaling Group
   - Add Application Load Balancer (ALB)
   - Configure RDS for production DB

---

**Questions?** Check `deployment/AWS_DEPLOYMENT_GUIDE.md` for detailed information!
