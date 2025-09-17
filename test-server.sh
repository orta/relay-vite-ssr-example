#!/bin/bash

# Exit on any error
set -e

echo "Starting dev server test..."

# Start the dev server in the background
npm run dev &
DEV_SERVER_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Stopping dev server (PID: $DEV_SERVER_PID)..."
    kill $DEV_SERVER_PID 2>/dev/null || true
    wait $DEV_SERVER_PID 2>/dev/null || true
    echo "Dev server stopped."
}

# Set trap to cleanup on script exit
trap cleanup EXIT

echo "Waiting for dev server to start..."
# Wait for server to be ready (max 30 seconds)
for i in {1..30}; do
    if curl -s http://localhost:8082 > /dev/null 2>&1; then
        echo "Server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Server failed to start within 30 seconds"
        exit 1
    fi
    sleep 1
done

echo "Making request to root endpoint..."
RESPONSE=$(curl -s http://localhost:8082)

# Check if response contains film-related content (indicating it's showing films, not planets directly at root)
if echo "$RESPONSE" | grep -i "film" > /dev/null; then
    echo "✅ SUCCESS: Root endpoint returned content with films"

    # For additional verification, check if it's the films page
    if echo "$RESPONSE" | grep -i "New Hope" > /dev/null; then
        echo "✅ SUCCESS: Root endpoint shows 'New Hope' as expected"
    fi
else
    echo "❌ FAILURE: Root endpoint did not return expected content"
    echo "Response preview:"
    echo "$RESPONSE" | head -20
    exit 1
fi

echo "Test completed successfully!"