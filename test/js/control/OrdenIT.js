import { assert } from "chai";
import sinon from "sinon";
import createJSDOM from "global-jsdom";
createJSDOM(); // Simula el DOM

import { orden } from "../../../src/js/Control/Orden.js";

describe("Orden Integracion", () => {
    let fetchStub;
    let consoleLogStub;
    let consoleErrorStub;

    beforeEach(() => {
        orden.cancelOrden(); // Limpiar estado antes de cada test
        fetchStub = sinon.stub(global, "fetch");
        consoleLogStub = sinon.stub(console, "log");
        consoleErrorStub = sinon.stub(console, "error");

        // Simular DOM
        const ids = [
            "confirmar-orden", "crear-orden", "cancelar-orden",
            "pagar-orden", "orden-container"
        ];
        ids.forEach(id => {
            const el = document.createElement("div");
            el.id = id;
            document.body.appendChild(el);
        });

        const botonAgregar = document.createElement("button");
        botonAgregar.classList.add("btn-agregar");
        document.body.appendChild(botonAgregar);
    });

    afterEach(() => {
        fetchStub.restore();
        consoleLogStub.restore();
        consoleErrorStub.restore();
        document.body.innerHTML = "";
    });

    // initOrden
    it("initOrden.ok", () => {
        const spy = sinon.spy();
        orden.onChange = spy;

        orden.initOrden();

        assert.isTrue(orden.ordenActiva);
        assert(spy.calledOnce);
    });

    // cancelar Orden
    it("cancelOrden.ok", () => {
        orden.initOrden();
        orden.addProducto({ idProducto: 1, nombre: "Refresco", precioActual: 2 });
        orden.cancelOrden();

        assert.isFalse(orden.ordenActiva);
        assert.deepEqual(orden.ordenActual, { productos: [] });
    });

    // Ver estado de Orden
    it("estadoOrden.ok", () => {
        orden.initOrden();
        orden.addProducto({ idProducto: 2, nombre: "Torta", precioActual: 3 });

        const confirmar = document.getElementById("confirmar-orden");
        const pagar = document.getElementById("pagar-orden");

        assert.equal(confirmar.style.display, "block");
        assert.equal(pagar.style.display, "block");

        orden.cancelOrden();
        assert.equal(confirmar.style.display, "none");
        assert.equal(pagar.style.display, "none");
    });

    // Agrega nuevo producto
    it("addProducto.ok", () => {
        orden.initOrden();

        const result = orden.addProducto({
            idProducto: 5,
            nombre: "Empanada",
            precioActual: 2.5
        });

        assert.lengthOf(result.productos, 1);
        assert.equal(result.productos[0].nombreProducto, "Empanada");
    });

    // Incrementa la cantidadd de productos agregadoos
    it("addProducto+.ok", () => {
        orden.initOrden();

        orden.addProducto({ idProducto: 7, nombre: "Galleta", precioActual: 1 });
        const result = orden.addProducto({ idProducto: 7, nombre: "Galleta", precioActual: 1 });

        assert.lengthOf(result.productos, 1);
        assert.equal(result.productos[0].cantidad, 2);
    });

    // notificarCambio
    it("notificarCambio.ok", () => {
        const spy = sinon.spy();
        orden.onChange = spy;

        orden.notificarCambio();
        assert(spy.calledOnce);
    });

    // calcular el Total
    it("calcularTotal.ok", () => {
        orden.initOrden();
        orden.addProducto({ idProducto: 1, nombre: "Soda", precioActual: 1.5, cantidad: 2 });
        orden.addProducto({ idProducto: 2, nombre: "Hot Dog", precioActual: 3, cantidad: 1 });

        const total = orden.calcularTotal();
        assert.equal(total, 6.0); // 1.5*2 + 3
    });

    // confirmar la Orden
    it("confirmarOrden.ok", async () => {
        orden.initOrden();
        orden.addProducto({ idProducto: 10, nombre: "Nachos", precioActual: 4 });

        fetchStub.resolves({
            ok: true,
            json: async () => 888
        });

        const result = await orden.confirmarOrden();

        assert.isFalse(orden.ordenActiva);
        assert.deepEqual(result, {
            success: true,
            message: "Orden creada",
            idOrden: 888
        });
        assert(consoleLogStub.calledWithMatch("Orden confirmada ID:"));
    });

    // Error een el sservidor ( se esperaba otra respeusta
    it("confirmarOrden.server.fail", async () => {
        orden.initOrden();
        orden.addProducto({ idProducto: 10, nombre: "ErrorItem", precioActual: 2 });

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

    // Problemas de red
    it("confirmarOrden.network.fail", async () => {
        orden.initOrden();
        orden.addProducto({ idProducto: 20, nombre: "Crash", precioActual: 10 });

        fetchStub.rejects(new Error("No hay red"));

        const result = await orden.confirmarOrden();

        assert.deepEqual(result, {
            success: false,
            message: "Error al crear la orden"
        });
        assert(consoleErrorStub.calledWithMatch("Error al confirmar la orden"));
    });
});
