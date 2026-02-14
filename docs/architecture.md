# Architecture

## Runtime Topology

- Client apps:
  - Expo mobile app (iOS/Android)
  - Expo web build served by nginx
- Edge:
  - Host nginx on EC2 terminates TLS
  - Domain: `smartparkingbits.duckdns.org`
- Services:
  - Frontend container: `parking-finder-frontend` on `127.0.0.1:8080`
  - Backend container: `parking-finder-backend` on `127.0.0.1:3000`
- Data:
  - PostgreSQL on AWS RDS

## Request Routing

- `https://smartparkingbits.duckdns.org/` -> frontend container
- `https://smartparkingbits.duckdns.org/api/*` -> backend container

## Backend Modules

- `auth`: register/login with JWT
- `spots`: list and reserve parking spots
- `reservations`: dashboard and checkout
- `sessions`: legacy parking meter session lifecycle
- `health`: API + DB liveness

## Reservation Flow (Current)

1. User selects spot and booking duration (`hours`, 1-24).
2. `POST /api/spots/:id/reserve` creates reservation with:
   - `expires_at`
   - `booked_hours`
   - `base_cost`
   - initial `total_cost`
3. If expiry is crossed and checkout is not done:
   - reservation becomes `expired`
   - overtime is calculated dynamically for dashboard
4. User checks out with `POST /api/reservations/:id/checkout`:
   - final overtime and total are persisted
   - reservation set to `completed`
   - spot availability restored

## Notification Flow

Frontend notification module schedules local reminders:

- 1 hour before reservation expiry
- at reservation expiry (overtime warning)

Note: delivery depends on platform permissions and OS notification behavior.

## Security

- JWT protected routes via `Authorization: Bearer <token>`
- TLS certificate from Let's Encrypt
- DuckDNS for free DNS
- RDS access restricted through security groups

## Deployment Pattern

- Build Docker images on EC2
- Run with `--restart unless-stopped`
- Keep backend configuration in EC2 `.env`
- Auto-renew TLS via `certbot-renew.timer`
