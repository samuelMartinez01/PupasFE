import { assert } from "chai";
import sinon from "sinon";
import createJSDOM from "global-jsdom";
createJSDOM(); // Simula el DOM en Node.js

import { orden } from "../../../src/js/Control/Orden.js";

describe("Orden", () => {
    let fetchStub;
    let onChangeSpy;
    let consoleLogStub;
    let consoleErrorStub;

    beforeEach(() => {
        // Resetear estado antes de cada test
        orden.cancelOrden(); // Limpiar cualquier orden activa

        // Simular DOM requerido por estadoOrden
        const ids = [
            "confirmar-orden",
            "crear-orden",
            "cancelar-orden",
            "pagar-orden",
            "orden-container"
        ];
        ids.forEach(id => {
            const el = document.createElement("div");
            el.id = id;
            document.body.appendChild(el);
        });

        const botonAgregar = document.createElement("button");
        botonAgregar.classList.add("btn-agregar");
        document.body.appendChild(botonAgregar);

        fetchStub = sinon.stub(global, "fetch");
        consoleLogStub = sinon.stub(console, "log");
        consoleErrorStub = sinon.stub(console, "error");
    });

    afterEach(() => {
        fetchStub.restore();
        consoleLogStub.restore();
        consoleErrorStub.restore();
        document.body.innerHTML = "";
    });

    // 1. initOrden
    it("initOrden.ok", () => { //activa la orden y llama a notificarCambio
        onChangeSpy = sinon.spy();
        orden.onChange = onChangeSpy;

        orden.initOrden();

        assert.isTrue(orden.ordenActiva);
        assert.isTrue(onChangeSpy.calledOnce);
    });

    // 2. cancelOrden desactiva la orden y limpia productos
    it("cancelOrden.ok ", () => {
        orden.initOrden();
        orden.addProducto({ idProducto: 1, nombre: "Test", precioActual: 10 });
        orden.cancelOrden();
        assert.isFalse(orden.ordenActiva);
        assert.deepEqual(orden.ordenActual, { productos: [] });
    });

    // 3. estadoOrden (verificamos DOM modificado) y actualiza visibilidad de botones según el estado
    it("estadoOrden.ok", () => {
        orden.initOrden();
        orden.addProducto({ idProducto: 1, nombre: "Test", precioActual: 10 });

        const confirmarBtn = document.getElementById("confirmar-orden");
        const pagarBtn = document.getElementById("pagar-orden");

        assert.equal(confirmarBtn.style.display, "block");
        assert.equal(pagarBtn.style.display, "block");

        orden.cancelOrden();

        assert.equal(confirmarBtn.style.display, "none");
        assert.equal(pagarBtn.style.display, "none");
    });

    // 4. addProducto agrega producto nuevo si no existe
    it("addProducto.ok", () => {
        orden.initOrden();

        const result = orden.addProducto({
            idProducto: 10,
            nombre: "Cerveza",
            precioActual: 5.0
        });

        assert.lengthOf(result.productos, 1);
        assert.equal(result.productos[0].nombreProducto, "Cerveza");
    });

    // 5. addProducto incrementa cantidad si el producto ya existe
    it("addProducto+.ok", () => {
        orden.initOrden();

        orden.addProducto({ idProducto: 1, nombre: "Agua", precioActual: 1.5 });
        const result = orden.addProducto({ idProducto: 1, nombre: "Agua", precioActual: 1.5 });

        assert.equal(result.productos.length, 1);
        assert.equal(result.productos[0].cantidad, 2);
    });

    // 6. notificarCambio llama onChange si está definido
    it("notificarCambio.ok", () => {
        const spy = sinon.spy();
        orden.onChange = spy;

        orden.notificarCambio();
        assert(spy.calledOnce);
    });

    // 7. calcularTotal suma correctamente los productos
    it("calcularTotal.ok", () => {
        orden.initOrden();

        orden.addProducto({ idProducto: 1, nombre: "Refresco", precioActual: 2.0, cantidad: 2 });
        orden.addProducto({ idProducto: 2, nombre: "Pizza", precioActual: 10.0, cantidad: 1 });

        const total = orden.calcularTotal();
        assert.equal(total, 14.0); // 2*2 + 10 = 14
    });

    // 8. confirmarOrden.ok retorna ID de orden y desactiva orden
    it("confirmarOrden.ok", async () => {
        orden.initOrden();
        orden.addProducto({ idProducto: 1, nombre: "Pan", precioActual: 2 });

        fetchStub.resolves({
            ok: true,
            json: async () => 999
        });

        const result = await orden.confirmarOrden();

        assert.isFalse(orden.ordenActiva);
        assert.deepEqual(result, {
            success: true,
            message: "Orden creada",
            idOrden: 999
        });

        assert(consoleLogStub.calledWithMatch("Orden confirmada ID:"));
    });

    // 9. confirmarOrden.server.fail maneja cuando hay un error del servidor
    it("confirmarOrden.server.fail", async () => {
        orden.initOrden();
        orden.addProducto({ idProducto: 1, nombre: "ErrorItem", precioActual: 1 });

        fetchStub.resolves({
            ok: false,
            statusText: "Internal Server Error"
        });

        const result = await orden.confirmarOrden();

        assert.deepEqual(result, {
            success: false,
            message: "Error al crear la orden"
        });

        assert(consoleErrorStub.calledWithMatch("Error al crear la orden"));
    });

    // 10. confirmarOrden.excepcion.fail controla cuando se genera una exepecioon
    it("confirmarOrden.excepcion.fail", async () => {
        orden.initOrden();
        orden.addProducto({ idProducto: 1, nombre: "Crash", precioActual: 5 });

        fetchStub.rejects(new Error("Network error"));

        const result = await orden.confirmarOrden();

        assert.deepEqual(result, {
            success: false,
            message: "Error al crear la orden"
        });

        assert(consoleErrorStub.calledWithMatch("Error al confirmar la orden"));
    });
});
