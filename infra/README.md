# Infrastructure (Terraform)

Terraform configuration for AWS infrastructure used by Parking Finder.

## Current Runtime Deployment

- Domain: `smartparkingbits.duckdns.org`
- Frontend: `https://smartparkingbits.duckdns.org`
- Backend API: `https://smartparkingbits.duckdns.org/api`
- EC2 host: `100.26.182.109`
- RDS endpoint: `database-1.c4xc08yqg78b.us-east-1.rds.amazonaws.com`

## Current Operating Model

- EC2 runs Docker containers for backend and frontend.
- Host nginx handles TLS termination and reverse proxy.
- DuckDNS provides free DNS.
- Let's Encrypt issues certificates.

## Terraform Usage

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

## Files

- `main.tf`: providers and shared settings
- `ec2.tf`: EC2 instance resources
- `rds.tf`: PostgreSQL resources
- `variables.tf`: input variables
- `outputs.tf`: generated outputs

## Security Notes

- Keep secrets out of git (`terraform.tfvars`, DB passwords, JWT secrets).
- EC2 SG inbound required for runtime: `22`, `80`, `443`.
- RDS SG should allow `5432` only from EC2 SG.
