# Security Group for EC2
resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-ec2-sg"
  description = "Security group for EC2 instance running backend"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH from anywhere (restrict in production)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-ec2-sg"
    Environment = var.environment
    Project     = var.project_name
  }
}

# IAM Role for EC2
resource "aws_iam_role" "ec2" {
  name = "${var.project_name}-ec2-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-ec2-role"
    Environment = var.environment
    Project     = var.project_name
  }
}

# IAM Policy for EC2 to access Secrets Manager
resource "aws_iam_role_policy" "ec2_secrets" {
  name = "${var.project_name}-ec2-secrets-policy-${var.environment}"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.db_credentials.arn,
          aws_secretsmanager_secret.jwt_secret.arn
        ]
      }
    ]
  })
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project_name}-ec2-profile-${var.environment}"
  role = aws_iam_role.ec2.name

  tags = {
    Name        = "${var.project_name}-ec2-profile"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Get latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# User data script to install Docker and run container
locals {
  user_data = <<-EOF
#!/bin/bash
# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install AWS CLI v2 (for Secrets Manager access)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
yum install -y unzip
unzip awscliv2.zip
./aws/install

# Install jq for JSON parsing
yum install -y jq

# Create directory for scripts
mkdir -p /opt/parking-finder
cd /opt/parking-finder

# Create script to fetch secrets and start container
cat > start-backend.sh <<SCRIPT
#!/bin/bash
REGION=${var.aws_region}
SECRET_DB_ARN="${aws_secretsmanager_secret.db_credentials.arn}"
SECRET_JWT_ARN="${aws_secretsmanager_secret.jwt_secret.arn}"
BACKEND_IMAGE="${var.backend_image}"
ENVIRONMENT="${var.environment}"

# Fetch secrets
DB_SECRET=$(aws secretsmanager get-secret-value --secret-id $SECRET_DB_ARN --region $REGION --query SecretString --output text)
JWT_SECRET=$(aws secretsmanager get-secret-value --secret-id $SECRET_JWT_ARN --region $REGION --query SecretString --output text)

# Parse secrets
DB_HOST=$(echo $DB_SECRET | jq -r '.DB_HOST')
DB_PORT=$(echo $DB_SECRET | jq -r '.DB_PORT')
DB_NAME=$(echo $DB_SECRET | jq -r '.DB_NAME')
DB_USER=$(echo $DB_SECRET | jq -r '.DB_USER')
DB_PASSWORD=$(echo $DB_SECRET | jq -r '.DB_PASSWORD')
JWT_SECRET_VALUE=$(echo $JWT_SECRET | jq -r '.JWT_SECRET')

# Login to GitHub Container Registry (if needed)
# echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull and run container
docker pull $BACKEND_IMAGE
docker stop parking-finder-backend || true
docker rm parking-finder-backend || true

docker run -d \\
  --name parking-finder-backend \\
  --restart unless-stopped \\
  -p 3000:3000 \\
  -e PORT=3000 \\
  -e NODE_ENV=$ENVIRONMENT \\
  -e DB_HOST=$DB_HOST \\
  -e DB_PORT=$DB_PORT \\
  -e DB_NAME=$DB_NAME \\
  -e DB_USER=$DB_USER \\
  -e DB_PASSWORD=$DB_PASSWORD \\
  -e JWT_SECRET=$JWT_SECRET_VALUE \\
  $BACKEND_IMAGE || echo "Failed to start container. Check logs: docker logs parking-finder-backend"
SCRIPT

chmod +x start-backend.sh

# Run the script
./start-backend.sh

# Create systemd service for auto-restart
cat > /etc/systemd/system/parking-finder-backend.service <<'SERVICE'
[Unit]
Description=Parking Finder Backend
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/parking-finder
ExecStart=/opt/parking-finder/start-backend.sh
ExecStop=/usr/bin/docker stop parking-finder-backend

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable parking-finder-backend
EOF
}

# EC2 Instance (Free Tier: t2.micro or t3.micro)
resource "aws_instance" "backend" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.ec2_instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name
  user_data_base64       = base64encode(local.user_data)

  # Enable detailed monitoring (optional, has cost)
  monitoring = false

  tags = {
    Name        = "${var.project_name}-backend-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Elastic IP (optional, to have static IP)
# resource "aws_eip" "backend" {
#   instance = aws_instance.backend.id
#   domain   = "vpc"
#
#   tags = {
#     Name        = "${var.project_name}-backend-eip"
#     Environment = var.environment
#     Project     = var.project_name
#   }
# }
