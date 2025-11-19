# Stage 1 — build
FROM node:20-alpine AS builder
WORKDIR /app


# Install build deps
COPY package.json package-lock.json ./
# If using pnpm/yarn adapt accordingly
RUN npm ci --production=false


# Copy source
COPY . .


# Build TypeScript
RUN npm run build


# Stage 2 — runtime
FROM node:20-alpine AS runner
WORKDIR /app


ENV NODE_ENV=production


# Copy only necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist


# If your app needs .env or config, you can COPY them or mount at runtime


# Expose port (adjust if you use different port)
EXPOSE 3000


# Recommended non-root user (optional)
RUN addgroup -S app && adduser -S app -G app
USER app


CMD ["node", "dist/main.js"]