# Use Node.js 20 LTS as base
FROM node:20-alpine AS base

# Install build dependencies (needed for some npm packages like sharp) and fonts for text rendering
RUN apk add --no-cache python3 make g++ ttf-dejavu fontconfig

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
WORKDIR /usr/src/app

# Copy package files and lockfiles for better caching
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# --- Stage 2: Development ---
FROM base AS development

# Install all dependencies (including devDependencies)
RUN pnpm install

# Copy the rest of the application
COPY . .

# Command to run the application in dev mode
CMD ["pnpm", "run", "dev"]

# --- Stage 3: Production ---
FROM base AS production

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application in prod mode
CMD ["pnpm", "start"]
