#!/bin/sh
echo "Running database seed..."
node dist/database/seed.js
echo "Seed complete. Starting application..."
exec node dist/main.js
