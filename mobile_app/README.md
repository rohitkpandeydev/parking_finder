# Mobile Application (React Native)

This folder contains the React Native mobile application for the Parking Finder MVP.

## Status

🚧 **In Development** - To be implemented by the mobile app team

## Technology Stack

- React Native
- TypeScript (planned)
- React Navigation (planned)

## Purpose

- User authentication
- Parking meter discovery
- Parking session management
- Notifications

## Setup

This directory is ready for React Native project initialization. The mobile app team should:

1. Initialize React Native project:
   ```bash
   npx react-native init ParkingFinder --template react-native-template-typescript
   ```

2. Or use Expo (if preferred):
   ```bash
   npx create-expo-app ParkingFinder --template
   ```

3. Update the Dockerfile with appropriate build commands

## Docker

A Dockerfile template is provided in this directory. It will need to be updated once the React Native project structure is established.

## CI/CD

GitHub Actions workflow is configured to build and push Docker images when changes are made to this directory.
