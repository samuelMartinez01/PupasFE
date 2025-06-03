import DataAccess from "./DataAcces.js";
import { orden } from "./Orden.js";

class Combo extends DataAccess {
    constructor() {
        super();
    }

    async getCombo() {
        try {
            const response = await fetch(this.BASE_URL + "combo", { method: "GET" });
            if (!response.ok) throw new Error("Error en la respuesta de la API");
            return await response.json();
        } catch (error) {
            console.error("Error al obtener los combos:", error);
            return null;
        }
    }

    async showCombos() {
        const detallesContainer = document.getElementById('detalles-combos');
        if (!detallesContainer) {
            console.error("No se encontró el contenedor de combos");
            return;
        }

        try {
            const combosData = await this.getCombo();
            if (!combosData || !combosData.length) {
                detallesContainer.innerHTML = '<p>No hay combos disponibles</p>';
                return;
            }

            detallesContainer.innerHTML = ''; // Limpiar contenedor

            combosData.forEach(combo => {
                const comboCard = document.createElement('div');
                comboCard.className = 'producto-card combo-card';

                const productosList = combo.productos.map(producto =>
                    `<li>${producto.cantidad}x ${producto.nombre} - $${producto.precioUnitario.toFixed(2)} c/u</li>`
                ).join('');

                comboCard.innerHTML = `
                    <div class="combo-header">
                        <h3>${combo.nombre}</h3>
                        <span class="combo-price">$${combo.precioTotal.toFixed(2)}</span>
                    </div>
                    ${combo.descripcionPublica ? `<p class="combo-description">${combo.descripcionPublica}</p>` : ''}
                    <div class="combo-products">
                        <h4>Contenido:</h4>
                        <ul>${productosList}</ul>
                    </div>
                    <button class="btn-agregar" 
                        style="${!orden.ordenActiva ? 'display: none;' : ''}" 
                        data-combo='${JSON.stringify(combo)}'>
                        Agregar Combo
                    </button>
                `;

                detallesContainer.appendChild(comboCard);
            });

            document.querySelectorAll('.btn-agregar').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (!orden.ordenActiva) return;
                    const comboData = JSON.parse(e.target.dataset.combo);
                    comboData.productos.forEach(producto => {
                        const productoParaOrden = {
                            idProducto: producto.idProducto,
                            nombre: producto.nombre,
                            precioActual: producto.precioUnitario,
                            cantidad: producto.cantidad,
                            observaciones: `De combo "${comboData.nombre}"`
                        };
                        orden.addProducto(productoParaOrden);
                    });
                });
            });

        } catch (error) {
            console.error("Error al mostrar combos:", error);
            detallesContainer.innerHTML = '<p class="error">Error al cargar combos</p>';
        }
    }
}

export default Combo;