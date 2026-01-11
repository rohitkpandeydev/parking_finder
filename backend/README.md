# Backend Service (TypeScript)

This folder contains the backend API for the Parking Finder MVP.

## Technology Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- JWT for authentication
- bcrypt for password hashing

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

3. Ensure PostgreSQL is running and accessible.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Health Check
- **GET** `/api/health`
  - Returns server status

### Authentication

#### Register User
- **POST** `/api/auth/register`
  - **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "SecurePassword123",
      "first_name": "John",
      "last_name": "Doe"
    }
    ```
  - **Response (201):**
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    }
    ```
  - **Password Requirements:**
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number

#### Login
- **POST** `/api/auth/login`
  - **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "SecurePassword123"
    }
    ```
  - **Response (200):**
    ```json
    {
      "message": "Login successful",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  - **Error Responses:**
    - `401`: Invalid email or password
    - `400`: Validation errors

## Environment Variables

- `PORT`: Server port (default: 3000)
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time (default: 7d)

## Database Schema

### Users Table
- `id`: SERIAL PRIMARY KEY
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `password_hash`: VARCHAR(255) NOT NULL
- `first_name`: VARCHAR(100)
- `last_name`: VARCHAR(100)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Authentication

After login, include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Use the `authenticateToken` middleware for protected routes.

## Docker

Build the Docker image:
```bash
docker build -t parking-finder-backend .
```

Run the container:
```bash
docker run -p 3000:3000 --env-file .env parking-finder-backend
```
