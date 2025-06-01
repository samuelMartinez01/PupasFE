import TipoProducto from "./TipoProducto.js";
import Producto from "./Producto.js";
import Pago from "./Pago.js";
import Combo from "./Combo.js"
import { orden } from "./Orden.js";
import '../Boundary/OrdenElement.js'
console.log(">>> Main.js ha arrancado correctamente");

class Main {
    constructor(containerId) {
        this.mainContainer = document.getElementById(containerId);
        this.tipoProducto = new TipoProducto();
        this.producto = new Producto();
        this.Pago = new Pago();
        this.combo = new Combo();

        // ========== DATOS TEMPORALES PARA DESARROLLO ==========
        // TODO: Remover estos datos cuando el backend esté disponible
        this.mockData = {
            tiposProductos: [
                { idTipoProducto: "1", nombre: "Pupusas", observaciones: "Tradicionales salvadoreñas" },
                { idTipoProducto: "2", nombre: "Bebidas", observaciones: "Frías y calientes" },
                { idTipoProducto: "3", nombre: "Acompañamientos", observaciones: "Curtido y salsas" },
                { idTipoProducto: "4", nombre: "Postres", observaciones: "Dulces típicos" }
            ],
            combos: [
                { idCombo: "1", nombre: "Combo Familiar", precio: 12.50, descripcion: "4 pupusas mixtas + curtido + salsa + 2 bebidas" },
                { idCombo: "2", nombre: "Combo Individual", precio: 6.25, descripcion: "2 pupusas + curtido + salsa + bebida" },
                { idCombo: "3", nombre: "Combo Especial", precio: 8.75, descripcion: "3 pupusas + curtido extra + bebida grande" }
            ],
            productos: {
                "1": [ // Pupusas
                    { idProducto: "1", nombre: "Pupusa de Queso", precio: 1.25, descripcion: "Con queso fresco salvadoreño" },
                    { idProducto: "2", nombre: "Pupusa de Frijol con Queso", precio: 1.50, descripcion: "Frijoles refritos y queso" },
                    { idProducto: "3", nombre: "Pupusa Mixta", precio: 2.00, descripcion: "Chicharrón, queso y frijol" },
                    { idProducto: "4", nombre: "Pupusa de Loroco", precio: 1.75, descripcion: "Flor de loroco con queso" },
                    { idProducto: "5", nombre: "Pupusa de Ayote", precio: 1.50, descripcion: "Ayote tierno con queso" },
                    { idProducto: "6", nombre: "Pupusa Revuelta", precio: 2.25, descripcion: "Chicharrón, queso, frijol y loroco" }
                ],
                "2": [ // Bebidas
                    { idProducto: "7", nombre: "Horchata", precio: 1.50, descripcion: "Bebida tradicional de morro" },
                    { idProducto: "8", nombre: "Tamarindo", precio: 1.25, descripcion: "Fresco de tamarindo natural" },
                    { idProducto: "9", nombre: "Coca Cola", precio: 1.00, descripcion: "Lata 355ml" },
                    { idProducto: "10", nombre: "Café", precio: 1.75, descripcion: "Café salvadoreño" }
                ],
                "3": [ // Acompañamientos
                    { idProducto: "11", nombre: "Curtido Extra", precio: 0.50, descripcion: "Porción adicional de curtido" },
                    { idProducto: "12", nombre: "Salsa Roja", precio: 0.25, descripcion: "Salsa de tomate picante" },
                    { idProducto: "13", nombre: "Salsa Verde", precio: 0.25, descripcion: "Salsa verde casera" }
                ],
                "4": [ // Postres
                    { idProducto: "14", nombre: "Quesadilla Salvadoreña", precio: 2.50, descripcion: "Dulce tradicional con queso" },
                    { idProducto: "15", nombre: "Tres Leches", precio: 3.00, descripcion: "Pastel de tres leches" },
                    { idProducto: "16", nombre: "Empanada de Leche", precio: 1.25, descripcion: "Empanada dulce rellena" }
                ]
            }
        };
        // ====================================================
    }

    async init() {
        // Crear estructura principal del layout
        this.createMainLayout();

        // ========== USANDO DATOS TEMPORALES ==========
        // TODO: Restaurar estas líneas cuando el backend esté disponible:
        // const tiposProductos = await this.tipoProducto.getTipoProducto();
        // const combos = await this.combo.getCombo();

        // TEMPORAL: Usar datos quemados
        const tiposProductos = this.mockData.tiposProductos;
        const combos = this.mockData.combos;
        // =============================================

        if (!Array.isArray(tiposProductos)) {
            return;
        }

        const tipos = [
            ...tiposProductos,
            { idTipoProducto: "0", nombre: "Combos", observaciones: "Ofertas especiales" }
        ];
        this.combosData = combos;

        this.createBotonesOrden();
        this.showMenu(tipos);
    }

    createMainLayout() {
        // Limpiar contenedor principal
        this.mainContainer.innerHTML = '';

        // Crear header con título
        const header = document.createElement('div');
        header.className = 'pupuseria-header';
        header.innerHTML = `
            <h1>🫓 PupasSV</h1>
            <p>Auténticas pupusas salvadoreñas</p>
        `;
        this.mainContainer.appendChild(header);

        // Crear contenedor principal con dos columnas
        const layoutContainer = document.createElement('div');
        layoutContainer.className = 'layout-container';

        // Columna izquierda - Menú
        const menuContainer = document.createElement('div');
        menuContainer.className = 'menu-container';
        menuContainer.id = 'menu-section';

        const menuTitle = document.createElement('div');
        menuTitle.className = 'section-title';
        menuTitle.innerHTML = '<h2>📋 Nuestro Menú</h2>';
        menuContainer.appendChild(menuTitle);

        // Columna derecha - Órdenes
        const ordenContainer = document.createElement('div');
        ordenContainer.className = 'orden-container';
        ordenContainer.id = 'orden-section';

        const ordenTitle = document.createElement('div');
        ordenTitle.className = 'section-title';
        ordenTitle.innerHTML = '<h2>🛒 Tu Orden</h2>';
        ordenContainer.appendChild(ordenTitle);

        // Contenedor para botones de orden
        const botonesContainer = document.createElement('div');
        botonesContainer.className = 'botones-container';
        botonesContainer.id = 'botones-orden';
        ordenContainer.appendChild(botonesContainer);

        // Contenedor para detalles de la orden
        const detallesOrden = document.createElement('div');
        detallesOrden.className = 'detalles-orden';
        detallesOrden.id = 'orden-container';
        detallesOrden.innerHTML = `
            <div class="orden-vacia">
                <div class="orden-icon">🍽️</div>
                <p>No hay productos en tu orden</p>
                <small>Selecciona productos del menú para comenzar</small>
            </div>
        `;
        ordenContainer.appendChild(detallesOrden);

        layoutContainer.appendChild(menuContainer);
        layoutContainer.appendChild(ordenContainer);
        this.mainContainer.appendChild(layoutContainer);

        // Asignar el contenedor de menú como el principal para los productos
        this.menuSection = menuContainer;
    }

    createBotonesOrden() {
        const botonesContainer = document.getElementById('botones-orden');

        this.crearBtn = document.createElement('button');
        this.crearBtn.id = 'crear-orden';
        this.crearBtn.className = 'btn-crear';
        this.crearBtn.innerHTML = '<span>🆕</span> Crear Orden';
        botonesContainer.appendChild(this.crearBtn);
        this.crearBtn.addEventListener('click', () => orden.initOrden());

        this.cancelarBtn = document.createElement('button');
        this.cancelarBtn.id = 'cancelar-orden';
        this.cancelarBtn.className = 'btn-cancelar';
        this.cancelarBtn.innerHTML = '<span>❌</span> Cancelar Orden';
        this.cancelarBtn.style.display = 'none';
        botonesContainer.appendChild(this.cancelarBtn);
        this.cancelarBtn.addEventListener('click', () => {
            if (confirm("¿Seguro de que quieres cancelar la orden?")) {
                orden.cancelOrden();
            }
        });

        this.pagarBtn = document.createElement('button');
        this.pagarBtn.id = 'pagar-orden';
        this.pagarBtn.className = 'pagar-btn';
        this.pagarBtn.innerHTML = '<span>💳</span> Ir a Pagar';
        this.pagarBtn.style.display = 'none';
        botonesContainer.appendChild(this.pagarBtn);
        this.pagarBtn.addEventListener('click', () => {
            document.getElementById('main-container').style.display = 'none';
            document.getElementById('pagos').style.display = 'block';
            this.Pago.initPago(orden.calcularTotal());
        });
    }

    showMenu(tiposProductos) {
        tiposProductos.forEach(tipo => {
            const tipoProductoCard = document.createElement('button');
            tipoProductoCard.className = 'tipoproducto-card';

            // Iconos para cada tipo de producto
            const iconos = {
                "1": "🫓", // Pupusas
                "2": "🥤", // Bebidas
                "3": "🥗", // Acompañamientos
                "4": "🍰", // Postres
                "0": "🎁"  // Combos
            };

            const icono = iconos[tipo.idTipoProducto] || "🍴";

            tipoProductoCard.innerHTML = `
                <div class="tipo-header">
                    <span class="tipo-icon">${icono}</span>
                    <div class="tipo-info">
                        <h3>${tipo.nombre}</h3>
                        <small>${tipo.observaciones || ''}</small>
                    </div>
                    <span class="tipo-arrow">▼</span>
                </div>
            `;

            const productosContainer = document.createElement('div');
            productosContainer.className = 'productos-container';

            const detallesContainer = document.createElement('div');
            detallesContainer.className = 'productos-detalle';
            detallesContainer.id = tipo.idTipoProducto === "0" ? 'detalles-combos' : `detalles-${tipo.idTipoProducto}`;
            detallesContainer.style.display = 'none';

            //Evento que despliega los productos segun el tipo
            tipoProductoCard.addEventListener('click', async () => {
                try {
                    const idContenedor = tipo.idTipoProducto === "0" ? 'detalles-combos' : `detalles-${tipo.idTipoProducto}`;
                    const contenedorActual = document.getElementById(idContenedor);
                    const estaVisible = contenedorActual.style.display === 'block';
                    const arrow = tipoProductoCard.querySelector('.tipo-arrow');

                    // Cerrar todos los otros contenedores
                    document.querySelectorAll('.productos-detalle').forEach(detalle => {
                        detalle.style.display = 'none';
                    });
                    document.querySelectorAll('.tipo-arrow').forEach(arr => {
                        arr.textContent = '▼';
                    });

                    if (!estaVisible) {
                        if (tipo.idTipoProducto === "0") {
                            // ========== TEMPORAL: Mostrar combos con datos quemados ==========
                            // TODO: Restaurar: await this.combo.showCombos();
                            this.showMockCombos();
                            // ================================================================
                        } else {
                            // ========== TEMPORAL: Usar productos con datos quemados ==========
                            // TODO: Restaurar estas líneas:
                            // const productos = await this.producto.getProductos(tipo.idTipoProducto);
                            // this.producto.showProductos(productos, tipo.idTipoProducto);

                            const productos = this.mockData.productos[tipo.idTipoProducto] || [];
                            this.showMockProductos(productos, tipo.idTipoProducto);
                            // ================================================================
                        }
                        contenedorActual.style.display = 'block';
                        arrow.textContent = '▲';
                    }
                } catch (error) {
                    console.error(`Error al cargar ${tipo.nombre}:`, error);
                }
            });

            productosContainer.appendChild(tipoProductoCard);
            productosContainer.appendChild(detallesContainer);
            this.menuSection.appendChild(productosContainer);
        });
    }

    // ========== MÉTODOS TEMPORALES PARA MOSTRAR DATOS QUEMADOS ==========
    // TODO: Remover estos métodos cuando el backend esté disponible

    showMockCombos() {
        const container = document.getElementById('detalles-combos');
        container.innerHTML = ''; // Limpiar contenido previo

        this.mockData.combos.forEach(combo => {
            const comboElement = document.createElement('div');
            comboElement.className = 'producto-item combo-card';
            comboElement.innerHTML = `
                <div class="producto-header">
                    <h4>${combo.nombre}</h4>
                    <span class="producto-price">$${combo.precio.toFixed(2)}</span>
                </div>
                <p class="producto-description">${combo.descripcion}</p>
                <button class="btn-agregar" style="${!orden.ordenActiva ? 'display: none;' : ''}">
                    <span>➕</span> Agregar Combo
                </button>
            `;

            // Agregar event listener para el botón
            const btnAgregar = comboElement.querySelector('.btn-agregar');
            btnAgregar.addEventListener('click', () => {
                if (!orden.ordenActiva) return;
                const productoParaOrden = {
                    idProducto: combo.idCombo,
                    nombre: combo.nombre,
                    precioActual: combo.precio,
                    cantidad: 1,
                    observaciones: 'Combo'
                };
                orden.addProducto(productoParaOrden);
            });

            container.appendChild(comboElement);
        });
    }

    showMockProductos(productos, tipoId) {
        const container = document.getElementById(`detalles-${tipoId}`);
        container.innerHTML = ''; // Limpiar contenido previo

        productos.forEach(producto => {
            const productoElement = document.createElement('div');
            productoElement.className = 'producto-item';
            productoElement.innerHTML = `
                <div class="producto-header">
                    <h4>${producto.nombre}</h4>
                    <span class="producto-price">$${producto.precio.toFixed(2)}</span>
                </div>
                <p class="producto-description">${producto.descripcion}</p>
                <button class="btn-agregar" style="${!orden.ordenActiva ? 'display: none;' : ''}">
                    <span>➕</span> Agregar
                </button>
            `;

            // Agregar event listener para el botón
            const btnAgregar = productoElement.querySelector('.btn-agregar');
            btnAgregar.addEventListener('click', () => {
                if (!orden.ordenActiva) return;
                const productoParaOrden = {
                    idProducto: producto.idProducto,
                    nombre: producto.nombre,
                    precioActual: producto.precio,
                    cantidad: 1
                };
                orden.addProducto(productoParaOrden);
            });

            container.appendChild(productoElement);
        });
    }
    // ====================================================================
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new Main('main-container');
    app.init();
});

export default Main;