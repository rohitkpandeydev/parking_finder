# Infrastructure Summary

## Live Environment

- Domain: `smartparkingbits.duckdns.org`
- Frontend URL: `https://smartparkingbits.duckdns.org`
- API URL: `https://smartparkingbits.duckdns.org/api`
- EC2: `100.26.182.109`
- RDS: `database-1.c4xc08yqg78b.us-east-1.rds.amazonaws.com`

## Runtime Components

- `parking-finder-frontend` Docker container (`8080`)
- `parking-finder-backend` Docker container (`3000`)
- Host nginx reverse proxy and TLS termination
- DuckDNS dynamic DNS update cron (`/opt/duckdns/update.sh`)
- Certbot auto-renew timer for Let's Encrypt certificate

## Security Group Requirements

- EC2 inbound: `22`, `80`, `443`
- RDS inbound: `5432` from EC2 SG only

## Operational Checks

```bash
curl -I https://smartparkingbits.duckdns.org
curl https://smartparkingbits.duckdns.org/api/health
```
