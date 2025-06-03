import { assert } from "chai";
import sinon from "sinon";
import createJSDOM from "global-jsdom";
createJSDOM(); // Simula el DOM en Node.js

import Pago from "../../../src/js/Control/Pago.js";
import * as ordenModule from "../../../src/js/Control/Orden.js"; // Importamos el módulo para hacer stub

describe("Pago Integracion", () => {
    let cut;
    let fetchStub;
    let consoleLogStub;
    let consoleErrorStub;
    let alertStub;
    let confirmarOrdenStub;

    beforeEach(() => {
        cut = new Pago();
        fetchStub = sinon.stub(global, "fetch");
        consoleLogStub = sinon.stub(console, "log");
        consoleErrorStub = sinon.stub(console, "error");
        alertStub = sinon.stub(global, "alert");
        confirmarOrdenStub = sinon.stub(ordenModule.orden, "confirmarOrden");
    });

    afterEach(() => {
        fetchStub.restore();
        consoleLogStub.restore();
        consoleErrorStub.restore();
        alertStub.restore();
        confirmarOrdenStub.restore();
        document.body.innerHTML = "";
    });

    // Pago exitoso
    it("confirmarPago.ok", async () => {
        const datosPago = {
            metodoPago: "Efectivo",
            referencia: "PAGO-123456",
            fecha: new Date().toISOString()
        };

        confirmarOrdenStub.resolves({
            success: true,
            idOrden: 77
        });

        fetchStub.onFirstCall().resolves({
            ok: true,
            json: async () => ({ idPago: 999 })
        });

        fetchStub.onSecondCall().resolves({
            ok: true,
            json: async () => ({ total: 12.5 })
        });

        fetchStub.onThirdCall().resolves({ ok: true });

        const pagos = document.createElement("div");
        pagos.id = "pagos";
        document.body.appendChild(pagos);

        const main = document.createElement("div");
        main.id = "main-container";
        document.body.appendChild(main);

        await cut.confirmarPago(datosPago);

        assert(alertStub.calledWithMatch("Pago Exitoso"));
        assert(consoleLogStub.calledWithMatch("Pago y detalle creados"));
        assert.equal(cut.idOrden, 77);
    });

    // Respuesta inesperada del servidor
    it("confirmarPago.server.fail", async () => {
        const datosPago = {
            metodoPago: "Bitcoin",
            referencia: "PAGO-000",
            fecha: new Date().toISOString()
        };

        confirmarOrdenStub.resolves({
            success: true,
            idOrden: 88
        });

        fetchStub.onFirstCall().resolves({
            ok: false,
            text: async () => "Error en pago"
        });

        await cut.confirmarPago(datosPago);

        assert(alertStub.calledWith("Error: Error en pago"));
        assert(consoleErrorStub.calledWithMatch("Error al confirmar el pago:"));
    });

    // Problema de la red al cconfirmar pago
    it("confirmarPago.network.fail", async () => {
        const datosPago = {
            metodoPago: "Paypal",
            referencia: "PAGO-111",
            fecha: new Date().toISOString()
        };

        confirmarOrdenStub.resolves({
            success: true,
            idOrden: 99
        });

        fetchStub.rejects(new Error("Servidor caído"));

        await cut.confirmarPago(datosPago);

        assert(alertStub.calledWithMatch("Error de conexión con el servidor"));
        assert(consoleErrorStub.calledWithMatch("Error al procesar el pago:"));
    });

    // Error al pago de la orden
    it("confirmarPago.orden.fail", async () => {
        const datosPago = {
            metodoPago: "Transfer",
            referencia: "PAGO-321",
            fecha: new Date().toISOString()
        };

        confirmarOrdenStub.resolves({ success: false });

        await cut.confirmarPago(datosPago);

        assert(alertStub.calledWithMatch("Error de conexión con el servidor"));
        assert(consoleErrorStub.calledWithMatch("Error al procesar el pago"));
    });

    // Se crea el detalle de pago
    it("createPagoDetalle.ok", async () => {
        cut.idOrden = 42;

        fetchStub.onFirstCall().resolves({
            ok: true,
            json: async () => ({ total: 30 })
        });

        fetchStub.onSecondCall().resolves({ ok: true });

        await cut.createPagoDetalle(123);

        assert(consoleLogStub.calledWithMatch("Desde detalle123"));
    });

    // SSe esperaba otra respuesta del servidor
    it("createPagoDetalle.server.fail", async () => {
        cut.idOrden = 42;

        fetchStub.onFirstCall().resolves({
            ok: true,
            json: async () => ({ total: 50 })
        });

        fetchStub.onSecondCall().resolves({
            ok: false,
            text: async () => "Fallo en detalle"
        });

        try {
            await cut.createPagoDetalle(321);
        } catch (err) {
            assert.match(err.message, /Fallo en detalle/);
            assert(consoleErrorStub.calledWithMatch("Error en createPagoDetalle"));
        }
    });

    // Error de la red
    it("createPagoDetalle.network.fail", async () => {
        cut.idOrden = 42;

        fetchStub.rejects(new Error("Sin conexión"));

        try {
            await cut.createPagoDetalle(321);
        } catch (err) {
            assert.match(err.message, /Sin conexión/);
            assert(consoleErrorStub.calledWithMatch("Error en createPagoDetalle"));
        }
    });
});
