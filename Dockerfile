# The simulation is static files, so the image is just nginx plus the built site — no bun,
# no sources at runtime.
#
# Built and pushed by `amq lulas deploy`, which also tags each build with a timestamp so the
# VPS can roll back to any previous version.

FROM oven/bun:1-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# `bun run build` also copies recover/js-2014 into dist/2014 (amq-lulas-build-versions) and
# generates the service worker from what landed there, so the archive and versions/ have to
# be in the context — `.dockerignore` keeps everything else out.
COPY . .
RUN bun run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /site
