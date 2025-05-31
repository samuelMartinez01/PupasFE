import DataAccess from "./DataAcces.js";

class TipoProducto extends DataAccess {
    constructor() {
        super();
    }

    async getTipoProducto() {
        try {
            const response = await fetch(this.BASE_URL + "tipoproducto", { method: "GET" });
            let tiposProductos = [];
            if (response.ok) {
                tiposProductos = await response.json();
            }
            // AGREGAMOS "Sodas" como primer tipo quemado
            tiposProductos.unshift({
                idTipoProducto: 100,
                nombreTipoProducto: "Sodas",
                descripcion: "Bebidas gaseosas frías"
            });
            return tiposProductos;
        } catch (error) {
            console.error("Error al obtener los tipos de producto:", error);
            // Si falla la API igual devolvemos el tipo quemado
            return [{
                idTipoProducto: 100,
                nombreTipoProducto: "Sodas",
                descripcion: "Bebidas gaseosas frías"
            }];
        }
    }

    async renderTiposEnCajon(onSelectTipo) {
        const tipos = await this.getTipoProducto();
        const contenedor = document.getElementById('tipos-productos-cajon');
        if (!contenedor) return;

        if (!tipos || !tipos.length) {
            contenedor.innerHTML = '<div class="loading-tipos-cajon">No hay tipos de productos</div>';
            return;
        }

        contenedor.innerHTML = tipos.map(tipo => `
            <div class="tipo-card" data-tipo-id="${tipo.idTipoProducto}">
                <span>${tipo.nombreTipoProducto}</span>
            </div>
        `).join('');

        contenedor.querySelectorAll('.tipo-card').forEach(card => {
            card.addEventListener('click', () => {
                contenedor.querySelectorAll('.tipo-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                if (onSelectTipo) onSelectTipo(card.dataset.tipoId, card.textContent.trim());
            });
        });
    }
}

export default TipoProducto;
