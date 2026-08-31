FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["yarn", "start"]
