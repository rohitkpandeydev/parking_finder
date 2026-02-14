# Frontend App (Expo)

React Native + Expo frontend for Parking Finder.

## Live Web Deployment

- App URL: `https://smartparkingbits.duckdns.org`
- API base used in production: `https://smartparkingbits.duckdns.org/api`

## Stack

- Expo SDK 54
- React Native
- React Navigation
- AsyncStorage token persistence
- Web map: `pigeon-maps`
- Native map: `react-native-maps`
- Notifications: `expo-notifications`

## Local Setup

```bash
cd mobile_app/parking-meter-frontend
npm install
npm run web
```

For native builds:

```bash
npm start
# iOS: press i
# Android: press a
```

## Configuration

API base URL is configured in:

- `mobile_app/parking-meter-frontend/src/config.ts`

## Frontend Flows

- Login / Signup
- Spot list and map pins
- Spot reservation with booking hours
- Reservation details with INR cost breakdown
- Checkout action from dashboard
- Reservation reminder notification scheduling (1 hour before expiry)

## Platform Notes

- `MapScreen.web.tsx`: web map implementation
- `MapScreen.tsx`: iOS/Android map implementation
- Notification support depends on permissions and device OS behavior
