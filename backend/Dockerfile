FROM node:16-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Create uploads directory
RUN mkdir -p uploads/documents

# Expose port
EXPOSE 5001

# Start command
CMD ["npm", "start"]
