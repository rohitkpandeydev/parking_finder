# Infrastructure (Terraform)

Terraform configuration for Parking Finder infrastructure on AWS.

## Current Runtime Deployment

Current live environment is running on EC2 + RDS:

- EC2: `100.26.182.109`
- Backend: `http://100.26.182.109:3000`
- Frontend web: `http://100.26.182.109:8080`
- RDS endpoint: `database-1.c4xc08yqg78b.us-east-1.rds.amazonaws.com`

## Terraform Folder Purpose

Use this folder to provision/update AWS resources consistently.

## Prerequisites

- Terraform >= 1.6
- AWS credentials configured

## Usage

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

## Files

- `main.tf`: provider + core setup
- `ec2.tf`: EC2 resources
- `rds.tf`: PostgreSQL RDS resources
- `variables.tf`: configurable inputs
- `outputs.tf`: values returned after apply

## Notes

- Keep secrets out of git (`terraform.tfvars`, passwords, JWT secrets).
- Restrict security group access (especially DB port 5432).
