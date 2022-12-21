FROM node:15-alpine
RUN apk add git
RUN apk --no-cache add sudo
WORKDIR /app

# Set production environment for nodejs application
COPY . /app/
RUN export NODE_OPTIONS=--openssl-legacy-provider

RUN yarn run setup
RUN yarn run bootstrap
RUN yarn --openssl-legacy-provider build 
CMD ["yarn", "start"] 
