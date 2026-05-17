# =========================
# Build Stage
# =========================
FROM node:24.15.0-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_ARCGIS_API_KEY
ARG VITE_API_URL

ENV VITE_ARCGIS_API_KEY=$VITE_ARCGIS_API_KEY
ENV VITE_API_URL=$VITE_API_URL

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build


# =========================
# Production Stage
# =========================
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]