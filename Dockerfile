# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

# Copiar manifiestos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (necesitamos @nestjs/cli para el build)
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Generar Prisma Client y compilar TypeScript
RUN npx prisma generate
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl

# Solo los manifiestos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Solo dependencias de producción
RUN npm ci --omit=dev

# Copiar el Prisma Client generado en el stage de build
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copiar el código compilado
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3005

CMD ["node", "dist/src/main.js"]
