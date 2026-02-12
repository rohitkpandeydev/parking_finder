# How to Test the Parking Finder App

## Prerequisites

1. Backend must be running with database and seed data (parking meters).
2. Set the correct API URL in src/config.ts for your environment (see notes at the top of that file).

---

## Step 1: Start the backend

1. Open a terminal and go to the backend folder: cd backend
2. Run: npm install
3. Set environment variables: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET
4. Run: npm run dev
5. Confirm the backend is running by opening in a browser: http://localhost:3000/api/health (you should see a healthy response).

---

## Step 2: Set the API URL for the frontend (if needed)

1. Open mobile_app/parking-meter-frontend/src/config.ts
2. Change API_BASE_URL if you are not using the same machine for backend and app:
   - For Android Emulator use: http://10.0.2.2:3000
   - For a physical device use your computer IP, e.g. http://192.168.1.5:3000
   - For iOS Simulator or web on same machine: http://localhost:3000 is fine

---

## Step 3: Start the frontend (Expo)

1. Open a new terminal and go to: cd mobile_app/parking-meter-frontend
2. Run: npm install
3. Run: npx expo start
4. To run the app:
   - Press w for web browser
   - Press a for Android emulator
   - Press i for iOS simulator (Mac only)
   - Or scan the QR code with Expo Go on your phone (use your machine IP in config for API_BASE_URL)

---

## Step 4: Test login and signup

1. Open the app. You should see the Login screen (or the Map if you were already logged in).
2. Tap "Create new account".
3. Enter an email, a password (at least 8 characters, with uppercase, lowercase and a number), and optionally first and last name. Tap Sign Up.
4. You should see a success message. Tap OK to go back to Login.
5. Enter the same email and password and tap Login. You should be taken to the Map screen.
6. Tap "Log out" (on Map or Session screen). You should return to the Login screen.
7. Try logging in with a wrong password. You should see an error message.

---

## Step 5: Test the map and parking meters

1. Log in again so you are on the Map screen.
2. If the app asks for location permission, allow it. The map will center on your location and load nearby meters (if the backend has seed data).
3. If you deny location, the app still loads; you may see all meters or a message depending on backend.
4. On a device or simulator: tap a meter marker on the map. On web: tap a meter in the list. The Meter details screen should open.
5. On the Meter details screen check that you see: meter code, price per hour, availability, and if location was used, distance. Address may also be shown if the meter has one.

---

## Step 6: Test starting a parking session

1. On the Meter details screen, select a duration (e.g. 30 minutes) and tap "Start parking session".
2. You should see a success message. Tap OK (or "Open map" if shown).
3. Go to the Session screen (tap "Session" on the map screen or open the Session tab/screen).
4. You should see "Parking active" and a countdown timer showing time left.
5. Pull to refresh on the Session screen; the timer should still show the correct remaining time.

---

## Step 7: Test ending a parking session

1. On the Session screen, with an active session, tap "End session".
2. You should see a confirmation that the session has ended.
3. The Session screen should now show "No active parking session" and an option to open the map.

---

## Step 8: Test notifications (device or simulator)

1. When the app asks for notification permission, allow it (or enable it in device settings for the app).
2. Start a parking session with a short duration (e.g. 15 minutes).
3. Wait until about 5 minutes before the end time. You should get a "Parking reminder" notification.
4. Wait until the session end time. You should get a "Parking session ended" notification.
5. Note: On web, scheduled notifications may not work; use a device or simulator for this.

---

## Step 9: Quick API checks (optional, using curl or Postman)

1. Health check: GET http://localhost:3000/api/health (should return status ok).
2. Register: POST http://localhost:3000/api/auth/register with JSON body: email, password, optional first_name, last_name.
3. Login: POST http://localhost:3000/api/auth/login with JSON body: email, password. Save the token from the response.
4. List meters: GET http://localhost:3000/api/meters (no auth needed).
5. Get active session: GET http://localhost:3000/api/sessions/active with header: Authorization Bearer YOUR_TOKEN.
6. Start session: POST http://localhost:3000/api/sessions with header Authorization Bearer YOUR_TOKEN and body: meter_id (number), duration_minutes (number).

---

## Troubleshooting

- If you see "Failed to load meters" or the map is empty: make sure the backend is running, the API URL in config is correct for your platform (see Step 2), and the backend database has been initialized with seed data (parking_meters table has rows).
- If login or signup fails: check that the backend is running and that CORS allows your app origin (e.g. Expo web uses localhost).
- If notifications do not appear: ensure notification permission is granted and, for iOS, try a real device if the simulator does not show them.
- On web, the map is replaced by a list of meters; tap a meter in the list to open its details. Full map view is on iOS and Android.
