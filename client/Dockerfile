# Client Dockerfile
# Stage 1: Build
FROM node:20-slim as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (fresh resolution to avoid arch mismatch)
RUN rm -f package-lock.json && npm install

# Copy source code
COPY . .

# Set API URL for production build (relative path to be proxied by Nginx)
ENV VITE_API_BASE_URL=/api
ENV VITE_USE_MOCK_API=false
ENV VITE_BASE_PATH=/

# Build React app
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create Nginx config with Proxy and SPA support
RUN echo 'server { \
    listen 80; \
    \
    # API Proxy \
    location /api/ { \
        proxy_pass http://server:3000/api/; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
    \
    # Static Files & SPA \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
