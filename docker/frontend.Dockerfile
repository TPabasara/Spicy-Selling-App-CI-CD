# ===== Stage 1: Build =====
FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_ENV=development

# Install app dependencies for build
COPY frontend/package*.json ./
# bypasses resolving dependency versions and strictly installs exactly what is in package-lock.json, ensuring reproducible, deterministic builds every single time.
RUN npm ci

# Copy source code and build the production artifact
COPY frontend/ ./
# creates a specialized, minimal version of the app that includes only the exact files needed to run.
RUN npm run build

# ===== Stage 2: Runtime =====
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create a non-root user for runtime execution
RUN addgroup -S nextjs && adduser -S -G nextjs nextjs

# Copy only the Next.js standalone output and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set ownership and reduce image size by keeping only runtime files
RUN chown -R nextjs:nextjs /app

USER nextjs

EXPOSE 3000
# Ensures the Node.js server receives a polite shutdown signal, allowing it to finish processing active requests before terminating.
STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:3000/"]

CMD ["node", "server.js"]