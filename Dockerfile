FROM node:8
# WORKDIR specifies the directory our application's code will live within
WORKDIR /MyNodeApp
# We copy our package.json file to our app directory
COPY package.json /MyNodeApp
# We then run npm install to install express for our application
RUN npm install
# We then copy the rest of our application to the app directory
COPY . /MyNodeApp
# We start our application by calling npm start.
CMD ["npm", "start"]