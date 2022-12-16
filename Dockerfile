FROM node:lts-alpine3.16
RUN apk add git
# Set production environment for nodejs application
COPY . .
RUN export NODE_OPTIONS=--openssl-legacy-provider

RUN yarn cache clean --force

RUN yarn setup
RUN yarn bootstrap
RUN yarn --openssl-legacy-provider build 
CMD ["yarn", "start"] 
