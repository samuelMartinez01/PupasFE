# Usa Node.js 
FROM node:20

# Carpeta de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto de los archivos
COPY . .

# Expone el puerto de Express
EXPOSE 3000

# Comando para arrancar
CMD [ "npm", "run", "dev" ]

