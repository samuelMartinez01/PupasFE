import { html, render } from '../librerias/lit/lit-html.js';
import { orden } from '../Control/Orden.js';
import Pago from "../Control/Pago.js";

class OrdenElement extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        orden.onChange = () => this.render();
        this.render();
        this.pago = new Pago();
    }

    render() {
        render(this.template(), this.root);
        this.addEventListeners();
    }

    template() {
        return html`
            <style>
                .orden-container {
                position: fixed;
                top: 110px;
                right: 20px;
                width: 320px;
                background: #e9f8ed; /* Verde claro suave */
                border: 2px solid #28a745; /* Verde principal */
                border-radius: 16px;
                padding: 20px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                z-index: 9999;
                display: ${orden.ordenActiva ? 'block' : 'none'};
                font-family: 'Segoe UI', sans-serif;
            }

            .orden-container h2 {
                margin: 0 0 12px;
                font-size: 1.4em;
                color: #1f7a36;
                text-align: center;
                position: relative;
            }

            .orden-container h2::before {
                content: "🧾";
                margin-right: 8px;
            }

            .producto-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 10px 0;
                padding: 10px 0;
                border-bottom: 1px solid #cde9d6;
            }

            .producto-info {
                flex-grow: 1;
                font-size: 14px;
                color: #1f1f1f;
            }

            .cantidad-control {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .cantidad-control button {
                padding: 4px 10px;
                border: none;
                background-color: #28a745;
                color: white;
                font-size: 16px;
                font-weight: bold;
                border-radius: 6px;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            .cantidad-control button:hover {
                background-color: #1f7a36;
            }

            .cantidad-control span {
                font-size: 15px;
                font-weight: bold;
                color: #333;
            }

            .producto-subtotal {
                font-weight: bold;
                font-size: 14px;
                min-width: 60px;
                text-align: right;
                color: #222;
            }

            .total-orden {
                margin-top: 18px;
                font-weight: bold;
                font-size: 1.2em;
                text-align: right;
                color: #1f7a36;
                border-top: 2px dashed #28a745;
                padding-top: 10px;
            }

            .acciones-orden {
                margin-top: 16px;
                display: flex;
                justify-content: space-between;
                gap: 10px;
            }

            .btn-cancelar,
            .btn-pagar {
                flex: 1;
                padding: 8px;
                border: none;
                border-radius: 6px;
                font-weight: bold;
                font-size: 14px;
                cursor: pointer;
            }

            .btn-cancelar {
                background-color: #dc3545;
                color: white;
            }
            .btn-cancelar:hover {
                background-color: #b02a37;
            }

            .btn-pagar {
                background-color: #28a745;
                color: white;
            }
            .btn-pagar:hover {
                background-color: #1f7a36;
            }
            .btn-pagar:disabled {
                background-color: #c5dbcf;
                color: #777;
                cursor: not-allowed;
                opacity: 0.7;
            }
            </style>

            <div class="orden-container">
                <h2>Orden</h2>
                <div id="productos-orden">
                    ${orden.ordenActual.productos.map(p => html`
                        <div class="producto-item">
                            <div class="producto-info">
                                <div>${p.nombreProducto}</div>
                            </div>
                            <div class="cantidad-control">
                                <button class="btn-menos" data-id=${p.idProducto}>-</button>
                                <span>${p.cantidad}</span>
                                <button class="btn-mas" data-id=${p.idProducto}>+</button>
                            </div>
                            <span class="producto-subtotal">$${(p.precioUnitario * p.cantidad).toFixed(2)}</span>
                        </div>
                    `)}
                </div>
                <div class="total-orden">
                    Total: $${orden.calcularTotal().toFixed(2)}
                </div>
                <div class="acciones-orden">
                <button id="cancelar-orden" class="btn-cancelar">❌ Cancelar Orden</button>
                <button id="pagar-orden" class="btn-pagar" ?disabled=${orden.ordenActual.productos.length === 0}>
                    💰 Ir a pagar
                </button>

                 </div>

            </div>
        `;
    }

    addEventListeners() {
        const productosOrden = this.root.querySelector('#productos-orden');
        if (productosOrden && !this._listenerAttached) {
            this._listenerAttached = true;
            productosOrden.addEventListener('click', (e) => {
                const target = e.target;
                if (!target.dataset.id) return;
                const id = parseInt(target.dataset.id);
                if (target.classList.contains('btn-mas')) {
                    this.incrementarProducto(id);
                } else if (target.classList.contains('btn-menos')) {
                    this.decrementarProducto(id);
                }
            });
        }

        // BOTÓN CANCELAR ORDEN 
        const btnCancelar = this.root.querySelector('#cancelar-orden');
        if (btnCancelar && !btnCancelar._listenerAttached) {
            btnCancelar._listenerAttached = true;
            btnCancelar.addEventListener('click', () => {
                if (confirm("¿Seguro de que quieres cancelar la orden?")) {
                    orden.cancelOrden();
                    orden.estadoOrden();
                }
            });
        }

        // BOTÓN IR A PAGAR 
        const btnPagar = this.root.querySelector('#pagar-orden');
        if (btnPagar && !btnPagar._listenerAttached) {
            btnPagar._listenerAttached = true;
            btnPagar.addEventListener('click', () => {
                const mainContainer = document.getElementById('main-container');
                const pagos = document.getElementById('pagos');
                if (mainContainer && pagos) {
                    mainContainer.style.display = 'none';
                    pagos.style.display = 'block';
                }
                this.pago.initPago(orden.calcularTotal());
            });
        }
    }


    incrementarProducto(idProducto) {
        const producto = orden.ordenActual.productos.find(p => p.idProducto === idProducto);
        if (producto) {
            producto.cantidad += 1;
            orden.notificarCambio();
            orden.estadoOrden();
        }
    }

    decrementarProducto(idProducto) {
        const producto = orden.ordenActual.productos.find(p => p.idProducto === idProducto);
        if (producto) {
            if (producto.cantidad > 1) {
                producto.cantidad -= 1;
            } else {
                orden.ordenActual.productos = orden.ordenActual.productos.filter(p => p.idProducto !== idProducto);
            }
            orden.notificarCambio();
            orden.estadoOrden();
        }
    }

}

customElements.define('carrito-orden', OrdenElement);