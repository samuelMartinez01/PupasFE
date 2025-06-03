para ejecutar con el yml 

docker compose up --build //levanta//git//

docker compose down //baja

con dockerfile
# 1. Construir la imagen Docker 
docker build -t pupasv .

# 2. Correr el contenedor, exponiendo el puerto 3000
docker run -p 3000:3000 pupasv
