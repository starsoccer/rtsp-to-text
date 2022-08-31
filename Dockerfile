#ARG BUILD_FROM
#FROM $BUILD_FROM
FROM node:16-bullseye

ENV LANG C.UTF-8

RUN apt update
RUN apt install ffmpeg -y

ADD package.json ./
ADD yarn.lock ./

RUN yarn

# Copy data for add-on
COPY . .
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]