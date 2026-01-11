# Infrastructure as Code - Terraform

This directory contains Terraform configuration for deploying the Parking Finder application to AWS.

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.6.0 installed
3. S3 bucket for Terraform state (configure in `main.tf` backend block)

## Setup

1. Copy `terraform.tfvars.example` to `terraform.tfvars`:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edit `terraform.tfvars` with your values:
   - Set secure database password
   - Set JWT secret
   - Update Docker image URIs
   - Configure AWS region and other settings

3. Configure Terraform backend in `main.tf`:
   - Update the S3 bucket name
   - Update the key path
   - Update the region

4. Initialize Terraform:
   ```bash
   terraform init
   ```

5. Review the plan:
   ```bash
   terraform plan
   ```

6. Apply the configuration:
   ```bash
   terraform apply
   ```

## Architecture

The infrastructure includes:

- **VPC**: Virtual Private Cloud with public and private subnets
- **RDS**: PostgreSQL database in private subnets (Free Tier: db.t2.micro)
- **EC2**: Containerized backend application (Free Tier: t2.micro)
- **Security Groups**: Network security rules
- **Secrets Manager**: Secure storage for credentials
- **CloudWatch**: Logging and monitoring

**Note**: This setup uses only AWS Free Tier eligible services. See [FREE_TIER_GUIDE.md](FREE_TIER_GUIDE.md) for cost details and how to stop resources.

## Variables

See `variables.tf` for all available variables and their descriptions.

## Outputs

After deployment, Terraform will output:
- ALB DNS name (API URL)
- ECS Cluster information
- RDS endpoint
- VPC ID

## State Management

Terraform state is stored in S3. Make sure to configure the backend block in `main.tf` before running `terraform init`.

## Security Notes

- Never commit `terraform.tfvars` to version control
- Use AWS Secrets Manager for sensitive data
- Enable encryption at rest for RDS
- Use HTTPS for production (requires ACM certificate)
