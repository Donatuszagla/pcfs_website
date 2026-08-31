FROM node:22-alpine AS build
ARG VITE_API_URL=http://localhost:4000/graphql
ARG VITE_TURNSTILE_SITE_KEY=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
EXPOSE 4173
CMD ["yarn", "start"]
