import TipoProducto from "./TipoProducto.js";
import Producto from "./Producto.js";
import Pago from "./Pago.js";
import Combo from "./Combo.js"
import { orden } from "./Orden.js";
import '../Boundary/OrdenElement.js'

class Main {
    constructor(containerId) {
        this.mainContainer = document.getElementById(containerId);
        this.tipoProducto = new TipoProducto();
        this.producto = new Producto();
        this.Pago = new Pago();
        this.combo = new Combo();

        // Referencias a los elementos del cajón
        this.selectCategorias = document.getElementById('select-categorias');
        this.selectProductos = document.getElementById('select-productos');
        this.productoDetalle = document.getElementById('producto-detalle');
        this.btnAgregar = document.getElementById('btn-agregar-producto');
        this.btnLimpiar = document.getElementById('btn-limpiar-seleccion');

        // Datos cargados
        this.categoriasData = [];
        this.productosData = [];
        this.combosData = [];
        this.productoSeleccionado = null;
    }

    async init() {
        const tiposProductos = await this.tipoProducto.getTipoProducto();
        const combos = await this.combo.getCombo();

        if (!Array.isArray(tiposProductos)) {
            return;
        }


        if (!Array.isArray(tiposProductos)) {
            return;
        }

        // Agregar categorías al cajón (tipos de producto + combos)
        this.categoriasData = [
            ...tiposProductos,
            { idTipoProducto: "0", nombre: "Combos", observaciones: "" }
            { idTipoProducto: "0", nombre: "Combos", observaciones: "" }
        ];
        this.combosData = combos;

        this.createBotonesOrden();
        this.initCajon();
    }

    createBotonesOrden() {
        this.crearBtn = document.createElement('button');
        this.crearBtn.id = 'crear-orden';
        this.crearBtn.className = 'btn-crear';
        this.crearBtn.textContent = 'Crear Orden';
        this.mainContainer.appendChild(this.crearBtn);
        this.crearBtn.addEventListener('click', () => orden.initOrden());

        this.cancelarBtn = document.createElement('button');
        this.cancelarBtn.id = 'cancelar-orden';
        this.cancelarBtn.className = 'btn-cancelar';
        this.cancelarBtn.textContent = 'Cancelar Orden';
        this.cancelarBtn.style.display = 'none';
        this.mainContainer.appendChild(this.cancelarBtn);
        this.cancelarBtn.addEventListener('click', () => {
            if (confirm("¿Seguro de que quieres cancelar la orden?")) {
                orden.cancelOrden();
            }
        });

        this.pagarBtn = document.createElement('button');
        this.pagarBtn.id = 'pagar-orden';
        this.pagarBtn.className = 'pagar-btn';
        this.pagarBtn.textContent = 'Ir a pagar';
        this.pagarBtn.style.display = 'none';
        this.mainContainer.appendChild(this.pagarBtn);
        this.pagarBtn.addEventListener('click', () => {
            document.getElementById('main-container').style.display = 'none';
            document.getElementById('pagos').style.display = 'block';
            this.Pago.initPago(orden.calcularTotal());
        });
    }

    initCajon() {
        // Llenar el select de categorías
        this.populateCategorias();

        // Eventos del cajón
        this.selectCategorias.addEventListener('change', (e) => this.onCategoriaChange(e));
        this.selectProductos.addEventListener('change', (e) => this.onProductoChange(e));
        this.btnAgregar.addEventListener('click', () => this.agregarProducto());
        this.btnLimpiar.addEventListener('click', () => this.limpiarSeleccion());
    }

    populateCategorias() {
        // Limpiar y agregar opción por defecto
        this.selectCategorias.innerHTML = '<option value="">Seleccionar categoría...</option>';

        // Agregar todas las categorías
        this.categoriasData.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.idTipoProducto;
            option.textContent = `${categoria.nombre} ${categoria.observaciones || ''}`;
            this.selectCategorias.appendChild(option);
        });
    }

    async onCategoriaChange(e) {
        const categoriaId = e.target.value;

        // Resetear productos y detalles
        this.selectProductos.innerHTML = '<option value="">Seleccionar producto...</option>';
        this.selectProductos.disabled = true;
        this.limpiarDetalles();

        if (!categoriaId) return;

        try {
            if (categoriaId === "0") {
                // Es la categoría de combos
                this.productosData = this.combosData || [];
                this.populateProductos(this.productosData, true);
            } else {
                // Es una categoría normal de productos
                this.productosData = await this.producto.getProductos(categoriaId);
                this.populateProductos(this.productosData, false);
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.selectProductos.innerHTML = '<option value="">Error al cargar productos</option>';
        }
    }

    populateProductos(productos, esCombos = false) {
        if (!productos || productos.length === 0) {
            this.selectProductos.innerHTML = '<option value="">No hay productos disponibles</option>';
            return;
        }

        this.selectProductos.innerHTML = '<option value="">Seleccionar producto...</option>';

        productos.forEach((producto, index) => {
            const option = document.createElement('option');
            option.value = index;

            if (esCombos) {
                option.textContent = `${producto.nombre} - $${producto.precioTotal.toFixed(2)}`;
            } else {
                option.textContent = `${producto.nombre} - $${producto.precioActual}`;
            }

            this.selectProductos.appendChild(option);
        });

        this.selectProductos.disabled = false;
    }

    onProductoChange(e) {
        const productoIndex = e.target.value;

        if (!productoIndex || productoIndex === "") {
            this.limpiarDetalles();
            return;
        }

        const producto = this.productosData[parseInt(productoIndex)];
        const categoriaId = this.selectCategorias.value;

        if (categoriaId === "0") {
            this.mostrarDetallesCombo(producto);
        } else {
            this.mostrarDetallesProducto(producto);
        }

        this.productoSeleccionado = producto;
        this.btnAgregar.disabled = false;
    }

    mostrarDetallesProducto(producto) {
        this.productoDetalle.innerHTML = `
            <div class="detalle-contenido">
                <div class="detalle-titulo">${producto.nombre}</div>
                <div class="detalle-info">
                    <strong>ID:</strong> ${producto.idProducto}
                </div>
                <div class="detalle-info">
                    <strong>Precio:</strong> $${producto.precioActual}
                </div>
                ${producto.descripcion ? `
                    <div class="detalle-info">
                        <strong>Descripción:</strong> ${producto.descripcion}
                    </div>
                ` : ''}
                <div class="detalle-precio">
                    Precio unitario: $${producto.precioActual}
                </div>
            </div>
        `;
    }

    mostrarDetallesCombo(combo) {
        const productosList = combo.productos.map(producto =>
            `<li>${producto.cantidad}x ${producto.nombre} - $${producto.precioUnitario.toFixed(2)} c/u</li>`
        ).join('');

        this.productoDetalle.innerHTML = `
            <div class="detalle-contenido">
                <div class="detalle-titulo">${combo.nombre}</div>
                ${combo.descripcionPublica ? `
                    <div class="detalle-info">
                        <strong>Descripción:</strong> ${combo.descripcionPublica}
                    </div>
                ` : ''}
                <div class="detalle-info">
                    <strong>Contenido:</strong>
                    <ul style="margin-top: 5px; padding-left: 20px;">
                        ${productosList}
                    </ul>
                </div>
                <div class="detalle-precio">
                    Precio total: $${combo.precioTotal.toFixed(2)}
                </div>
            </div>
        `;
    }

    agregarProducto() {
        if (!this.productoSeleccionado || !orden.ordenActiva) {
            alert('Debe crear una orden primero');
            return;
        }

        const categoriaId = this.selectCategorias.value;

        if (categoriaId === "0") {
            // Es un combo - agregar todos los productos del combo
            this.productoSeleccionado.productos.forEach(producto => {
                const productoParaOrden = {
                    idProducto: producto.idProducto,
                    nombre: producto.nombre,
                    precioActual: producto.precioUnitario,
                    cantidad: producto.cantidad,
                    observaciones: `De combo "${this.productoSeleccionado.nombre}"`
                };
                orden.addProducto(productoParaOrden);
            });
        } else {
            // Es un producto normal
            const productoParaOrden = {
                idProducto: this.productoSeleccionado.idProducto,
                nombre: this.productoSeleccionado.nombre,
                precioActual: this.productoSeleccionado.precioActual
            };
            orden.addProducto(productoParaOrden);
        }

        // Opcional: limpiar selección después de agregar
        // this.limpiarSeleccion();
    }

    limpiarSeleccion() {
        this.selectCategorias.value = "";
        this.selectProductos.innerHTML = '<option value="">Seleccionar producto...</option>';
        this.selectProductos.disabled = true;
        this.limpiarDetalles();
        this.productoSeleccionado = null;
        this.btnAgregar.disabled = true;
    }

    limpiarDetalles() {
        this.productoDetalle.innerHTML = `
            <div class="detalle-placeholder">
                <p>Selecciona un producto para ver sus detalles</p>
            </div>
        `;
        this.btnAgregar.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new Main('main-container');
    app.init();

});
export default Main;


export default Main;