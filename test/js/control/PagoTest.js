import { assert } from "chai";
import sinon from "sinon";

// Esto define  `document` en el entorno global para cuando el DOM no existe.
import createJSDOM from "global-jsdom";
createJSDOM();

import Pago from "../../../src/js/Control/Pago.js";
import { orden } from "../../../src/js/Control/Orden.js";

describe("Pago", () => {
    let cut; // Class Under Test
    let fetchStub;
    let confirmarOrdenStub;
    let cancelOrdenStub;
    let alertStub;
    let container;
    let consoleLogStub;


    beforeEach(() => {
        // Simular elementos del DOM
        container = document.createElement("div");
        container.id = "pagos";
        document.body.appendChild(container);

        const mainContainer = document.createElement("div");
        mainContainer.id = "main-container";
        document.body.appendChild(mainContainer);

        cut = new Pago();
        cut.idOrden = 0;

        fetchStub = sinon.stub(global, "fetch");

        confirmarOrdenStub = sinon.stub(orden, "confirmarOrden").resolves({
            success: true,
            idOrden: 123
        });

        cancelOrdenStub = sinon.stub(orden, "cancelOrden");

        // Simular alert
        alertStub = sinon.stub(global, "alert");
        consoleLogStub = sinon.stub(console, "log");

    });

    afterEach(() => {
        consoleLogStub.restore();
        fetchStub.restore();
        confirmarOrdenStub.restore();
        cancelOrdenStub.restore();
        alertStub.restore();
        document.body.innerHTML = ""; // Limpia el DOM
    });

    it("confirmarPago.ok", async () => {
        // Simular respuestas de fetch para pago y detalle
        fetchStub.onFirstCall().resolves({
            ok: true,
            json: async () => ({ idPago: 456 })
        });

        fetchStub.onSecondCall().resolves({
            ok: true,
            json: async () => ({ total: 100 })
        });

        fetchStub.onThirdCall().resolves({
            ok: true
        });

        const datosPago = {
            metodoPago: "Efectivo",
            referencia: "PAGO-TEST",
            fecha: new Date().toISOString()
        };

        await cut.confirmarPago(datosPago);

        assert.strictEqual(cut.idOrden, 123);
        assert(fetchStub.calledThrice, "fetch fue llamado tres veces");
        assert(cancelOrdenStub.calledOnce, "orden.cancelOrden fue llamado");
        assert(alertStub.calledWithMatch("Pago Exitoso"), "alerta de éxito mostrada");
    });

    it("confirmarPago.fail", async () => {
        const errorStub = sinon.stub(console, "error");
        confirmarOrdenStub.restore(); // Mantiene el estado anterior para que no genere error
        sinon.stub(orden, "confirmarOrden").resolves({ success: false });
        const datosPago = {
            metodoPago: "Tarjeta",
            referencia: "PAGO-FAIL",
            fecha: new Date().toISOString()
        };
        await cut.confirmarPago(datosPago);
        assert.isTrue(errorStub.calledWithMatch("Error al procesar el pago", sinon.match.instanceOf(Error)));
        assert.isTrue(alertStub.calledWithMatch("Error de conexión"), "Debe llamar alert con mensaje de error");
        errorStub.restore();
    });

    it("confirmarPago.fail.fetch", async () => {

            /* orden.confirmarOrden fue exitoso.
            Que fetch falló como está previsto.
            Que el error fue capturado y comunicado correctamente.
             */
        const errorStub = sinon.stub(console, "error");

        confirmarOrdenStub.restore(); // Restaurar stub previo
        sinon.stub(orden, "confirmarOrden").resolves({
            success: true,
            idOrden: 321
        });

        // Simular fallo de POST /pago
        fetchStub.onFirstCall().resolves({
            ok: false,
            text: async () => "Pago denegado por saldo insuficiente"
        });

        const datosPago = {
            metodoPago: "Paypal",
            referencia: "PAGO-ERROR",
            fecha: new Date().toISOString()
        };

        await cut.confirmarPago(datosPago);

        assert(errorStub.calledWithMatch("Error al confirmar el pago", "Pago denegado por saldo insuficiente"));
        assert(alertStub.calledWithMatch("Error: Pago denegado por saldo insuficiente"));
        errorStub.restore();
    });
    /*

     */
    it("createPagoDetalle.ok", async () => {
        cut.idOrden = 789; // Simula que la orden ya fue asignada

        // Simula GET /orden/789
        fetchStub.onFirstCall().resolves({
            ok: true,
            json: async () => ({ total: 200 })
        });

        // Simula POST /pago/999/detalle
        fetchStub.onSecondCall().resolves({
            ok: true
        });

        await cut.createPagoDetalle(999); // idPagoCreado

        assert(fetchStub.calledTwice, "fetch debe llamarse dos veces");
        assert(fetchStub.firstCall.args[0].includes("/orden/789"));
        assert(fetchStub.secondCall.args[0].includes("/pago/999/detalle"));
    });
    it("createPagoDetalle.fail", async () => {
        cut.idOrden = 2024;

        const errorStub = sinon.stub(console, "error");

        // Simula GET /orden/2024 con total válido
        fetchStub.onFirstCall().resolves({
            ok: true,
            json: async () => ({ total: 150 })
        });

        // Simula POST /detalle que falla
        fetchStub.onSecondCall().resolves({
            ok: false,
            text: async () => "Error al insertar detalle en la base de datos"
        });

        try {
            await cut.createPagoDetalle(555); // idPagoCreado
            assert.fail("Se esperaba que lanzar error");
        } catch (err) {
            assert.match(err.message, /Error al insertar detalle/);
            assert(errorStub.calledWithMatch("Error en createPagoDetalle"));
        }

        errorStub.restore();
    });

});
