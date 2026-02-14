# Frontend App (Expo)

React Native + Expo frontend for Parking Finder.

## Live Web Deployment

- `http://100.26.182.109:8080`

## Stack

- Expo SDK 54
- React Native
- React Navigation
- AsyncStorage for token persistence
- Web map via `pigeon-maps`
- Native map via `react-native-maps`

## Local Setup

```bash
cd mobile_app/parking-meter-frontend
npm install
npm run web
```

For native:

```bash
npm start
# press i (iOS) or a (Android)
```

## Configuration

Backend API URL is set in:

- `parking-meter-frontend/src/config.ts`

Current value points to deployed backend:

- `http://100.26.182.109:3000`

## Implemented UI Flows

- Login / Signup
- Spot list and map pins
- Spot reservation
- Reservation dashboard (`active` / `past`)
- Session screen

## Important Notes

- Web and native use platform-specific map implementations:
  - `MapScreen.web.tsx` for web
  - `MapScreen.tsx` for iOS/Android
- If login/signup appears stuck, inline error messages are rendered on screen.
