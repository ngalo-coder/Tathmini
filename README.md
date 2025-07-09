# Tathmini Project

A comprehensive assessment application with a React Native frontend and FastAPI backend.

## Project Structure

The project is organized into two main directories:

```
Tathmini/
├── Tathmini_Frontend/    # React Native mobile application
│   └── TathminiApp/      # Expo-based React Native app
├── Tathmini_Backend/     # FastAPI backend application
```

## Frontend (React Native with Expo)

The frontend is built using React Native with Expo, providing a cross-platform mobile application.

### Features

- Modern UI with Expo Router for navigation
- TypeScript for type safety
- API service for communication with the backend
- Responsive design with light/dark mode support

### Setup and Running

1. Navigate to the TathminiApp directory:
   ```
   cd Tathmini_Frontend/TathminiApp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the application:
   ```
   npm start
   ```

4. Follow the instructions in the terminal to run on your preferred platform (Android, iOS, or web)

## Backend (FastAPI)

The backend is built using FastAPI, a modern, fast web framework for building APIs with Python.

### Features

- RESTful API endpoints
- SQLAlchemy ORM for database operations
- Pydantic models for data validation
- Organized project structure with routers, models, and schemas

### Setup and Running

1. Navigate to the backend directory:
   ```
   cd Tathmini_Backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   uvicorn main:app --reload
   ```

5. Access the API documentation at http://localhost:8000/docs

## Development

For development, you'll need to run both the frontend and backend applications:

1. Start the backend server:
   ```
   cd Tathmini_Backend
   uvicorn main:app --reload
   ```

2. Start the frontend application:
   ```
   cd Tathmini_Frontend/TathminiApp
   npm start
   ```

## API Communication

The frontend communicates with the backend through the API service. The base URL for API requests is configured in the `ApiService.ts` file.

For Android emulators, use `10.0.2.2` to access the localhost of your machine. For iOS simulators, use `localhost`. For physical devices, use the actual IP address of your computer.