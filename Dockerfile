FROM node:lts-alpine
RUN apk add git
RUN apk --no-cache add sudo

# Set production environment for nodejs application
COPY . .
RUN export NODE_OPTIONS=--openssl-legacy-provider

RUN yarn setup
RUN yarn bootstrap
RUN yarn --openssl-legacy-provider build 
CMD ["yarn", "start"] 
