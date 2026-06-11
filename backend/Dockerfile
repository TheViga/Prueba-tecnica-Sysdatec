FROM node:20-alpine

# Prisma needs openssl on Alpine.
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies first (better layer caching).
COPY package.json package-lock.json* ./
RUN npm install

# Generate the Prisma client.
COPY prisma ./prisma
RUN npx prisma generate

# App source.
COPY src ./src

EXPOSE 3004

# Sync the schema to the database, then start the server.
# `prisma db push` is idempotent and creates the tables if they don't exist.
CMD ["sh", "-c", "npx prisma db push --skip-generate && node src/index.js"]
