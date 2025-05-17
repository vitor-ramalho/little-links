FROM node:22-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
# Disable husky during Docker build
ENV HUSKY=0
RUN npm ci

# Copy application source
COPY . .

# Build the application
RUN npm run build

# Create production image
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies (don't skip dev deps)
COPY package*.json ./
# Disable husky during Docker build
ENV HUSKY=0
# IMPORTANT: Keep all dependencies (no --omit=dev) to ensure @nestjs/terminus is included
RUN npm ci

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/scripts ./scripts

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Run the application in cluster mode for production
CMD ["node", "scripts/cluster-start.js"]