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
            // Agregamos "Sodas" como primer tipo quemado
            tiposProductos.unshift({
                idTipoProducto: 100,
                nombreTipoProducto: "Sodas",
                descripcion: "Bebidas gaseosas frías"
            });
            return tiposProductos;
        } catch (error) {
            console.error("Error al obtener los tipos de producto:", error);
            // Si falla la API, igual devolvemos el tipo quemado
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

        if (!tipos || tipos.length === 0) {
            contenedor.innerHTML = '<div class="loading-tipos-cajon">No hay tipos de productos</div>';
            return;
        }

        // Rellenamos con cada tipo:
        contenedor.innerHTML = tipos.map(tipo => `
            <div class="tipo-card" data-tipo-id="${tipo.idTipoProducto}">
                <span>${tipo.nombreTipoProducto}</span>
            </div>
        `).join('');

        // Evento para cada tarjeta de tipo
        contenedor.querySelectorAll('.tipo-card').forEach(card => {
            card.addEventListener('click', () => {
                // Quitamos la clase selected de todas
                contenedor.querySelectorAll('.tipo-card').forEach(c => c.classList.remove('selected'));
                // Marcamos la seleccionada
                card.classList.add('selected');
                // Llamamos al callback pasando id y nombre
                if (onSelectTipo) {
                    onSelectTipo(card.dataset.tipoId, card.textContent.trim());
                }
            });
        });

        // Ahora agregamos la opción “Combos Especiales” al final
        const comboCard = document.createElement('div');
        comboCard.className = 'tipo-card';
        comboCard.textContent = '🎯 Combos Especiales';
        comboCard.addEventListener('click', () => {
            // quitamos la selección anterior
            contenedor.querySelectorAll('.tipo-card').forEach(c => c.classList.remove('selected'));
            comboCard.classList.add('selected');
            // Llamamos al mismo callback onSelectTipo con 'combos'
            if (onSelectTipo) {
                onSelectTipo('combos', 'Combos Especiales');
            }
        });

        contenedor.appendChild(comboCard);
    }
}

export default TipoProducto;
