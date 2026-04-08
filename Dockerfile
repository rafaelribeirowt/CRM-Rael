FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Development stage
FROM base AS dev
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
RUN npm run build

# Production stage
FROM node:20-alpine AS prod
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY drizzle.config.ts ./
COPY src/Infrastructure/Database/Drizzle/migrations ./src/Infrastructure/Database/Drizzle/migrations
COPY src/Infrastructure/Database/Schemas ./src/Infrastructure/Database/Schemas
EXPOSE 3000
CMD ["node", "dist/index.js"]
