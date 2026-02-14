# Backend + Frontend Deployment (EC2 + RDS + HTTPS)

This project is currently deployed on EC2 with Docker containers and PostgreSQL on RDS.

## Live Runtime

- Domain: `smartparkingbits.duckdns.org`
- Frontend: `https://smartparkingbits.duckdns.org`
- Backend API: `https://smartparkingbits.duckdns.org/api`
- Backend container port: `3000`
- Frontend container port: `8080` (nginx reverse proxy on host)

## Infrastructure

- EC2 host: `100.26.182.109`
- RDS endpoint: `database-1.c4xc08yqg78b.us-east-1.rds.amazonaws.com`
- RDS DB name: `postgres`
- Web server: nginx on EC2 host
- TLS: Let's Encrypt (certbot)
- DNS: DuckDNS (`smartparkingbits.duckdns.org`)

## Container Names

- `parking-finder-backend`
- `parking-finder-frontend`

## Deploy Updated Code

From local repo root:

```bash
# create source archives
rm -f /tmp/parking-backend-src.tar.gz /tmp/parking-frontend-src.tar.gz

tar -czf /tmp/parking-backend-src.tar.gz \
  --exclude='backend/node_modules' \
  --exclude='backend/dist' \
  -C . backend

tar -czf /tmp/parking-frontend-src.tar.gz \
  --exclude='mobile_app/parking-meter-frontend/node_modules' \
  --exclude='mobile_app/parking-meter-frontend/.expo' \
  --exclude='mobile_app/parking-meter-frontend/dist' \
  -C . mobile_app/parking-meter-frontend

# upload
scp -i ~/Downloads/agile.pem /tmp/parking-backend-src.tar.gz /tmp/parking-frontend-src.tar.gz ec2-user@100.26.182.109:~/backend/
```

On EC2:

```bash
ssh -i ~/Downloads/agile.pem ec2-user@100.26.182.109

mkdir -p ~/backend/backend-src ~/backend/frontend-src
rm -rf ~/backend/backend-src/backend ~/backend/frontend-src/mobile_app

tar -xzf ~/backend/parking-backend-src.tar.gz -C ~/backend/backend-src
tar -xzf ~/backend/parking-frontend-src.tar.gz -C ~/backend/frontend-src

# backend
cd ~/backend/backend-src/backend
docker build -t parking-finder-backend:latest .
docker stop parking-finder-backend || true
docker rm parking-finder-backend || true
docker run -d \
  --name parking-finder-backend \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file ~/backend/.env \
  parking-finder-backend:latest

# frontend
cd ~/backend/frontend-src/mobile_app/parking-meter-frontend
docker build -t parking-finder-frontend:latest .
docker stop parking-finder-frontend || true
docker rm parking-finder-frontend || true
docker run -d \
  --name parking-finder-frontend \
  --restart unless-stopped \
  -p 8080:80 \
  parking-finder-frontend:latest
```

## nginx Reverse Proxy

nginx host config proxies:

- `/` -> `http://127.0.0.1:8080/`
- `/api/` -> `http://127.0.0.1:3000/api/`

## HTTPS (DuckDNS + Let's Encrypt)

- DuckDNS domain is updated using token and cron job (`/opt/duckdns/update.sh` every 5 minutes).
- Cert managed by certbot with nginx integration.
- Auto-renew timer enabled: `certbot-renew.timer`

Useful commands:

```bash
sudo certbot certificates
sudo certbot renew --dry-run
sudo systemctl status certbot-renew.timer
```

## AWS Security Group Requirements

EC2 inbound rules must allow:

- TCP `22` (SSH)
- TCP `80` (HTTP)
- TCP `443` (HTTPS)

RDS inbound should allow:

- TCP `5432` from EC2 security group only

## Verification

```bash
curl -I https://smartparkingbits.duckdns.org
curl https://smartparkingbits.duckdns.org/api/health
```
