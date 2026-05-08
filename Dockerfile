# Use Node.js 20 LTS as base
FROM node:20-alpine

# Install build dependencies (needed for some npm packages like sharp)
RUN apk add --no-cache python3 make g++

# Create app directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
# We use npm start or node src/app.js depending on the project structure
CMD ["npm", "start"]
