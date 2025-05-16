FROM node:22-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build the application
RUN npm run build

# Create production image
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/scripts ./scripts

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Run the application in cluster mode for production
CMD ["node", "scripts/cluster-start.js"]
