#!/bin/bash

# Quick deployment script for EC2
# Usage: ./deploy-to-ec2.sh EC2_IP EC2_KEY_PATH

set -e

EC2_IP=$1
EC2_KEY=$2

if [ -z "$EC2_IP" ] || [ -z "$EC2_KEY" ]; then
  echo "Usage: ./deploy-to-ec2.sh EC2_IP EC2_KEY_PATH"
  echo "Example: ./deploy-to-ec2.sh 54.123.45.67 ~/.ssh/my-key.pem"
  exit 1
fi

echo "🚀 Deploying to EC2: $EC2_IP"

# Build Docker image locally
echo "📦 Building Docker image..."
docker build -t parking-finder-backend:latest .

# Save image as tar
echo "💾 Saving Docker image..."
docker save parking-finder-backend:latest | gzip > parking-finder-backend.tar.gz

# Copy to EC2
echo "📤 Copying files to EC2..."
scp -i "$EC2_KEY" parking-finder-backend.tar.gz ec2-user@$EC2_IP:~/
scp -i "$EC2_KEY" .env.example ec2-user@$EC2_IP:~/backend/.env.example

# Deploy on EC2
echo "🔧 Setting up on EC2..."
ssh -i "$EC2_KEY" ec2-user@$EC2_IP << 'ENDSSH'
  # Load Docker image
  docker load < parking-finder-backend.tar.gz
  
  # Stop and remove old container
  docker stop parking-finder-backend 2>/dev/null || true
  docker rm parking-finder-backend 2>/dev/null || true
  
  # Create .env if it doesn't exist
  mkdir -p ~/backend
  if [ ! -f ~/backend/.env ]; then
    cp ~/backend/.env.example ~/backend/.env
    echo "⚠️  Please edit ~/backend/.env with your RDS credentials"
  fi
  
  # Run container
  docker run -d \
    --name parking-finder-backend \
    --restart unless-stopped \
    -p 3000:3000 \
    --env-file ~/backend/.env \
    parking-finder-backend:latest
  
  # Show logs
  echo "📋 Container logs:"
  docker logs parking-finder-backend
  
  echo "✅ Deployment complete!"
  echo "🌐 Test: curl http://localhost:3000/api/health"
ENDSSH

# Cleanup
rm -f parking-finder-backend.tar.gz

echo "✅ Deployment script completed!"
echo "📝 Don't forget to:"
echo "   1. Edit .env file on EC2 with your RDS credentials"
echo "   2. Restart container: docker restart parking-finder-backend"
echo "   3. Test: curl http://$EC2_IP:3000/api/health"
