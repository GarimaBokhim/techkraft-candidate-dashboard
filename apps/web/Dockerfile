FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY . .

# We only want to install and build the web workspace
RUN pnpm install --filter web...
RUN pnpm --filter web build

FROM nginx:alpine
COPY --from=base /app/apps/web/dist /usr/share/nginx/html
RUN sed -i 's/listen  *80;/listen 5173;/' /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
