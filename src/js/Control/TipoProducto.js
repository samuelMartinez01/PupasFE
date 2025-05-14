import DataAccess from "./DataAcces.js";
import { orden } from "./Orden.js";

class TipoProducto extends DataAccess {
    constructor() {
        super();
    }

    async tipoProductos() { //Se obtienen los tipos de productos
        try {
            // const response = await fetch(this.BASE_URL + "tipoproducto", { method: "GET" }); //Peticion a la API servidor
            const response = await fetch(this.BASE_URL + "tipoproducto.json", { method: "GET" }); //Pruebas
            const tiposProductos = await response.json();
            this.mostrar(tiposProductos); //Estructura la vista del DOM
            return tiposProductos;
        } catch (error) {
            console.error("Error al obtener los tipos de producto:", error);
            return null;
        }
    }



    mostrar(tipoProductos) { //Metodo para estructurar las vista en el DOM
        const tipoProductoContainer = document.getElementById('tipoproducto-container');

        // Crear nueva orden #BOTON1
        const crearOrdenBtn = document.createElement('button'); 
        crearOrdenBtn.id = 'crear-orden';
        crearOrdenBtn.className = 'btn-crear';
        crearOrdenBtn.textContent = 'Crear Orden';
        tipoProductoContainer.appendChild(crearOrdenBtn);
        // Evento nueva orden
        crearOrdenBtn.addEventListener('click', () => {
            orden.ordenInit();
        });

        // Cancelar una orden #BOTON2
        const cancelarOrdenBtn = document.createElement('button');
        cancelarOrdenBtn.id = 'cancelar-orden';
        cancelarOrdenBtn.className = 'btn-cancelar';
        cancelarOrdenBtn.textContent = 'Cancelar Orden';
        cancelarOrdenBtn.style.display = 'none';
        tipoProductoContainer.appendChild(cancelarOrdenBtn);
        // Evento cancelar orden
        cancelarOrdenBtn.addEventListener('click', () => {
            if (confirm('Seguro de que quieres cancelar la orden?')) {
                orden.cancelarOrden();
            }
        });

        tipoProductos.forEach(tipo => {
            const tipoProductoCard = document.createElement('button'); // #BOTON3

            tipoProductoCard.className = 'tipoproducto-card'; //Muestra los tipos de productos
            tipoProductoCard.innerHTML =
                `<h2>
              ${tipo.nombre}
              ${tipo.observaciones ? ' ' + tipo.observaciones : ''}
            </h2>`;
            const productosContainer = document.createElement('div');
            productosContainer.className = 'productos-container'; //Contiene los productos desplegados
            const detallesContainer = document.createElement('div');
            detallesContainer.className = 'productos-detalle';//Muestra los productos segun el tipo de producto
            detallesContainer.style.display = 'none';
            detallesContainer.id = `detalles-${tipo.idTipoProducto}`;

            //Evento de tipoProducto para desplegar los productos
            tipoProductoCard.addEventListener('click', async () => {
                if (detallesContainer.innerHTML === '') {
                    await this.productosByTipo(tipo.idTipoProducto);
                }
                this.desplegarDetalles(tipo.idTipoProducto);
            });

            //Insercion de los div al contenedor principal
            productosContainer.appendChild(tipoProductoCard);
            productosContainer.appendChild(detallesContainer);
            tipoProductoContainer.appendChild(productosContainer);
        });

        // Botón para confirmar la orden (inicialmente oculto)
        const confirmarBtn = document.createElement('button'); //#BOTON4
        confirmarBtn.id = 'confirmar-orden';
        confirmarBtn.className = 'btn-confirmar';
        confirmarBtn.textContent = 'Confirmar Orden';
        confirmarBtn.style.display = 'none';
        tipoProductoContainer.appendChild(confirmarBtn);
    }


    //Obtencion y estructuracion de los productos segun el tipo selecionado
    async productosByTipo(idTipoProducto) {
        try {
            // const response = await fetch(this.BASE_URL + `producto/tipoproducto/${idTipoProducto}`, { method: "GET" }); //Peticion REAL
            const response = await fetch(this.BASE_URL + "producto.json", { method: "GET" }); //Peticion para pruebas
            if (response.ok) {
                const productos = await response.json();
                const detallesContainer = document.getElementById(`detalles-${idTipoProducto}`);
                if (productos && productos.length > 0) {
                    detallesContainer.innerHTML = productos.map(p => {
                        const producto = {
                            id_producto: p.idProducto,
                            nombre: p.nombre,
                            precioActual: p.precioActual
                        };
                        const productoJSON = JSON.stringify(producto);
                        const html = `
                            <div class="producto-item" data-producto='${productoJSON}'>
                                <h3>${p.nombre}</h3>
                                <h5>Precio c/u: $${p.precioActual}</h5>
                                <button class="btn-agregar" style="${!orden.ordenActiva ? 'display: none;' : ''}"> 
                                    Agregar a la orden
                                </button>
                            </div>
                        `;
                        return html;
                    }).join('');

                    //Evento para agregar un producto a la orden activa
                    detallesContainer.querySelectorAll('.btn-agregar').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const productoItem = e.target.closest('.producto-item');
                            const productoData = JSON.parse(productoItem.dataset.producto);
                            orden.addProducto(productoData);
                        });
                    });
                } else {
                    detallesContainer.innerHTML = '<p class="info">No hay productos en esta categoría</p>';
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

    desplegarDetalles(idTipoProducto) {
        const detalleContainer = document.getElementById(`detalles-${idTipoProducto}`);
        detalleContainer.style.display = detalleContainer.style.display === "none" ? "block" : "none";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tProducto = new TipoProducto();
    tProducto.tipoProductos();

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