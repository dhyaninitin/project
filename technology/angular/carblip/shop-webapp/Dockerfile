# Stage 1: Build Angular Application
FROM node:14 as builder

WORKDIR /app

# Copy all project files to the working directory
COPY . .

# Install dependencies
RUN npm install node-sass@^4.0.0 --save-dev
RUN npm install -g @angular/cli@11.2.8
RUN npm install

#RUN build
ARG BUILD_ENV
RUN ng build --configuration=$BUILD_ENV --source-map=false

# Stage 2: Serve Angular Application
FROM nginx

# Update the default nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./nginxsite.conf /etc/nginx/conf.d/default.conf

# Copy the built Angular app from the previous stage
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/ /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
