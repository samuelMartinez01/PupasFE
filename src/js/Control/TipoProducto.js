import DataAccess from "./DataAcces.js";

class TipoProductoService extends DataAccess {
    async obtenerTiposProducto() {
        try {
            const response = await fetch(this.BASE_URL + "tipoproducto", { method: "GET" });
            const tiposProductos = await response.json();
            return tiposProductos;
        } catch (error) {
            console.error("Error al obtener los tipos de producto:", error);
            return null;
        }
    }
}

export default TipoProductoService; 