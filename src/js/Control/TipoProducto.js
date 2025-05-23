import DataAccess from "./DataAcces.js";

class TipoProducto extends DataAccess {
    async getTipoProducto() {
        try {
            const response = await fetch(this.BASE_URL + "tipoproducto", { method: "GET" });
          // const response = await fetch(this.BASE_URL + "tipoproducto.json", { method: "GET" }); //Pruebas
            const tiposProductos = await response.json();
            return tiposProductos;
        } catch (error) {
            console.error("Error al obtener los tipos de producto:", error);
            return null;
        }
    }
}

export default TipoProducto; 