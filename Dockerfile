FROM node:14-alpine
RUN apk add git
RUN apk --no-cache add sudo

# Set production environment for nodejs application
COPY . .
RUN export NODE_OPTIONS=--openssl-legacy-provider

RUN yarn cache clean --force

RUN yarn setup
RUN sudo yarn bootstrap
RUN yarn --openssl-legacy-provider build 
CMD ["yarn", "start"] 
