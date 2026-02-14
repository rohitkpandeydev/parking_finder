# Controllers

This directory contains Express controller handlers for each API module.

## Current modules

- `authController.ts`: register/login
- `healthController.ts`: health check
- `spotController.ts`: spot listing and reservation
- `reservationController.ts`: user dashboard reservations
- `sessionController.ts`: parking session lifecycle
- `meterController.ts`: legacy meter APIs

Controllers should:

- Validate request input (`express-validator`)
- Delegate business logic to services
- Return HTTP status + response payload
- Avoid embedding SQL directly (use services)
