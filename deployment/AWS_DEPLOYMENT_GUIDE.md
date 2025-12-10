# AWS Cloud Deployment Guide - Cloud-Based Chatbot System

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Option 1: CloudFormation Deployment](#option-1-cloudformation-deployment)
4. [Option 2: Docker Deployment](#option-2-docker-deployment)
5. [Option 3: Manual EC2 Deployment](#option-3-manual-ec2-deployment)
6. [Post-Deployment](#post-deployment)

---

## Prerequisites

### Required Tools
- AWS CLI v2 installed and configured
- AWS Account with appropriate permissions
- Docker (optional, for containerization)
- Git (for cloning the repository)

### AWS Setup
1. Create an AWS Account at https://aws.amazon.com
2. Create an IAM user with programmatic access
3. Configure AWS CLI:
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Enter your preferred region (e.g., us-east-1)
   # Enter output format (json)
   ```

4. Create an EC2 Key Pair:
   ```bash
   aws ec2 create-key-pair --key-name chatbot-key --region us-east-1 \
     --query 'KeyMaterial' --output text > chatbot-key.pem
   chmod 400 chatbot-key.pem
   ```

---

## Deployment Options

### Quick Comparison

| Method | Complexity | Cost | Time | Best For |
|--------|-----------|------|------|----------|
| CloudFormation | Medium | Low ($0.50-2/month) | 10-15 min | Production |
| Docker | Low-Medium | Low | 5-10 min | Testing/Staging |
| Manual EC2 | High | Low | 20-30 min | Learning |

---

## Option 1: CloudFormation Deployment ⭐ (Recommended)

### Step 1: Prepare the Stack
```bash
cd /home/ahsan/Code/chatbot/deployment/aws-config
```

### Step 2: Deploy Using CloudFormation

**Via AWS Console:**
1. Go to AWS CloudFormation Console
2. Click "Create Stack"
3. Upload `cloudformation.yaml`
4. Fill in parameters:
   - **InstanceType**: t2.micro (free tier eligible)
   - **Environment**: development/staging/production
   - **KeyPairName**: chatbot-key (create if not exists)
5. Click "Create Stack"
6. Wait for stack creation (5-10 minutes)

**Via AWS CLI:**
```bash
aws cloudformation create-stack \
  --stack-name chatbot-stack \
  --template-body file://cloudformation.yaml \
  --parameters \
    ParameterKey=InstanceType,ParameterValue=t2.micro \
    ParameterKey=Environment,ParameterValue=development \
    ParameterKey=KeyPairName,ParameterValue=chatbot-key \
  --region us-east-1
```

### Step 3: Monitor Stack Creation
```bash
# Watch stack creation progress
aws cloudformation describe-stacks \
  --stack-name chatbot-stack \
  --region us-east-1

# Get stack outputs
aws cloudformation describe-stacks \
  --stack-name chatbot-stack \
  --query 'Stacks[0].Outputs' \
  --region us-east-1
```

### Step 4: Connect to EC2 Instance
```bash
# Get Public IP from CloudFormation outputs
PUBLIC_IP=$(aws cloudformation describe-stacks \
  --stack-name chatbot-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`PublicIP`].OutputValue' \
  --output text \
  --region us-east-1)

# SSH into instance
ssh -i chatbot-key.pem ubuntu@$PUBLIC_IP
```

---

## Option 2: Docker Deployment

### Step 1: Build Docker Image
```bash
cd /home/ahsan/Code/chatbot
docker build -t chatbot-app:latest -f deployment/Dockerfile .
```

### Step 2: Push to AWS ECR (Elastic Container Registry)

```bash
# Create ECR repository
aws ecr create-repository \
  --repository-name chatbot-app \
  --region us-east-1

# Get login token
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag chatbot-app:latest \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/chatbot-app:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/chatbot-app:latest
```

### Step 3: Deploy on ECS (Elastic Container Service)

Create a task definition:
```bash
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json
```

---

## Option 3: Manual EC2 Deployment

### Step 1: Launch EC2 Instance
```bash
# Launch Ubuntu 20.04 LTS instance
aws ec2 run-instances \
  --image-id ami-0885b1f6bd170450c \
  --instance-type t2.micro \
  --key-name chatbot-key \
  --security-groups chatbot-sg \
  --user-data file://ec2_setup_script.sh \
  --region us-east-1
```

### Step 2: Configure Security Group
```bash
aws ec2 authorize-security-group-ingress \
  --group-name chatbot-sg \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name chatbot-sg \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name chatbot-sg \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name chatbot-sg \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0
```

### Step 3: SSH and Deploy
```bash
# Get instance IP
INSTANCE_IP=$(aws ec2 describe-instances \
  --filters "Name=key-name,Values=chatbot-key" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

# SSH into instance
ssh -i chatbot-key.pem ubuntu@$INSTANCE_IP

# On the instance, run setup script
bash /var/lib/cloud/instance/scripts/part-001
```

---

## Post-Deployment

### Step 1: Access Your Application

```bash
# Get the application URL from CloudFormation outputs
APPLICATION_URL=$(aws cloudformation describe-stacks \
  --stack-name chatbot-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApplicationURL`].OutputValue' \
  --output text \
  --region us-east-1)

echo "Access your chatbot at: $APPLICATION_URL"
```

### Step 2: Configure Custom Domain (Optional)

1. Go to Route 53 Console
2. Create a hosted zone for your domain
3. Create an A record pointing to the Elastic IP
4. Update application URL in client code

### Step 3: Setup SSL/HTTPS

**On EC2 instance:**
```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Request certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

### Step 4: Monitor and Logs

```bash
# SSH into instance
ssh -i chatbot-key.pem ubuntu@$INSTANCE_IP

# View application logs
pm2 logs chatbot

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Monitor system resources
htop
```

### Step 5: Setup Auto-Scaling (Production)

```bash
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name chatbot-asg \
  --launch-configuration-name chatbot-lc \
  --min-size 1 \
  --max-size 5 \
  --desired-capacity 2
```

---

## Costs Estimation

### Free Tier (First 12 months)
- **EC2**: t2.micro (750 hours/month) - FREE
- **Data Transfer**: 100 GB/month - FREE
- **CloudFormation**: FREE

### After Free Tier
- **EC2 t2.micro**: ~$10/month
- **Data Transfer**: ~$0.09 per GB (after free tier)
- **MongoDB Atlas** (if used): Starting at $0/month (free tier)
- **Total**: ~$10-20/month

---

## Troubleshooting

### Stack Creation Failed
```bash
# Check stack events
aws cloudformation describe-stack-events \
  --stack-name chatbot-stack \
  --region us-east-1
```

### Can't Connect to EC2
```bash
# Verify security group rules
aws ec2 describe-security-groups \
  --group-ids sg-xxxxxxxxx \
  --region us-east-1
```

### Application Not Running
```bash
# SSH into instance
ssh -i chatbot-key.pem ubuntu@$INSTANCE_IP

# Check Node.js process
ps aux | grep node

# Check port 3000
sudo lsof -i :3000

# Start application
cd /app && npm start
```

### Database Connection Issues
```bash
# Check MongoDB status (if running locally)
sudo systemctl status mongodb

# Start MongoDB
sudo systemctl start mongodb

# Or update .env to use MongoDB Atlas
# DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/chatbot
```

---

## Cleanup (Delete Resources)

### Delete CloudFormation Stack
```bash
aws cloudformation delete-stack \
  --stack-name chatbot-stack \
  --region us-east-1

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name chatbot-stack \
  --region us-east-1
```

### Delete EC2 Key Pair
```bash
aws ec2 delete-key-pair \
  --key-name chatbot-key \
  --region us-east-1
```

### Delete Elastic IP
```bash
aws ec2 release-address \
  --allocation-id eipalloc-xxxxxxxxx \
  --region us-east-1
```

---

## Best Practices

1. **Use Environment Variables**: Store sensitive data in `.env` and AWS Secrets Manager
2. **Enable Monitoring**: Setup CloudWatch alarms for CPU, disk, and memory
3. **Backups**: Enable automated EBS snapshots
4. **Security**:
   - Restrict security group ingress rules
   - Use IAM roles instead of hardcoded credentials
   - Enable VPC Flow Logs
   - Use AWS Secrets Manager for API keys
5. **Scaling**: Configure auto-scaling policies for production
6. **CDN**: Use CloudFront to cache static assets
7. **Database**: Use AWS RDS or MongoDB Atlas for managed databases

---

## Additional Resources

- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Production Checklist](https://nodejs.org/en/docs/guides/nodejs-performance/)

---

## Support & Questions

For issues or questions during deployment:
1. Check CloudFormation stack events
2. Review EC2 instance system logs
3. SSH into instance and check application logs
4. Check AWS CloudWatch for metrics and alarms

Good luck with your deployment! 🚀
