import { orden } from "./Orden.js";
import DataAccess from "./DataAcces.js";

class Producto extends DataAccess {
    constructor() {
        super();
    }
    async getProductos(idTipoProducto) {
        try {
            const response = await fetch(this.BASE_URL + `producto/tipoproducto/${idTipoProducto}`, { method: "GET" });
           if (response.ok){
                const productos = await response.json();
                return productos;
            } else {
                throw new Error(`Error http: ${response.status}`);
            }
        } catch (error) {
            console.error(`No se obtuvieron productos del  tipo ${idTipoProducto}:`, error);
            return null;
        }
    }

    showProductos(productos, idTipoProducto) {
         //Contenedor principal que contiene los productos desplegados
        const detallesContainer = document.getElementById(`detalles-${idTipoProducto}`);
        if (productos && productos.length > 0) {
            detallesContainer.innerHTML = productos.map(p => {
                const producto = {
                    idProducto: p.idProducto,
                    nombre: p.nombre,
                    precioActual: p.precioActual
                };
                const productoJSON = JSON.stringify(producto);
                const html = `
                    <div class="producto-item" data-producto='${productoJSON}'>
                        <h3>${p.nombre}</h3>
                        <h5>Precio c/u: $${p.precioActual}</h5>
                        <button 
                            class="btn-agregar" 
                            style="${!orden.ordenActiva ? 'display: none;' : ''}"> 
                            Agregar a la orden
                        </button>
                    </div>
                `;
                return html;
            }).join('');
        } else {
            detallesContainer.innerHTML = '<p class="info">No hay productos disponibles</p>';
            return;
        }

        // Evento para agregar producto a la orden BOTON3
        detallesContainer.querySelectorAll('.btn-agregar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productoItem = e.target.closest('.producto-item');
                const productoData = JSON.parse(productoItem.dataset.producto);
                orden.addProducto(productoData);
            });
        });
    }

    mostrarDetalles(idTipoProducto) {
        const idContenedor = idTipoProducto === "0" ? 'detalles-combos' : `detalles-${idTipoProducto}`;
        const contenedor = document.getElementById(idContenedor);
        contenedor.style.display = contenedor.style.display === 'none' ? 'block' : 'none';
    }
}

export default Producto;
