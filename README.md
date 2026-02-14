# Parking Finder

Parking Finder is a TypeScript + React Native/Expo application for discovering parking spots, reserving them, and tracking user reservation/session activity.

## Live Deployment

- Frontend (Web): `http://100.26.182.109:8080`
- Backend API: `http://100.26.182.109:3000`
- Health Check: `http://100.26.182.109:3000/api/health`

## Repository Structure

- `backend/`: Express + TypeScript API (PostgreSQL)
- `mobile_app/parking-meter-frontend/`: Expo app (web + mobile)
- `infra/`: Terraform configuration
- `docs/`: architecture/contracts/requirements docs

## Implemented Features

- JWT authentication (`register`, `login`)
- Health endpoint with DB status
- Spot listing module (`/api/spots`)
- Reservation workflow (`/api/spots/:id/reserve`)
- User reservation dashboard (`/api/reservations/me` with `active` + `past`)
- Session APIs (`/api/sessions/*`)
- Bangalore-focused spot seed data
- Dockerized backend and frontend web deployment

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

Then open the web URL shown by Expo (or mobile emulator/device via Expo).

## API Summary

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/spots`
- `POST /api/spots/:id/reserve` (auth)
- `GET /api/reservations/me` (auth)
- `POST /api/sessions` (auth)
- `GET /api/sessions/active` (auth)
- `GET /api/sessions` (auth)
- `GET /api/sessions/:id` (auth)
- `PATCH /api/sessions/:id/end` (auth)
- Legacy meter endpoints: `GET /api/meters`, `GET /api/meters/:id`

For details, see `backend/README.md`.
