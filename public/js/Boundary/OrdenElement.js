import { html, render } from '../librerias/lit/lit-html.js';
import { orden } from '../Control/Orden.js';

class OrdenElement extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        orden.onChange = () => this.render();
        this.render();
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
                    top: 20px;
                    right: 20px;
                    width: 300px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 15px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    display: ${orden.ordenActiva ? 'block' : 'none'};
                }
                .producto-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 8px 0;
                    padding: 8px;
                    border-bottom: 1px solid #eee;
                }
                .cantidad-control {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .producto-info {
                    flex-grow: 1;
                }
                .producto-subtotal {
                    font-weight: bold;
                    min-width: 60px;
                    text-align: right;
                }
                .total-orden {
                    font-weight: bold;
                    text-align: right;
                    margin-top: 10px;
                    font-size: 1.1em;
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
            </div>
        `;
    }

    addEventListeners() {
        const productosOrden = this.root.querySelector('#productos-orden');
        if (!productosOrden) return;
        if (this._listenerAttached) return;
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