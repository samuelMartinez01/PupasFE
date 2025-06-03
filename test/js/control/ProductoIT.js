import { assert } from "chai";
import sinon from "sinon";
import createJSDOM from "global-jsdom";
createJSDOM(); // Simula el DOM en Node.js

import Producto from "../../../src/js/Control/Producto.js";
import { orden } from "../../../src/js/Control/Orden.js";

describe("Producto Integracion", () => {
    let cut;
    let fetchStub;
    let consoleErrorStub;

    beforeEach(() => {
        cut = new Producto();
        fetchStub = sinon.stub(global, "fetch");
        consoleErrorStub = sinon.stub(console, "error");
    });

    afterEach(() => {
        fetchStub.restore();
        consoleErrorStub.restore();
        document.body.innerHTML = "";
    });

    // ✅ Test: getProductos.ok
    it("getProductos.ok", async () => {
        const idTipo = 1;
        const fakeResponse = [
            { idProducto: 1, nombre: "Coca", precioActual: 1.5 },
            { idProducto: 2, nombre: "Pepsi", precioActual: 1.3 }
        ];

        fetchStub.resolves({
            ok: true,
            status: 200,
            json: async () => fakeResponse
        });

        const result = await cut.getProductos(idTipo);
        assert.deepEqual(result, fakeResponse);
    });

    // ❌ Test: getProductos.fail (error de red)
    it("getProductos.network.fail", async () => {
        fetchStub.rejects(new Error("Fallo de red"));

        const result = await cut.getProductos(1);
        assert.isNull(result);
        assert(consoleErrorStub.calledOnce);
    });

    // ❌ Test: getProductos.fail.http (status != 200)
    it("getProductos.server.fail", async () => {
        fetchStub.resolves({
            ok: false,
            status: 500
        });

        const result = await cut.getProductos(1);
        assert.isNull(result);
        assert(consoleErrorStub.calledOnce);
    });

    // ✅ Test: showProductos con productos
    it("showProductos.ok", () => {
        const idTipo = 2;
        const container = document.createElement("div");
        container.id = `detalles-${idTipo}`;
        document.body.appendChild(container);

        orden.initOrden(); // Activa orden para que botones aparezcan

        const productos = [
            { idProducto: 1, nombre: "Pizza", precioActual: 8 },
            { idProducto: 2, nombre: "Hamburguesa", precioActual: 6 }
        ];

        cut.showProductos(productos, idTipo);

        assert.include(container.innerHTML, "Pizza");
        assert.include(container.innerHTML, "Hamburguesa");
        assert.include(container.innerHTML, "btn-agregar");

        // Simulamos click en botón para verificar integración con orden
        const boton = container.querySelector(".btn-agregar");
        boton.click();
        assert.lengthOf(orden.ordenActual.productos, 1);
    });

    // showProductos sin productos
    it("showProductos.empty.ok", () => {
        const idTipo = 5;
        const container = document.createElement("div");
        container.id = `detalles-${idTipo}`;
        document.body.appendChild(container);

        cut.showProductos([], idTipo);

        assert.include(container.innerHTML, "No hay productos disponibles");
    });

    // mostrarDetalles que alterna visibilidad
    it("mostrarDetalles.ok", () => {
        const idTipo = "4";
        const container = document.createElement("div");
        container.id = `detalles-${idTipo}`;
        container.style.display = "none";
        document.body.appendChild(container);

        cut.mostrarDetalles(idTipo);
        assert.equal(container.style.display, "block");

        cut.mostrarDetalles(idTipo);
        assert.equal(container.style.display, "none");
    });
});
