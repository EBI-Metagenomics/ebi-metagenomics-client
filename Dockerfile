# Stage 1: Build with Vite
FROM node:20.19-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npx vite build

# Stage 2: Serve with NGINX
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf