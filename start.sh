#!/bin/bash

# Ensure we're in the script's directory
cd "$(dirname "$0")"

echo "Starting Bingo Game Application..."

# Check if backend dependencies are installed
if [ ! -d "backend/__pycache__" ]; then
    echo "Installing backend dependencies..."
    cd backend && pip install -r requirements.txt
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start the application
echo "Starting backend and frontend..."
echo "Backend will run on http://0.0.0.0:5000"
echo "Frontend will run on http://0.0.0.0:5173"

# Run both backend and frontend concurrently
(cd backend && python app.py) &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend from root directory (where package.json with dev script is located)
npm run dev &
FRONTEND_PID=$!

# Function to cleanup background processes
cleanup() {
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap signals to cleanup processes
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID