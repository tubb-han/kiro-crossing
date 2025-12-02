# Use nginx:alpine as base image for minimal size
# Alternative: Use ghcr.io mirror if Docker Hub rate limit is hit
FROM nginx:alpine

# Copy static game files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY game.js /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

# nginx:alpine runs nginx automatically, no CMD needed
