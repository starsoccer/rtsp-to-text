#ARG BUILD_FROM
#FROM $BUILD_FROM
FROM node:16-bullseye

ENV LANG C.UTF-8

ADD package.json ./
ADD yarn.lock ./

RUN apt update
RUN apt install ffmpeg -y
#RUN \
#    apk add --no-cache \
#        nodejs \
#        npm \
#        yarn \
#        ffmpeg

# Copy data for add-on
COPY . .
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]