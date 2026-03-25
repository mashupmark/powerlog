FROM node:24.14.0-slim AS build

WORKDIR /app
COPY . /app

ENV CI=true
RUN corepack enable
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM node:24.14.0-slim AS prod

ENV PORT=3000
ENV NODE_ENV=production

WORKDIR /app
COPY --from=build /app/.output /app/.output

CMD ["node", ".output/server/index.mjs"]