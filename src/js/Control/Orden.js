import DataAccess from "./DataAcces.js";

class Orden extends DataAccess {
    constructor() {
        super();
        this.ordenActual = {
            productos: [],
            sucursal: 'TEST' // Valor por defecto
        };
        this.ordenActiva = false; // Estado para controlar si la orden está activa
    }

    // Inicia una nueva orden
    ordenInit() {
        this.ordenActiva = true;
        this.ordenActual = {
            productos: [],
            sucursal: 'TEST'
        };
        this.actualizarEstadoOrden();
    }

    // Cancela la orden
    cancelarOrden() {
        this.ordenActiva = false;
        this.ordenActual = {
            productos: [],
            sucursal: 'TEST'
        };
        this.actualizarEstadoOrden();
    }


    // Método para actualizar según el estado de la orden
    actualizarEstadoOrden() {
        const confirmarBtn = document.getElementById('confirmar-orden'); // #BOTON4 de tp
        const crearOrdenBtn = document.getElementById('crear-orden'); //BOTON1 de tp
        const cancelarOrdenBtn = document.getElementById('cancelar-orden'); //BOTON2 de tp

        // Mostrar/ocultar botones según el estado
        if (crearOrdenBtn) {
            crearOrdenBtn.style.display = this.ordenActiva ? 'none' : 'block';
        }
        if (cancelarOrdenBtn) {
            cancelarOrdenBtn.style.display = this.ordenActiva ? 'block' : 'none';
        }
        if (confirmarBtn) {
            confirmarBtn.style.display = 
                this.ordenActiva && this.ordenActual.productos.length > 0 ? 'block' : 'none';
        }

        // Actualiza botones de agregar productos segun el estado de la orden
        document.querySelectorAll('.btn-agregar').forEach(btn => {
            btn.style.display = this.ordenActiva ? 'block' : 'none';
        });
    }

    addProducto(producto) {
        if (!this.ordenActiva) return; 
        const productoExistente = this.ordenActual.productos.find(item => 
            item.idProducto === producto.idProducto
        );
        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            this.ordenActual.productos.push({  
                idProducto: producto.idProducto,
                nombreProducto: producto.nombre,
                precioUnitario: producto.precioActual,
                cantidad: 1
            });
        }
        
        //logs ----borrar al hacer el css!!!!!!!!!!!!!!
        this.calcularTotal().toFixed(2);
        this.actualizarEstadoOrden();
        console.log("Orden a enviar:", this.ordenActual);
        console.log("Productos en la orden:", this.ordenActual.productos);
        return this.ordenActual;
    }

    calcularTotal() { //Para la vista
        const total = this.ordenActual.productos.reduce(
            (total, item) => total + (item.precioUnitario * item.cantidad), 0
        );
        console.log("Precio de la orden:", total);
        return total;
    }

    async confirmarOrden() {
        try {

            const response = await fetch(this.BASE_URL + "orden", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.ordenActual)
            });
    
            if (response.ok) {
                console.log("Orden confirmada con éxito");
                this.ordenActiva = false; //Desactiva la orden despues de ser enviada
                this.actualizarEstadoOrden();
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