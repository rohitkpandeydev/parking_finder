# Backend Service (TypeScript)

Express + TypeScript backend for Parking Finder.

## Live API

- Base URL: `http://100.26.182.109:3000`
- Health: `GET /api/health`

## Stack

- Node.js + Express
- TypeScript
- PostgreSQL (`pg`)
- JWT authentication

## Local Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Build/run production:

```bash
npm run build
npm start
```

## Environment Variables

- `PORT` (default `3000`)
- `RDS_HOST` / `RDS_PORT` / `RDS_DB_NAME` / `RDS_USERNAME` / `RDS_PASSWORD`
- Fallback DB names: `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD`
- `DB_SSL` (default `true`)
- `DB_SSL_REJECT_UNAUTHORIZED` (default `false`)
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (default `7d`)
- `RESERVATION_DURATION_MINUTES` (default `120`)

## API Endpoints

### Health

- `GET /api/health`
  - Returns API status + DB status.

### Auth

- `POST /api/auth/register`
  - Body: `email`, `password`, optional `first_name`, `last_name`
- `POST /api/auth/login`
  - Body: `email`, `password`
  - Returns JWT token.

### Spots

- `GET /api/spots`
  - Optional query: `available_only=true`
- `POST /api/spots/:id/reserve` (auth required)
  - Reserves spot, marks unavailable, creates reservation.

### Reservations (Dashboard)

- `GET /api/reservations/me` (auth required)
  - Returns:
    - `active`: current reservations
    - `past`: expired/cancelled/completed history

### Sessions

- `POST /api/sessions` (auth)
- `GET /api/sessions/active` (auth)
- `GET /api/sessions` (auth, optional `active_only=true`)
- `GET /api/sessions/:id` (auth)
- `PATCH /api/sessions/:id/end` (auth)

### Legacy Meter APIs

- `GET /api/meters`
- `GET /api/meters/:id`

## Notes

- Signup/login now normalize email (`trim + lowercase`) to avoid case/whitespace login mismatches.
- Schema initializer includes:
  - `users`
  - `parking_spots`
  - `reservations`
- Spot seeds include Bangalore locations.
