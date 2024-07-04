# Use the official Node.js LTS (Long Term Support) image as the base image
FROM node:10 as build-stage

# Set the working directory in the container
WORKDIR /app

# Copy all project files to the working directory
COPY . .

# Install the project dependencies
RUN npm install -g grunt-cli bower && \
    apt install git && \
    npm install && \
    bower install bootstrap --allow-root

#Create the build
RUN grunt build

# Set the entry point command for the container
CMD ["node", "dist/app.js"]
