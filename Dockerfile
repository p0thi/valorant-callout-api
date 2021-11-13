ARG PORT=9000

FROM node:16-alpine AS node


# Builder stage

#FROM node AS builder

# Use /app as the CWD
WORKDIR /app

# Copy package.json and package-lock.json to /app
COPY package*.json ./

# Install all dependencies
RUN npm i --silent

# Copy the rest of the code
COPY . .

# Invoke the build script to transpile ts code to js
RUN npm run build

# Open desired port
EXPOSE ${PORT}

# Run development server
ENTRYPOINT [ "npm", "run", "start" ]

