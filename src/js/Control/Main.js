import TipoProducto from "./TipoProducto.js";
import Producto from "./Producto.js";
import Pago from "./Pago.js";   
import Combo from "./Combo.js"
import BotonFactory from "../Boundary/BotonFactory.js";
import { orden } from "./Orden.js";

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
        this.crearBtn = BotonFactory.crearBoton({
            id: 'crear-orden',
            clase: 'btn-crear',
            texto: 'Crear Orden',
            evento: () => orden.initOrden(),
            visible: true
        });
        this.mainContainer.appendChild(this.crearBtn);

        this.cancelarBtn = BotonFactory.crearBoton({
            id: 'cancelar-orden',
            clase: 'btn-cancelar',
            texto: 'Cancelar Orden',
            evento: () => {
                if (confirm("¿Seguro de que quieres cancelar la orden?")) {
                    orden.cancelOrden();
                }
            },
            visible: false
        });
        this.mainContainer.appendChild(this.cancelarBtn);
    
        this.pagarBtn = BotonFactory.crearBoton({
            id: 'pagar-orden',
            clase: 'pagar-btn',
            texto: 'Ir a pagar',
            evento: () => {
                document.getElementById('main-container').style.display = 'none';
                document.getElementById('pagos').style.display = 'block';
                this.Pago.initPago(orden.calcularTotal());
            },
            visible: false
        });
        this.mainContainer.appendChild(this.pagarBtn);
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
                    if (tipo.idTipoProducto === "0") {
                        await this.combo.showCombos();
                        this.producto.toggleDetalles(tipo.idTipoProducto);
                    } else {
                        const productos = await this.producto.getProductos(tipo.idTipoProducto);
                        this.producto.showProductos(productos, tipo.idTipoProducto);
                        this.producto.toggleDetalles(tipo.idTipoProducto);
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
