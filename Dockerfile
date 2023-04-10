

# Use the official Node.js image as a base image
FROM node:latest AS build-stage

# Set the working directory
WORKDIR /app

# Copy client folder and install dependencies
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client/. ./client/

# Build the front-end client
WORKDIR /app/client
RUN npm run build

# Start a new stage for the server
FROM node:latest AS production-stage

# Set the working directory
WORKDIR /app

# Copy server folder and install dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy the build output from the build stage
COPY --from=build-stage /app/client/build/. /app/server/public
# Copy the server folder into the container
COPY server/ /app/server

# Expose the server port
EXPOSE 3000

# Start the server
WORKDIR /app/server
CMD ["npm", "start"]

