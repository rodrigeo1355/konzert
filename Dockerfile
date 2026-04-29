FROM mcr.microsoft.com/playwright/node:20-noble

RUN npm install -g pnpm@9

WORKDIR /app

# Install dependencies using workspace manifests first (layer cache)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/workers/package.json ./apps/workers/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/emails/package.json ./packages/emails/package.json
COPY packages/scraper/package.json ./packages/scraper/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/ui/package.json ./packages/ui/package.json

RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .

RUN cd packages/database && npx prisma generate
RUN pnpm --filter @konzert/workers build

WORKDIR /app/apps/workers

CMD ["node", "dist/index.js"]
