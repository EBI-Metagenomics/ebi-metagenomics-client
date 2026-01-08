# Stage 1: Build with Vite
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Run the Vite build
RUN npx vite build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Copy built files to NGINX's web root
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom NGINX config (you better have it set up right)
COPY nginx.conf /etc/nginx/conf.d/default.conf
