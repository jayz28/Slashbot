FROM ubuntu:20.04

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    nodejs \
    npm \
    php7.4

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y \
    build-essential

COPY . /root

WORKDIR /root

RUN make install
