# Étape 1 : Build Angular
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Étape 2 : Nginx runtime
FROM nginx:alpine
# Copier le build Angular "browser" à la racine de Nginx
COPY --from=build /app/dist/portfolio-frontend/browser /usr/share/nginx/html

# Config Nginx inline
RUN rm /etc/nginx/conf.d/default.conf && \
    echo 'server { \
        listen 80; \
        server_name localhost; \
        root /usr/share/nginx/html; \
        index index.html; \
        location / { \
            try_files $uri $uri/ /index.html; \
        } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
