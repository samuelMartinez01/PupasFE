import TipoProducto from "./TipoProducto.js";
import Producto from "./Producto.js";
import Pago from "./Pago.js";   
import Combo from "./Combo.js"
import { orden } from "./Orden.js";
import '../Boundary/OrdenElement.js'

class Main {
    constructor(containerId) {
        this.mainContainer = document.getElementById(containerId);
        this.tipoProducto = new TipoProducto();
        this.producto = new Producto();
        this.Pago = new Pago();
        this.combo = new Combo();
    }

    async init() {
        const tiposProductos = await this.tipoProducto.getTipoProducto();
        const combos = await this.combo.getCombo();
        const tipos = [
            ...tiposProductos,
            {idTipoProducto:"0", nombre: "Combos", observaciones:""}
        ];
        this.combosData = combos;

        if (tipos) {
            this.createBotonesOrden();
            this.showMenu(tipos);
        } else {
            return;
        }
    }

    createBotonesOrden() {
        this.crearBtn = document.createElement('button');
        this.crearBtn.id = 'crear-orden';
        this.crearBtn.className = 'btn-crear';
        this.crearBtn.textContent = 'Crear Orden';
        this.mainContainer.appendChild(this.crearBtn);
        this.crearBtn.addEventListener('click', () => orden.initOrden());

        this.cancelarBtn = document.createElement('button');
        this.cancelarBtn.id = 'cancelar-orden';
        this.cancelarBtn.className = 'btn-cancelar';
        this.cancelarBtn.textContent = 'Cancelar Orden';
        this.cancelarBtn.style.display = 'none';
        this.mainContainer.appendChild(this.cancelarBtn);
        this.cancelarBtn.addEventListener('click', () => {
            if (confirm("¿Seguro de que quieres cancelar la orden?")) {
                orden.cancelOrden();
            }
        });

        this.pagarBtn = document.createElement('button');
        this.pagarBtn.id = 'pagar-orden';
        this.pagarBtn.className = 'pagar-btn';
        this.pagarBtn.textContent = 'Ir a pagar';
        this.pagarBtn.style.display = 'none';
        this.mainContainer.appendChild(this.pagarBtn);
        this.pagarBtn.addEventListener('click', () => {
            document.getElementById('main-container').style.display = 'none';
            document.getElementById('pagos').style.display = 'block';
            this.Pago.initPago(orden.calcularTotal());
        });
    }
    

    showMenu(tiposProductos) {
        tiposProductos.forEach(tipo => {
            const tipoProductoCard = document.createElement('button');
            tipoProductoCard.className = 'tipoproducto-card';
            tipoProductoCard.innerHTML = `<h2>${tipo.nombre} ${tipo.observaciones || ''}</h2>`;

            const productosContainer = document.createElement('div');
            productosContainer.className = 'productos-container';

            const detallesContainer = document.createElement('div');
            detallesContainer.className = 'productos-detalle';
            detallesContainer.id = tipo.idTipoProducto === "0" ? 'detalles-combos' : `detalles-${tipo.idTipoProducto}`;
            
            detallesContainer.style.display = 'none';
            //Evento que despliega los productos segun el tipo
            tipoProductoCard.addEventListener('click', async () => {
                try {
                    const idContenedor = tipo.idTipoProducto === "0" ? 'detalles-combos': `detalles-${tipo.idTipoProducto}`;
                    const contenedorActual = document.getElementById(idContenedor);
                    const estaVisible = contenedorActual.style.display === 'block';
          
                    document.querySelectorAll('.productos-detalle').forEach(detalle => {
                        detalle.style.display = 'none';
                    });

                    if (!estaVisible) {
                        if (tipo.idTipoProducto === "0") {
                            await this.combo.showCombos();
                        } else {
                            const productos = await this.producto.getProductos(tipo.idTipoProducto);
                            this.producto.showProductos(productos, tipo.idTipoProducto);
                        }
                        contenedorActual.style.display = 'block';
                    }
                } catch (error) {
                    console.error(`Error al cargar ${tipo.nombre}:`, error);
                }
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
