import DataAccess from "./DataAcces.js";
import { orden } from "./Orden.js";

class TipoProducto extends DataAccess {
    constructor() {
        super();
    }

    async tipoProductos() {
        try {
            const response = await fetch(this.BASE_URL + "tipoproducto", { method: "GET" }); //Peticion a la API servidor
            // const response = await fetch(this.BASE_URL + "tipoproducto.json", { method: "GET" }); //Pruebas

            const tiposProductos = await response.json();
            this.displayTipoProductos(tiposProductos); //Estructura la vista del DOM
            return tiposProductos;
        } catch (error) {
            console.error("Error al obtener los tipos de producto:", error);
            return null;
        }
    }

    //Metodo para estructurar las vista en el DOM
    displayTipoProductos(tipoProductos) {
    
        //Contenedor principal con los tipos y productos
        const tipoProductoContainer = document.getElementById('tp-container');
        
        tipoProductos.forEach(tipo => {
            //Boton estilo card que muestra el tipo de Producto que se desea seleccionar
            const tpCard = document.createElement('button');
            tpCard.className = 'tp-card';
            tpCard.innerHTML = `<h2>${tipo.nombre}</h2>`;
            //Contenedor que contiene los tipo (cards)y los productos (dentro del contenedor principal)
            const productosContainer = document.createElement('div');
            productosContainer.className = 'productos-container';
            //Contenedor que muestra los productos cuando se selecciona un tipo
            const detallesContainer = document.createElement('div');
            detallesContainer.className = 'productos-detalle';
            detallesContainer.style.display = 'none';
            detallesContainer.id = `detalles-${tipo.idTipoProducto}`;
            tpCard.addEventListener('click', async () => {
                if (detallesContainer.innerHTML === '') {
                    await this.productosByTipo(tipo.idTipoProducto);
                }
                this.toggleDetalles(tipo.idTipoProducto);
            });
            productosContainer.appendChild(tpCard); //primero
            productosContainer.appendChild(detallesContainer); //segundo
            tipoProductoContainer.appendChild(productosContainer); //Completo el DOM
        });
        //Boton para confirmar la orden
        const confirmarBtn = document.createElement('button');
        confirmarBtn.id = 'confirmar-orden';
        confirmarBtn.className = 'btn-confirmar';
        confirmarBtn.textContent = 'Confirmar Orden';
        tipoProductoContainer.appendChild(confirmarBtn);
    }

    //Obtencion y estructuracion de los productos segun el tipo selecionado
    async productosByTipo(idTipoProducto) {
        try {
            const response = await fetch(this.BASE_URL + `producto/tipoproducto/${idTipoProducto}`, { method: "GET" }); //Peticion
            // const response = await fetch(this.BASE_URL + "producto.json", { method: "GET" }); //Peticion para pruebas
            if (response.ok) {
                const productos = await response.json();
                const detalleContainer = document.getElementById(`detalles-${idTipoProducto}`);
                if (productos && productos.length > 0) {
                    detalleContainer.innerHTML = productos.map(p => `
                        <div class="producto-item" data-producto='${JSON.stringify({
                        id_producto: p.idProducto,
                        nombre: p.nombre,
                        precioActual: p.precioActual
                    })}'>
                            <h3>${p.nombre}</h3>
                            <h5>Precio c/u: $${p.precioActual}</h5>
                            <button class="btn-agregar">Agregar a la orden</button>
                        </div>
                    `).join('');

                    detalleContainer.querySelectorAll('.btn-agregar').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const productoItem = e.target.closest('.producto-item');
                            const productoData = JSON.parse(productoItem.dataset.producto);
                            orden.agregarProducto(productoData);
                        });
                    });
                } else {
                    detalleContainer.innerHTML = '<p class="info">No hay productos en esta categoría</p>';
                }
                return productos;
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error obteniendo productos para tipo ${idTipoProducto}:`, error);
            const detalleContainer = document.getElementById(`detalles-${idTipoProducto}`);
            detalleContainer.innerHTML = '<p class="error">Error al cargar productos</p>';
            return null;
        }
    }

    toggleDetalles(idTipoProducto) {
        const detalleContainer = document.getElementById(`detalles-${idTipoProducto}`);
        detalleContainer.style.display = detalleContainer.style.display === "none" ? "block" : "none";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tProducto = new TipoProducto();
    tProducto.tipoProductos();


    // Manejar el evento de confirmación de orden
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'confirmar-orden') {
            orden.confirmarOrden().then(result => {
                if (result.success) {
                    alert("Orden confirmada con éxito!");
                } else {
                    alert("Error al confirmar la orden: " + result.message);
                }
            });
        }
    });
});