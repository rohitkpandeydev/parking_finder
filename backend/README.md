# Backend Service (TypeScript)

Express + TypeScript backend for Parking Finder.

## Live API

- Base URL: `https://smartparkingbits.duckdns.org/api`
- Health: `https://smartparkingbits.duckdns.org/api/health`

## Stack

- Node.js + Express
- TypeScript
- PostgreSQL (`pg`)
- JWT authentication
- Input validation via `express-validator`

## Local Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

## Environment Variables

- `PORT` (default `3000`)
- `RDS_HOST` / `RDS_PORT` / `RDS_DB_NAME` / `RDS_USERNAME` / `RDS_PASSWORD`
- Fallback DB vars: `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD`
- `DB_SSL` (default `true`)
- `DB_SSL_REJECT_UNAUTHORIZED` (default `false`)
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (default `7d`)
- `RESERVATION_DURATION_MINUTES` (legacy fallback default `120`)
- `RESERVATION_OVERTIME_MULTIPLIER` (default `1.5`)

## API Endpoints

### Health

- `GET /api/health`
  - Returns service status and DB connectivity.

### Auth

- `POST /api/auth/register`
  - Body:
    - `email` (required)
    - `password` (required)
    - `first_name` (optional)
    - `last_name` (optional)
- `POST /api/auth/login`
  - Body:
    - `email` (required)
    - `password` (required)
  - Returns JWT.

### Spots

- `GET /api/spots`
  - Query:
    - `available_only=true|false` (optional)
  - Returns parking spots with:
    - `id`, `location`, `price`, `is_available`, `latitude`, `longitude`

- `POST /api/spots/:id/reserve` (auth)
  - Body:
    - `hours` (required integer, `1..24`)
  - Behavior:
    - Marks spot unavailable
    - Creates reservation with `expires_at`
    - Computes `base_cost` and initial `total_cost`
  - Returns:
    - `reservation_id`, `expires_at`, `booked_hours`, `base_cost`, `total_cost`, `spot`

### Reservations

- `GET /api/reservations/me` (auth)
  - Returns:
    - `active`: not checked-out reservations (including overdue)
    - `past`: completed/cancelled history
  - Reservation includes:
    - `booked_hours`, `base_cost`, `overtime_cost`, `total_cost`, `estimated_total_cost`, `overtime_minutes`, `checked_out_at`

- `POST /api/reservations/:id/checkout` (auth)
  - Finalizes reservation
  - Computes overtime charge if `now > expires_at`
  - Sets `status=completed`, writes `checked_out_at`, releases spot
  - Returns final reservation totals

### Sessions (legacy meter flow)

- `POST /api/sessions` (auth)
- `GET /api/sessions/active` (auth)
- `GET /api/sessions` (auth, optional `active_only=true`)
- `GET /api/sessions/:id` (auth)
- `PATCH /api/sessions/:id/end` (auth)

### Legacy Meter APIs

- `GET /api/meters`
- `GET /api/meters/:id`

## Data Model Notes

`reservations` table now includes:

- `booked_hours`
- `base_cost`
- `overtime_cost`
- `total_cost`
- `checked_out_at`

Migration safety is handled in schema initialization using `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
