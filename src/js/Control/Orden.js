import DataAccess from "./DataAcces.js";

class Orden extends DataAccess {
    constructor() {
        super();
        this.ordenActual = {
            productos: [],
            sucursal: 'TEST' // Valor por defecto
        };
    }

    //verifica si ya existe el producto y si lo vuelve a seleccionar aumenta la cantidad
    agregarProducto(producto) {
        const productoExistente = this.ordenActual.productos.find(item =>  
            item.id_producto === producto.idProducto,
        );
        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            this.ordenActual.productos.push({  
                idProducto: producto.id_producto,
                nombreProducto: producto.nombre,
                precioUnitario: producto.precioActual,
                cantidad: 1
            });
        }
        total: this.calcularTotal().toFixed(2) 

        console.log("Orden a enviar:", this.ordenActual);
        console.log("Productos en la orden:", this.ordenActual.productos);
        return this.ordenActual;
    }

    calcularTotal() {
        const total = this.ordenActual.productos.reduce(
            (total, item) => total + (item.precioUnitario * item.cantidad), 0
        );
        console.log("Precio de la orden:", total);
        return total;
    }

    async confirmarOrden() {
        try {
            // Enviar la orden como JSON con el encabezado adecuado
            const response = await fetch(this.BASE_URL + "orden", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"  // Asegúrate de enviar el encabezado adecuado
                },
                body: JSON.stringify(this.ordenActual) // Convierte el objeto a JSON
            });
    
            // Revisar la respuesta de la API
            if (response.ok) {
                console.log("Orden confirmada con éxito");
                return { success: true, message: "Orden creada exitosamente" };
            } else {
                console.error("Error al crear la orden:", response.statusText);
                return { success: false, message: "Error al crear la orden" };
            }
        } catch (error) {
            console.error("Error al confirmar la orden:", error);
            return { success: false, message: "Error al crear la orden" };
        }
    }
    
}

export const orden = new Orden();