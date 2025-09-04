# Use nginx as base image to serve static files
FROM nginx:alpine

# Copy the todo app files to nginx html directory
COPY todo-app/ /usr/share/nginx/html/

# Copy custom nginx configuration if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
