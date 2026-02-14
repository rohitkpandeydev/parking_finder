# Requirements and Behavior

## Functional Requirements (Implemented)

- User authentication with JWT (`register`, `login`)
- Fetch parking spots with location and coordinates
- Reserve a spot for user-selected duration in hours
- Dashboard showing active and past reservations
- Reservation checkout workflow
- Overtime billing when reservation expires and checkout is delayed
- Reminder notification before reservation expiry (1 hour)
- Basic health endpoint

## Reservation Rules

- Booking input: `hours` (integer 1-24)
- Base cost: `spot.price * booked_hours`
- Expiry: `reserved_at + booked_hours`
- Overtime applies after expiry until checkout
- Overtime multiplier default: `1.5` (`RESERVATION_OVERTIME_MULTIPLIER` configurable)

## API Security

- Protected endpoints require Bearer token
- Public endpoints:
  - `GET /api/health`
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/spots`

## Non-Functional

- TypeScript across backend and frontend
- PostgreSQL persistence on RDS
- Dockerized services
- HTTPS enabled with Let's Encrypt

## Runtime Environment

- Domain: `smartparkingbits.duckdns.org`
- EC2 host: `100.26.182.109`
- RDS endpoint: `database-1.c4xc08yqg78b.us-east-1.rds.amazonaws.com`
