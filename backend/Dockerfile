# Stage 1: build the NestJS app
FROM node:20-alpine AS builder
# Set the working directory inside the container
WORKDIR /app
# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./
# Install all dependencies including devDependencies needed for the build
RUN npm ci
# Copy the rest of the source code
COPY . .
# Compile TypeScript to JavaScript output in /app/dist
RUN npm run build

# Stage 2: production image — only dist and prod deps
FROM node:20-alpine AS runner
# Set the working directory for the runtime image
WORKDIR /app
# Copy dependency manifests for installing production-only packages
COPY package*.json ./
# Install only production dependencies, skipping devDependencies
RUN npm ci --omit=dev
# Copy compiled output from the builder stage
COPY --from=builder /app/dist ./dist
# Expose the port the NestJS app listens on
EXPOSE 3000
# Start the application from the compiled entry point
CMD ["node", "dist/main"]
