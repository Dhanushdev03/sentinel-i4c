# ====================================================================
# SENTINEL-I4C Frontend Dockerfile
# Multi-stage build: Node.js (Vite) + Nginx Alpine
# ====================================================================

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 8443

CMD ["nginx", "-g", "daemon off;"]
