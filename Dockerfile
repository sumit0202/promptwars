FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY backend ./backend
COPY frontend ./frontend

# Expose port
EXPOSE 3000

# Start server
CMD [ "npm", "start" ]
