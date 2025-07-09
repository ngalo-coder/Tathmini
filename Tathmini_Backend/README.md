# Tathmini Backend

A FastAPI backend for the Tathmini application.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows:
     ```
     .\venv\Scripts\activate
     ```
   - Linux/Mac:
     ```
     source venv/bin/activate
     ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   uvicorn main:app --reload
   ```

## API Documentation

Once the application is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
Tathmini_Backend/
├── app/
│   ├── models/       # SQLAlchemy models
│   ├── routers/      # API routes
│   ├── schemas/      # Pydantic schemas
│   ├── config.py     # Application configuration
│   └── database.py   # Database connection
├── .env              # Environment variables
├── main.py           # Application entry point
└── requirements.txt  # Project dependencies