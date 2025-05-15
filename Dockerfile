# Use Node.js LTS version as the base image
FROM node:18-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "index.js"]
