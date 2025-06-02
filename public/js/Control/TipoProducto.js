import DataAccess from "./DataAcces.js";

class TipoProducto extends DataAccess {
    constructor() {
        super();
    }
    
    async getTipoProducto() {
        try {
            const response = await fetch(this.BASE_URL + "tipoproducto", { method: "GET" });
            if (response.ok) {
                const tiposProductos = await response.json();
                return tiposProductos;
            } else {
                throw new Error(`Error HTTP: ${response.status}`);
            }
        } catch (error) {
            console.error("Error al obtener los tipos de producto:", error);
            return null;
        }
    }
}

export default TipoProducto; 