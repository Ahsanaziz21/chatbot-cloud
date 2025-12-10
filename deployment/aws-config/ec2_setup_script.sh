#!/bin/bash

# EC2 Setup Script for Cloud-Based Chatbot System
# This script prepares an EC2 instance for running the chatbot application

set -e

echo "================================"
echo "Cloud Chatbot - EC2 Setup Script"
echo "================================"

# Update system packages
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install Docker
echo "Installing Docker..."
sudo apt-get install -y docker.io docker-compose

# Start Docker daemon
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER

echo "Docker version: $(docker --version)"

# Install Git
echo "Installing Git..."
sudo apt-get install -y git

# Create application directory
echo "Creating application directory..."
APP_DIR="/var/www/chatbot"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR
cd $APP_DIR

# Clone repository (update with your repository URL)
# echo "Cloning repository..."
# git clone https://github.com/yourusername/cloud-chatbot.git .

# Install Node dependencies
echo "Installing Node dependencies..."
# npm install

# Create environment file
echo "Creating .env file..."
cat > $APP_DIR/server/.env << EOF
PORT=3000
NODE_ENV=production
CLIENT_URL=http://localhost:3000
DATABASE_URL=mongodb://localhost:27017/chatbot
API_KEY=your_api_key_here
AWS_REGION=us-east-1
LOG_LEVEL=info
EOF

echo "Protecting .env file..."
chmod 600 $APP_DIR/server/.env

# Install MongoDB (optional)
echo "Installing MongoDB (optional)..."
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Install PM2 for process management
echo "Installing PM2..."
sudo npm install -g pm2

# Start application with PM2
echo "Starting application with PM2..."
# cd $APP_DIR/server
# pm2 start server.js --name "chatbot"
# pm2 save

# Install Nginx as reverse proxy (optional)
echo "Installing Nginx..."
sudo apt-get install -y nginx

# Create Nginx configuration
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/chatbot > /dev/null << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3000/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/chatbot
sudo rm -f /etc/nginx/sites-enabled/default

# Test and start Nginx
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

# Setup firewall
echo "Configuring UFW firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable

# Setup SSL certificate (optional, using Let's Encrypt)
echo "Installing Certbot for SSL..."
sudo apt-get install -y certbot python3-certbot-nginx

# Display setup summary
echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Application Directory: $APP_DIR"
echo "Node.js Version: $(node -v)"
echo "NPM Version: $(npm -v)"
echo "Docker Version: $(docker --version)"
echo ""
echo "Next Steps:"
echo "1. Update .env file with your configuration"
echo "2. Deploy application files to $APP_DIR"
echo "3. Run: cd $APP_DIR && npm install"
echo "4. Start application with PM2 or Docker"
echo "5. (Optional) Setup SSL with: sudo certbot --nginx -d your-domain.com"
echo ""
echo "Access Application: http://your-server-ip:3000"
echo ""
