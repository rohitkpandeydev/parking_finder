# Login Module Notes

This folder tracks login-related deliverables.

Current authentication flow is implemented in the main frontend app under:

- `mobile_app/parking-meter-frontend/src/screens/LoginScreen.tsx`
- `mobile_app/parking-meter-frontend/src/screens/SignupScreen.tsx`
- `mobile_app/parking-meter-frontend/src/services/api.ts`
- `mobile_app/parking-meter-frontend/src/services/authStorage.ts`

Backend auth endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`

Production base URL:

- `https://smartparkingbits.duckdns.org/api`
