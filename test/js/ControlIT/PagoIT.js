import { assert } from "chai";
import sinon from "sinon";
import createJSDOM from "global-jsdom";
import Pago from "../../../src/js/Control/Pago.js";
import * as orden from "../../../src/js/Control/Orden.js";

import ordenJson from "../../Data/Orden.json" assert { type: "json" };
import pagoJson from "../../Data/Pago.json" assert { type: "json" };
createJSDOM(); 
describe("Pago Integración", () => {
    let cut;
    let fakeFetch;
    let fakeAlert;
    let consoleLog;
    let consoleError;
    let fakeConfirmarOrden;

  beforeEach(() => {
        cut = new Pago();
        fakeFetch = sinon.stub(global, "fetch");
        fakeAlert = sinon.stub(global, "alert");
        consoleLog = sinon.stub(console, "log");
        consoleError = sinon.stub(console, "error");
        fakeConfirmarOrden = sinon.stub(orden.orden, "confirmarOrden");
    });
    afterEach(() => {
        sinon.restore();
        document.body.innerHTML = "";
    });

    it("confirmarPago.ok", async () => {
        const datosPago = {
            metodoPago: pagoJson.metodoPago,
            referencia: pagoJson.referencia,
            fecha: new Date(pagoJson.fecha).toISOString()
        };

        fakeConfirmarOrden.resolves({
            success: true,
            idOrden: pagoJson.idOrden.idOrden
        });

        fakeFetch.onCall(0).resolves({
            ok: true,
            json: async () => ({ idPago: pagoJson.idPago })
        });

        fakeFetch.onCall(1).resolves({
            ok: true,
            json: async () => ordenJson
        });

        fakeFetch.onCall(2).resolves({ ok: true });


        const pagos = document.createElement("div");
        pagos.id = "pagos";
        document.body.appendChild(pagos);

        const main = document.createElement("div");
        main.id = "main-container";
        document.body.appendChild(main);

        await cut.confirmarPago(datosPago);

        assert.equal(cut.idOrden, pagoJson.idOrden.idOrden);
        assert(fakeAlert.calledWithMatch("Pago Exitoso"));
        assert(consoleLog.calledWithMatch("Pago y detalle creados"));
    });
});
