/**
 * Clase CajonProductos - Sistema reutilizable para selección de productos
 * Maneja tipos, categorías y productos con listas desplegables
 */
class CajonProductos {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.selectTipos = document.getElementById('select-tipos');
        this.selectCategorias = document.getElementById('select-categorias');
        this.selectProductos = document.getElementById('select-productos');
        this.detalleContainer = document.getElementById('producto-detalle');
        this.btnAgregar = document.getElementById('btn-agregar-producto');
        this.btnLimpiar = document.getElementById('btn-limpiar-seleccion');

        // Datos internos
        this.tiposData = [];
        this.categoriasData = [];
        this.productosData = [];
        this.combosData = [];
        this.selectedProduct = null;

        // Callbacks personalizables
        this.onProductSelect = null;
        this.onProductAdd = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.resetAll();
    }

    setupEventListeners() {
        // Evento para cambio de tipo
        this.selectTipos.addEventListener('change', (e) => {
            this.onTipoChange(e.target.value);
        });

        // Evento para cambio de categoría
        this.selectCategorias.addEventListener('change', (e) => {
            this.onCategoriaChange(e.target.value);
        });

        // Evento para cambio de producto
        this.selectProductos.addEventListener('change', (e) => {
            this.onProductoChange(e.target.value);
        });

        // Botón agregar producto
        this.btnAgregar.addEventListener('click', () => {
            this.agregarProducto();
        });

        // Botón limpiar selección
        this.btnLimpiar.addEventListener('click', () => {
            this.limpiarSeleccion();
        });
    }

    /**
     * Carga los tipos de producto desde una fuente externa
     */
    async cargarTipos(tiposProducto) {
        try {
            this.tiposData = Array.isArray(tiposProducto) ? tiposProducto : [];
            this.populateSelect(this.selectTipos, this.tiposData, 'idTipoProducto', 'nombre');
            this.resetCategorias();
            this.resetProductos();
        } catch (error) {
            console.error('Error cargando tipos:', error);
        }
    }

    /**
     * Carga los combos disponibles
     */
    async cargarCombos(combos) {
        try {
            this.combosData = Array.isArray(combos) ? combos : [];
        } catch (error) {
            console.error('Error cargando combos:', error);
        }
    }

    /**
     * Evento cuando cambia el tipo seleccionado
     */
    async onTipoChange(tipoId) {
        if (!tipoId) {
            this.resetCategorias();
            this.resetProductos();
            return;
        }

        try {
            // Si es combos (ID = "0")
            if (tipoId === "0") {
                this.resetCategorias();
                await this.cargarProductosCombo();
            } else {
                // Cargar categorías del tipo seleccionado
                await this.cargarCategoriasPorTipo(tipoId);
            }
        } catch (error) {
            console.error('Error al cambiar tipo:', error);
        }
    }

    /**
     * Evento cuando cambia la categoría seleccionada
     */
    async onCategoriaChange(categoriaId) {
        if (!categoriaId) {
            this.resetProductos();
            return;
        }

        try {
            const tipoId = this.selectTipos.value;
            await this.cargarProductosPorTipoYCategoria(tipoId, categoriaId);
        } catch (error) {
            console.error('Error al cambiar categoría:', error);
        }
    }

    /**
     * Evento cuando cambia el producto seleccionado
     */
    onProductoChange(productoId) {
        if (!productoId) {
            this.resetDetalle();
            return;
        }

        const producto = this.findProductoById(productoId);
        if (producto) {
            this.selectedProduct = producto;
            this.mostrarDetalleProducto(producto);
            this.btnAgregar.disabled = false;

            // Callback personalizable
            if (this.onProductSelect) {
                this.onProductSelect(producto);
            }
        }
    }

    /**
     * Carga categorías por tipo (simulado - adaptar según tu API)
     */
    async cargarCategoriasPorTipo(tipoId) {
        // Aquí deberías hacer la llamada a tu API para obtener categorías
        // Por ahora simulo que no hay categorías específicas y cargo productos directamente
        this.resetCategorias();
        await this.cargarProductosPorTipo(tipoId);
    }

    /**
     * Carga productos por tipo
     */
    async cargarProductosPorTipo(tipoId) {
        try {
            // Aquí deberías usar tu instancia de Producto
            // Por ahora simulo la carga
            this.resetProductos();

            // Simular carga de productos (adaptar a tu código)
            const productos = await this.getProductosPorTipo(tipoId);
            this.productosData = productos;
            this.populateSelect(this.selectProductos, productos, 'idProducto', 'nombre');
            this.selectProductos.disabled = false;
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    }

    /**
     * Carga productos que son combos
     */
    async cargarProductosCombo() {
        try {
            this.resetProductos();
            this.productosData = this.combosData;
            this.populateSelect(this.selectProductos, this.combosData, 'idCombo', 'nombre');
            this.selectProductos.disabled = false;
        } catch (error) {
            console.error('Error cargando combos:', error);
        }
    }

    /**
     * Método para integrar con tu clase Producto existente
     */
    async getProductosPorTipo(tipoId) {
        // Este método debe ser sobrescrito o conectado con tu instancia de Producto
        // Ejemplo de integración:
        if (window.producto && window.producto.getProductos) {
            return await window.producto.getProductos(tipoId);
        }
        return [];
    }

    /**
     * Busca un producto por ID en los datos cargados
     */
    findProductoById(productoId) {
        return this.productosData.find(p =>
            p.idProducto === productoId ||
            p.idCombo === productoId
        );
    }

    /**
     * Muestra los detalles del producto seleccionado
     */
    mostrarDetalleProducto(producto) {
        const esCombo = producto.idCombo !== undefined;

        const detalleHTML = `
            <div class="detalle-contenido">
                <div class="detalle-titulo">
                    ${producto.nombre}
                </div>
                <div class="detalle-info">
                    <strong>Tipo:</strong> ${esCombo ? 'Combo' : 'Producto Individual'}
                </div>
                ${producto.descripcion ? `
                    <div class="detalle-info">
                        <strong>Descripción:</strong> ${producto.descripcion}
                    </div>
                ` : ''}
                ${producto.observaciones ? `
                    <div class="detalle-info">
                        <strong>Observaciones:</strong> ${producto.observaciones}
                    </div>
                ` : ''}
                <div class="detalle-precio">
                    Precio: $${this.formatearPrecio(producto.precio || 0)}
                </div>
            </div>
        `;

        this.detalleContainer.innerHTML = detalleHTML;
    }

    /**
     * Formatea el precio para mostrar
     */
    formatearPrecio(precio) {
        return parseFloat(precio).toFixed(2);
    }

    /**
     * Agrega el producto seleccionado al pedido
     */
    agregarProducto() {
        if (!this.selectedProduct) return;

        // Callback personalizable para manejar la adición
        if (this.onProductAdd) {
            this.onProductAdd(this.selectedProduct);
        } else {
            // Comportamiento por defecto - integrar con tu sistema de orden
            this.agregarAOrden(this.selectedProduct);
        }

        // Opcional: limpiar selección después de agregar
        // this.limpiarSeleccion();
    }

    /**
     * Método para integrar con tu sistema de orden existente
     */
    agregarAOrden(producto) {
        // Integrar con tu instancia de orden
        if (window.orden && window.orden.agregarProducto) {
            window.orden.agregarProducto(producto);
        }
        console.log('Producto agregado:', producto);
    }

    /**
     * Limpia toda la selección
     */
    limpiarSeleccion() {
        this.selectTipos.value = '';
        this.resetCategorias();
        this.resetProductos();
        this.resetDetalle();
        this.selectedProduct = null;
    }

    /**
     * Métodos de utilidad para poblar selects
     */
    populateSelect(selectElement, data, valueField, textField) {
        // Limpiar opciones existentes (excepto la primera)
        selectElement.innerHTML = '<option value="">Seleccionar...</option>';

        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];
            selectElement.appendChild(option);
        });
    }

    /**
     * Métodos de reset
     */
    resetCategorias() {
        this.selectCategorias.innerHTML = '<option value="">Seleccionar categoría...</option>';
        this.selectCategorias.disabled = true;
        this.categoriasData = [];
    }

    resetProductos() {
        this.selectProductos.innerHTML = '<option value="">Seleccionar producto...</option>';
        this.selectProductos.disabled = true;
        this.productosData = [];
        this.resetDetalle();
    }

    resetDetalle() {
        this.detalleContainer.innerHTML = `
            <div class="detalle-placeholder">
                <p>Selecciona un producto para ver sus detalles</p>
            </div>
        `;
        this.btnAgregar.disabled = true;
        this.selectedProduct = null;
    }

    resetAll() {
        this.selectTipos.innerHTML = '<option value="">Seleccionar tipo...</option>';
        this.resetCategorias();
        this.resetProductos();
        this.tiposData = [];
    }

    /**
     * Método para configurar callbacks personalizados
     */
    setCallbacks(onProductSelect, onProductAdd) {
        this.onProductSelect = onProductSelect;
        this.onProductAdd = onProductAdd;
    }

    /**
     * Método para obtener el producto actualmente seleccionado
     */
    getSelectedProduct() {
        return this.selectedProduct;
    }

    /**
     * Método para verificar si hay un producto seleccionado
     */
    hasSelectedProduct() {
        return this.selectedProduct !== null;
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CajonProductos;
}