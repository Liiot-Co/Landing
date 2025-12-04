FROM oven/bun:latest

RUN apt-get update  \
    && apt-get install -y \
      git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /app

WORKDIR /app

COPY package.json .

RUN bun install

COPY . /app
