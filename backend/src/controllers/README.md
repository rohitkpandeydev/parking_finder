# Controllers

Express controllers by module.

## Current Modules

- `authController.ts`: `register`, `login`
- `healthController.ts`: health endpoint
- `spotController.ts`: list spots and reserve by booking hours
- `reservationController.ts`: reservation dashboard and checkout endpoint
- `sessionController.ts`: legacy parking session lifecycle
- `meterController.ts`: legacy meter endpoints

## Controller Responsibilities

- Validate request input (`express-validator`)
- Delegate business logic to service layer
- Return proper HTTP status and JSON payload
- Avoid SQL in controller layer

## Reservation-Specific Behavior

- Reserve endpoint validates `hours` in range `1..24`
- Checkout endpoint finalizes overtime and total payable amount
