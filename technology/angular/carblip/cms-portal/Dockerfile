# Stage 1: Build Angular Application
FROM node:14 as builder

WORKDIR /app

COPY . .

RUN npm install -g @angular/cli@16.2.10
RUN npm config set legacy-peer-deps true
RUN npm install

ARG BUILD_ENV
RUN ng build --configuration=$BUILD_ENV

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
