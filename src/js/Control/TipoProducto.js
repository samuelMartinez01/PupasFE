import DataAccess from "./DataAcces.js";

class TipoProducto extends DataAccess {
    constructor() {
        super();
    }

        getTipoProducto() {
            const tiposProductos = fetch(this.BASE_URL + "tipoproducto", 
                { method: "GET" })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error(`HTTP Error: ${response.status}`);
                    }
                })
                .catch(err => {
                    console.error("Error al obtener los tipos de producto:", err);
                    return null;
                });

            return tiposProductos;
        }
}

export default TipoProducto; 