# API Contracts (Latest)

Base URL (production): `https://smartparkingbits.duckdns.org/api`

Auth header for protected endpoints:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Health

### `GET /health`

Response `200`:

```json
{
  "status": "ok",
  "database": "up",
  "timestamp": "2026-02-14T11:23:17.122Z"
}
```

## Auth

### `POST /auth/register`

Request:

```json
{
  "email": "user@example.com",
  "password": "Pass1234",
  "first_name": "Rohit",
  "last_name": "Pandey"
}
```

Response `201`: user object.

### `POST /auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "Pass1234"
}
```

Response `200`:

```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Rohit",
    "last_name": "Pandey"
  }
}
```

## Spots

### `GET /spots`

Query params:

- `available_only=true|false` (optional)

Response `200`:

```json
{
  "spots": [
    {
      "id": 1,
      "location": "MG Road - Parking Bay A",
      "price": 2.5,
      "is_available": true,
      "latitude": 12.975826,
      "longitude": 77.606102
    }
  ]
}
```

### `POST /spots/:id/reserve` (auth)

Request:

```json
{
  "hours": 2
}
```

Validation:

- `hours` must be integer between `1` and `24`

Response `200`:

```json
{
  "message": "Parking spot reserved",
  "reservation_id": 101,
  "expires_at": "2026-02-14T13:00:00.000Z",
  "booked_hours": 2,
  "base_cost": 5,
  "total_cost": 5,
  "spot": {
    "id": 1,
    "location": "MG Road - Parking Bay A",
    "price": 2.5,
    "is_available": false,
    "latitude": 12.975826,
    "longitude": 77.606102
  }
}
```

Possible errors:

- `404` spot not found
- `409` spot unavailable
- `400` validation error

## Reservations

### `GET /reservations/me` (auth)

Response `200`:

```json
{
  "active": [
    {
      "id": 101,
      "user_id": 1,
      "spot_id": 1,
      "location": "MG Road - Parking Bay A",
      "price": 2.5,
      "status": "expired",
      "reserved_at": "2026-02-14T10:00:00.000Z",
      "expires_at": "2026-02-14T12:00:00.000Z",
      "booked_hours": 2,
      "base_cost": 5,
      "overtime_cost": 1.25,
      "total_cost": 6.25,
      "checked_out_at": null,
      "overtime_minutes": 20,
      "is_overdue": true,
      "estimated_total_cost": 6.25
    }
  ],
  "past": []
}
```

Notes:

- Reservations remain in `active` until checkout if `checked_out_at` is null.
- Overtime values increase over time until checkout.

### `POST /reservations/:id/checkout` (auth)

Response `200`:

```json
{
  "message": "Reservation checked out",
  "reservation": {
    "id": 101,
    "status": "completed",
    "checked_out_at": "2026-02-14T12:20:00.000Z",
    "base_cost": 5,
    "overtime_cost": 1.25,
    "total_cost": 6.25
  }
}
```

Behavior:

- Computes final overtime at checkout time.
- Releases the parking spot (`is_available=true`).

## Sessions (legacy meter flow)

- `POST /sessions`
- `GET /sessions/active`
- `GET /sessions?active_only=true`
- `GET /sessions/:id`
- `PATCH /sessions/:id/end`

## Legacy Meter APIs

- `GET /meters`
- `GET /meters/:id`
