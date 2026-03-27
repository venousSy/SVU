# Stage 1: Build the React Application
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package*.json ./
RUN npm config set legacy-peer-deps true
RUN npm install

# Build frontend
COPY frontend ./
RUN npm run build

# Stage 2: Final Production Image
FROM node:22-alpine

# Install runtime dependencies
RUN apk add --no-cache ca-certificates

WORKDIR /app/backend

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source code
COPY backend ./

# Copy compiled frontend from Stage 1 into the production container
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Ensure the server knows it's running in production
ENV NODE_ENV=production

# Expose port (Railway dynamically maps PORT, but 5000 is our default fallback)
EXPOSE 5000

# Railway starts the app using 'npm start' in the root or working directory.
# Since our workdir is /app/backend, 'npm start' runs 'node server.js'
CMD ["npm", "start"]
