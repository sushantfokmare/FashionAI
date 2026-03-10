# ================================
# FRONTEND DOCKERFILE
# Purpose: Build and serve React app
# ================================

# Stage 1: Build the React app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all source code
COPY . .

# Build the React app for production
# This creates optimized static files in /app/dist
RUN npm run build

# Stage 2: Serve with lightweight nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional - we'll create this)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
