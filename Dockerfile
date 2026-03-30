# Stage 1: Build the React Application
FROM node:22-alpine AS frontend-builder

# Declare the build argument so Railway can inject it during docker build
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package*.json ./
RUN npm config set legacy-peer-deps true
RUN npm install

# Build frontend (VITE_GOOGLE_CLIENT_ID is now embedded into the bundle)
COPY frontend ./
RUN npm run build

# Stage 2: Final Production Image
FROM node:22-alpine

# Install runtime dependencies
RUN apk add --no-cache ca-certificates

WORKDIR /app/backend

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install --production && npm install pdf-parse@1.1.1

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
