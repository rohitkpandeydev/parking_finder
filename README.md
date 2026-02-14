# Parking Finder

Parking Finder is a TypeScript + React Native/Expo app for discovering parking spots, reserving for selected hours, and checking out with overtime billing.

## Live Deployment

- Frontend (HTTPS): `https://smartparkingbits.duckdns.org`
- API Base (HTTPS): `https://smartparkingbits.duckdns.org/api`
- Health: `https://smartparkingbits.duckdns.org/api/health`
- EC2 IP (direct): `100.26.182.109` (containers run on 8080/3000 behind nginx)

## Repository Structure

- `backend/`: Express + TypeScript API (PostgreSQL)
- `mobile_app/parking-meter-frontend/`: Expo app (iOS/Android/Web)
- `infra/`: Terraform for AWS infrastructure resources
- `docs/`: API contracts, architecture, requirements

## Current Features

- JWT auth (`register`, `login`)
- Spot listing API with coordinates (`latitude`, `longitude`)
- Spot booking by selected hours (`1-24`)
- Reservation dashboard (`active`, `past`)
- Reservation checkout API
- Overtime billing when reservation expires and user has not checked out
- Local app notifications for reservation expiry reminder (1 hour before)
- Session APIs for legacy parking meter flow
- Dockerized deployment (backend + frontend) on EC2
- HTTPS via nginx + DuckDNS + Let's Encrypt

## Quick Start (Local)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd mobile_app/parking-meter-frontend
npm install
npm run web
```

## API Summary (Latest)

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/spots`
- `POST /api/spots/:id/reserve` (auth, body includes `hours`)
- `GET /api/reservations/me` (auth)
- `POST /api/reservations/:id/checkout` (auth)
- `POST /api/sessions` (auth)
- `GET /api/sessions/active` (auth)
- `GET /api/sessions` (auth)
- `GET /api/sessions/:id` (auth)
- `PATCH /api/sessions/:id/end` (auth)
- Legacy meter endpoints: `GET /api/meters`, `GET /api/meters/:id`

For full payloads and examples, see `docs/api-contracts.md` and `backend/README.md`.
