# 1. Construir la imagen Docker (puedes cambiar "mi-app-frontend" por otro nombre)
docker build -t pupasv .

# 2. Correr el contenedor, exponiendo el puerto 3000 en tu máquina
docker run -p 3000:3000 pupasv
