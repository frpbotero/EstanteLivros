FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG BACKEND_URL
ARG GOOGLE_CLIENT_ID
ENV BACKEND_URL=$BACKEND_URL GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
