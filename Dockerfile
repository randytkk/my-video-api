FROM node:alpine
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY ./ ./
RUN npm i
RUN apk --no-cache add curl
CMD ["npm", "run", "start"]