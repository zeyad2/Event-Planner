FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --ignore-scripts && \
    npm cache clean --force
COPY . .
RUN chown -R node:node /usr/src/app
EXPOSE 5173
USER node
CMD ["npm", "run", "dev"]
