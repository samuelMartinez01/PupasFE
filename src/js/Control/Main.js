import TipoProducto from "./TipoProducto.js";
import Producto from "./Producto.js";
import { orden } from "./Orden.js";

class Main {
    constructor(containerId) {
        this.mainContainer = document.getElementById(containerId);
        this.tipoProductoService = new TipoProducto();
        this.productoService = new Producto();
    }

    async init() {
        const tiposProductos = await this.tipoProductoService.obtenerTiposProducto();
        if (!tiposProductos) return;
        this.crearBotonesOrden();
        this.showTiposProducto(tiposProductos);
       // this.confirmarOrden();
    }

    crearBotonesOrden() {
        // Botón Crear Orden
        this.crearBtn = document.createElement('button');
        this.crearBtn.id = 'crear-orden';
        this.crearBtn.className = 'btn-crear';
        this.crearBtn.textContent = 'Crear Orden';
        this.mainContainer.appendChild(this.crearBtn);
        this.crearBtn.addEventListener('click', () => orden.ordenInit());

        // Botón Cancelar Orden
        this.cancelarBtn = document.createElement('button');
        this.cancelarBtn.id = 'cancelar-orden';
        this.cancelarBtn.className = 'btn-cancelar';
        this.cancelarBtn.textContent = 'Cancelar Orden';
        this.cancelarBtn.style.display = 'none';
        this.mainContainer.appendChild(this.cancelarBtn);
        this.cancelarBtn.addEventListener('click', () => {
            if (confirm("¿Seguro de que quieres cancelar la orden?")) {
                orden.cancelarOrden();
            }
        });

        // Botón Confirmar Orden
        this.confirmarBtn = document.createElement('button');
        this.confirmarBtn.id = 'confirmar-orden';
        this.confirmarBtn.className = 'btn-confirmar';
        this.confirmarBtn.textContent = 'Confirmar Orden';
        this.confirmarBtn.style.display = 'none';
        this.mainContainer.appendChild(this.confirmarBtn);
        this.confirmarBtn.addEventListener('click', () => {
            orden.confirmarOrden().then(result => {
                alert(result.success ? "Orden confirmada con éxito!" : "Error al confirmar la orden: " + result.message);
            });
        });
    }

    showTiposProducto(tiposProductos) {
        tiposProductos.forEach(tipo => {
            const tipoProductoCard = document.createElement('button');
            tipoProductoCard.className = 'tipoproducto-card';
            tipoProductoCard.innerHTML = `<h2>${tipo.nombre} ${tipo.observaciones || ''}</h2>`;
            const productosContainer = document.createElement('div');
            productosContainer.className = 'productos-container';
            const detallesContainer = document.createElement('div');
            detallesContainer.className = 'productos-detalle';
            detallesContainer.id = `detalles-${tipo.idTipoProducto}`;
            detallesContainer.style.display = 'none';
            //Eventro que despliega los productos segun el tipo
            tipoProductoCard.addEventListener('click', async () => {
                if (detallesContainer.innerHTML === '') {
                    const productos = await this.productoService.getProductos(tipo.idTipoProducto);
                    this.productoService.showProductos(productos, tipo.idTipoProducto);
                }
                this.productoService.toggleDetalles(tipo.idTipoProducto);
            });

            productosContainer.appendChild(tipoProductoCard);
            productosContainer.appendChild(detallesContainer);
            this.mainContainer.appendChild(productosContainer);
        });
    }

}


document.addEventListener('DOMContentLoaded', () => {
    const app = new Main('main-container');
    app.init();
});
