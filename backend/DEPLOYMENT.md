# AWS Deployment Guide - Free Tier

This guide will help you deploy the backend to AWS using EC2 and RDS (free tier).

## Prerequisites

- AWS Account (free tier eligible)
- AWS CLI installed locally (optional, but helpful)
- Docker installed locally (for building images)

## Step 1: Create RDS PostgreSQL Database (Free Tier)

### Via AWS Console:

1. **Go to RDS Console**
   - Navigate to: https://console.aws.amazon.com/rds/
   - Click "Create database"

2. **Database Configuration**
   - **Engine**: PostgreSQL
   - **Version**: 15.4 (or latest 15.x)
   - **Template**: Free tier
   - **DB Instance Identifier**: `parking-finder-db`
   - **Master Username**: `postgres`
   - **Master Password**: Create a strong password (save it!)

3. **Instance Configuration**
   - **DB Instance Class**: `db.t2.micro` (free tier)
   - **Storage**: 20 GB (free tier limit)
   - **Storage Type**: General Purpose (SSD) - gp2

4. **Connectivity**
   - **VPC**: Default VPC (or create new)
   - **Public Access**: Yes (for easier connection)
   - **VPC Security Group**: Create new
     - Name: `parking-finder-db-sg`
   - **Availability Zone**: No preference
   - **Database Port**: 5432

5. **Database Authentication**
   - **Database Authentication**: Password authentication

6. **Additional Configuration**
   - **Initial Database Name**: `parking_finder`
   - **Backup**: Enable (1 day retention for free tier)
   - **Encryption**: Disable (to save costs)

7. **Click "Create database"**
   - Wait 5-10 minutes for database to be created

### Configure Security Group:

1. Go to **EC2 Console** → **Security Groups**
2. Find `parking-finder-db-sg`
3. **Edit Inbound Rules**:
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: Your EC2 security group (we'll create this next)
   - Or temporarily: `0.0.0.0/0` (for testing, restrict later)

## Step 2: Create EC2 Instance (Free Tier)

### Via AWS Console:

1. **Go to EC2 Console**
   - Navigate to: https://console.aws.amazon.com/ec2/
   - Click "Launch Instance"

2. **Instance Configuration**
   - **Name**: `parking-finder-backend`
   - **AMI**: Amazon Linux 2023 (free tier eligible)
   - **Instance Type**: `t2.micro` (free tier)
   - **Key Pair**: Create new or use existing
     - Download the `.pem` file (you'll need it for SSH)

3. **Network Settings**
   - **VPC**: Default VPC
   - **Subnet**: Any public subnet
   - **Auto-assign Public IP**: Enable
   - **Security Group**: Create new
     - Name: `parking-finder-backend-sg`
     - **Inbound Rules**:
       - SSH (22): Your IP only (for security)
       - HTTP (3000): 0.0.0.0/0 (or your IP for testing)

4. **Storage**
   - **Volume**: 8 GB gp3 (free tier: 30 GB)

5. **Click "Launch Instance"**
   - Wait for instance to be running

### Get Your EC2 Details:

1. **Public IP**: Note the public IP address
2. **Security Group**: Note the security group ID

## Step 3: Connect to EC2 and Install Docker

### SSH into EC2:

```bash
# On your local machine
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

### Install Docker on EC2:

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Git (to clone repo or copy files)
sudo yum install -y git

# Log out and back in for group changes to take effect
exit
# SSH back in
```

## Step 4: Build and Push Docker Image

### Option A: Build on EC2 (Simpler)

1. **Copy your code to EC2:**

```bash
# On your local machine, create a tarball
cd /Users/rohitpandey/Learning/bits/agile/parking_finder
tar -czf backend.tar.gz backend/

# Copy to EC2 (from local machine)
scp -i your-key.pem backend.tar.gz ec2-user@YOUR_EC2_IP:~/

# SSH into EC2
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Extract on EC2
cd ~
tar -xzf backend.tar.gz
cd backend
```

2. **Build Docker Image on EC2:**

```bash
# Build the image
docker build -t parking-finder-backend .

# Verify image
docker images
```

### Option B: Use GitHub Container Registry (Recommended)

1. **Push image from local machine:**

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Build and tag
cd backend
docker build -t ghcr.io/YOUR_GITHUB_USERNAME/parking-finder-backend:latest .

# Push
docker push ghcr.io/YOUR_GITHUB_USERNAME/parking-finder-backend:latest
```

2. **Pull on EC2:**

```bash
# Login to GitHub (you'll need a GitHub Personal Access Token)
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Pull image
docker pull ghcr.io/YOUR_GITHUB_USERNAME/parking-finder-backend:latest
```

## Step 5: Get RDS Endpoint

1. Go to **RDS Console** → **Databases**
2. Click on your database instance
3. Note the **Endpoint** (e.g., `parking-finder-db.xxxxx.us-east-1.rds.amazonaws.com`)
4. Note the **Port** (usually 5432)

## Step 6: Create Environment File on EC2

```bash
# On EC2, create .env file
cd ~/backend  # or wherever your code is
nano .env
```

Add this content (replace with your actual values):

```env
PORT=3000
DB_HOST=parking-finder-db.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=parking_finder
DB_USER=postgres
DB_PASSWORD=YOUR_RDS_PASSWORD
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

Save and exit (Ctrl+X, then Y, then Enter)

## Step 7: Run Docker Container

```bash
# Run the container
docker run -d \
  --name parking-finder-backend \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  parking-finder-backend

# Or if using GitHub image:
docker run -d \
  --name parking-finder-backend \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  ghcr.io/YOUR_GITHUB_USERNAME/parking-finder-backend:latest
```

## Step 8: Verify Deployment

### Check Container Status:

```bash
docker ps
docker logs parking-finder-backend
```

### Test the API:

```bash
# From your local machine
curl http://YOUR_EC2_PUBLIC_IP:3000/api/health
```

### Test Registration:

```bash
curl -X POST http://YOUR_EC2_PUBLIC_IP:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "first_name": "Test",
    "last_name": "User"
  }'
```

## Step 9: Update Security Group (Important!)

1. Go to **EC2 Console** → **Security Groups**
2. Find `parking-finder-backend-sg`
3. **Edit Inbound Rules**:
   - **Type**: Custom TCP
   - **Port**: 3000
   - **Source**: 
     - For testing: `0.0.0.0/0` (anywhere)
     - For production: Your IP only or specific IPs

## Step 10: Set Up Auto-Restart (Optional but Recommended)

Create a systemd service for auto-restart:

```bash
# On EC2
sudo nano /etc/systemd/system/parking-finder-backend.service
```

Add this content:

```ini
[Unit]
Description=Parking Finder Backend
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ec2-user/backend
ExecStart=/usr/bin/docker start parking-finder-backend
ExecStop=/usr/bin/docker stop parking-finder-backend
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable parking-finder-backend
sudo systemctl start parking-finder-backend
```

## Troubleshooting

### Container won't start:

```bash
# Check logs
docker logs parking-finder-backend

# Check if port is in use
sudo netstat -tulpn | grep 3000

# Restart container
docker restart parking-finder-backend
```

### Can't connect to database:

1. Check RDS security group allows EC2 security group
2. Verify RDS endpoint is correct
3. Check database is publicly accessible
4. Test connection:
   ```bash
   docker exec -it parking-finder-backend sh
   # Inside container, test connection (if psql is installed)
   ```

### Update code:

```bash
# Stop container
docker stop parking-finder-backend
docker rm parking-finder-backend

# Rebuild (if building on EC2)
docker build -t parking-finder-backend .

# Or pull latest (if using GitHub)
docker pull ghcr.io/YOUR_GITHUB_USERNAME/parking-finder-backend:latest

# Run again
docker run -d --name parking-finder-backend --restart unless-stopped -p 3000:3000 --env-file .env parking-finder-backend
```

## Cost Estimate (Free Tier)

- **EC2 t2.micro**: Free for 750 hours/month (first 12 months)
- **RDS db.t2.micro**: Free for 750 hours/month (first 12 months)
- **EBS Storage**: 30 GB free/month
- **Data Transfer**: 1 GB free/month

**After free tier expires**: ~$20-25/month if running 24/7

## Security Recommendations

1. ✅ Use strong passwords
2. ✅ Restrict SSH access to your IP only
3. ✅ Use HTTPS (add Load Balancer + ACM certificate later)
4. ✅ Rotate JWT secrets regularly
5. ✅ Enable RDS automated backups
6. ✅ Monitor CloudWatch logs
7. ✅ Set up billing alerts

## Next Steps

- Set up a domain name and point it to EC2 IP
- Add SSL certificate (use AWS Certificate Manager)
- Set up CloudWatch monitoring
- Configure auto-scaling (when needed)
- Set up CI/CD to auto-deploy (use the GitHub Actions workflows)
