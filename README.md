# Parking Finder Application

This repository contains the source code for the Parking Finder MVP application.

## Components

- **Backend**: TypeScript/Node.js API with Express
- **Mobile App**: Flutter application (React Native coming soon)
- **Infrastructure**: Terraform configuration for AWS deployment
- **CI/CD**: GitHub Actions workflows for automated builds and deployments

## Project Structure

```
parking_finder/
├── backend/          # TypeScript backend API
├── mobile_app/       # Flutter mobile application
├── infra/           # Terraform infrastructure as code
├── ci-cd/           # CI/CD workflow definitions
└── docs/            # Project documentation
```

## Quick Start

### Backend

1. Navigate to `backend/` directory
2. Install dependencies: `npm install`
3. Set up environment variables (copy `.env.example` to `.env`)
4. Ensure PostgreSQL is running
5. Run: `npm run dev`

See [backend/README.md](backend/README.md) for detailed API documentation.

### Mobile App

See [mobile_app/README.md](mobile_app/README.md) for Flutter setup instructions.

### Infrastructure

See [infra/README.md](infra/README.md) for Terraform deployment instructions.

## CI/CD Pipeline

The project uses GitHub Actions for CI/CD:

1. **Backend Build**: Automatically builds and pushes Docker image when backend code changes
2. **Mobile App Build**: Automatically builds and pushes Docker image when mobile app code changes
3. **Infrastructure Deployment**: Automatically deploys infrastructure when Docker images are updated

Workflows are located in `.github/workflows/`.

## Features Implemented

- ✅ User registration with email and password
- ✅ User login with JWT token authentication
- ✅ Session management
- ✅ Database schema initialization
- ✅ Docker containerization
- ✅ CI/CD pipelines
- ✅ AWS infrastructure as code (Terraform)

## Environment Variables

### Backend

- `PORT`: Server port (default: 3000)
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration (default: 7d)

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

See [backend/README.md](backend/README.md) for detailed API documentation.

## Status

MVP – In active development
