FROM node:10.18.0 as build-deps

RUN apt-get update
RUN apt-get install cron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

CMD [ "crontab", "/usr/src/app/crontab.txt" ]
CMD [ "service", "cron", "restart" ]

EXPOSE 8080
CMD [ "npm", "start" ]