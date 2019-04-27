# Creates the Trial Management Tool.
#
# You can access the container using:
#   docker run -it trial-management-tool sh
# To start it stand-alone:
#   docker run -it -p 8888:3000 trial-management-tool

FROM node:alpine AS builder
RUN apk add --no-cache --virtual .gyp python make g++ && \
  npm i -g yalc
# ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
# optionally if you want to run npm global bin without specifying path
# ENV PATH=$PATH:/home/node/.npm-global/bin
RUN mkdir /packages && \
  mkdir /packages/models && \
  mkdir /packages/gui && \
  mkdir /packages/server
COPY ./packages/models /packages/models
WORKDIR /packages/models
RUN npm install && \
  npm run build && \
  yalc publish --private
COPY ./packages/gui /packages/gui
WORKDIR /packages/gui
RUN yalc add trial-manager-models && \
  npm install && \
  npm run build
COPY ./packages/server /packages/server
WORKDIR /packages/server
RUN yalc add trial-manager-models && \
  npm install && \
  npm run build

FROM node:alpine
RUN mkdir -p /app
RUN mkdir -p /app/trials
COPY --from=builder /packages/server/package.json /app/package.json
COPY --from=builder /packages/server/certs /app/certs
COPY --from=builder /packages/server/dist /app/dist
COPY --from=builder /packages/server/.yalc /app/.yalc
COPY --from=builder /packages/server/node_modules /app/node_modules
COPY --from=builder /packages/gui/dist /app/public
WORKDIR /app
EXPOSE 3000
CMD ["node", "./dist/main.js"]