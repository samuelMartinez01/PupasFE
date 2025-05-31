import { orden } from "./Orden.js";
import DataAccess from "./DataAcces.js";

class Producto extends DataAccess {
    constructor() {
        super();
    }

    async getProductos(idTipoProducto) {
        // Si es SODAS (tipo quemado)
        if (parseInt(idTipoProducto) === 100) {
            // Devuelve los 3 productos quemados
            return [
                { idProducto: 2001, nombre: "Fanta", precioActual: 1.10 },
                { idProducto: 2002, nombre: "Pepsi", precioActual: 1.10 },
                { idProducto: 2003, nombre: "CocaCola", precioActual: 1.10 }
            ];
        }
        // Si no, llama la API normal
        try {
            const response = await fetch(this.BASE_URL + `producto/tipoproducto/${idTipoProducto}`, { method: "GET" });
            if (response.ok) {
                const productos = await response.json();
                return productos;
            } else {
                throw new Error(`Error http: ${response.status}`);
            }
        } catch (error) {
            console.error(`No se obtuvieron productos del tipo ${idTipoProducto}:`, error);
            return null;
        }
    }

    async renderProductosEnCajon(idTipoProducto) {
        const productos = await this.getProductos(idTipoProducto);
        const contenedor = document.getElementById('productos-list-cajon');
        if (!contenedor) return;

        if (!productos || !productos.length) {
            contenedor.innerHTML = `
                <div class="select-category-message">No hay productos para esta categoría</div>
            `;
            return;
        }

        contenedor.innerHTML = productos.map(p => `
            <div class="producto-card" data-producto='${JSON.stringify({
            idProducto: p.idProducto,
            nombre: p.nombre,
            precioActual: p.precioActual
        })}'>
                <div class="producto-nombre">${p.nombre}</div>
                <div class="producto-precio">$${p.precioActual}</div>
                <button class="btn-agregar-producto"${!orden.ordenActiva ? ' style="display:none;"' : ''}>Agregar</button>
            </div>
        `).join('');

        contenedor.querySelectorAll('.btn-agregar-producto').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.producto-card');
                const data = JSON.parse(card.dataset.producto);
                orden.addProducto(data);
                card.classList.add('added');
                setTimeout(() => card.classList.remove('added'), 700);
            });
        });
    }
}

export default Producto;
