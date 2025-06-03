import { assert } from "chai";
import sinon from "sinon";
import createJSDOM from "global-jsdom";
createJSDOM(); // Simula DOM

import Combo from "../../../src/js/Control/Combo.js";
import { orden } from "../../../src/js/Control/Orden.js";

describe("Combo Integracion", () => {
    let cut;
    let fetchStub;
    let consoleErrorStub;

    beforeEach(() => {
        cut = new Combo();
        fetchStub = sinon.stub(global, "fetch");
        consoleErrorStub = sinon.stub(console, "error");
        document.body.innerHTML = "";
    });

    afterEach(() => {
        fetchStub.restore();
        consoleErrorStub.restore();
        document.body.innerHTML = "";
    });

    it("getCombo.ok", async () => {
        const fakeCombos = [
            { idCombo: 1, nombre: "Combo Desayuno", productos: [], precioTotal: 4.99 }
        ];

        fetchStub.resolves({
            ok: true,
            json: async () => fakeCombos
        });

        const result = await cut.getCombo();
        assert.deepEqual(result, fakeCombos);
    });

    it("getCombo.server.fail", async () => {
        fetchStub.resolves({
            ok: false
        });

        const result = await cut.getCombo();
        assert.isNull(result);
        assert(consoleErrorStub.calledWithMatch("Error al obtener los combos"));
    });

    it("getCombo.network.fail", async () => {
        fetchStub.rejects(new Error("Sin red"));

        const result = await cut.getCombo();
        assert.isNull(result);
        assert(consoleErrorStub.calledWithMatch("Error al obtener los combos"));
    });
    it("showCombos.ok", async () => {
        const combo = {
            idCombo: 1,
            nombre: "Combo Cena",
            descripcionPublica: "Incluye bebida",
            precioTotal: 9.99,
            productos: [
                { idProducto: 1, nombre: "Pizza", precioUnitario: 5.0, cantidad: 1 },
                { idProducto: 2, nombre: "Soda", precioUnitario: 2.5, cantidad: 2 }
            ]
        };

        // Contenedor simulado en DOM
        const container = document.createElement("div");
        container.id = "detalles-combos";
        document.body.appendChild(container);

        orden.initOrden(); // activa orden para mostrar botones

        fetchStub.resolves({
            ok: true,
            json: async () => [combo]
        });

        await cut.showCombos();

        assert.include(container.innerHTML, "Combo Cena");
        assert.include(container.innerHTML, "Pizza");
        assert.include(container.innerHTML, "Agregar Combo");

        const btn = container.querySelector(".btn-agregar");
        btn.click();
        assert.lengthOf(orden.ordenActual.productos, 2);
    });


    it("showCombos.noContainer", async () => {
        await cut.showCombos();
        assert(consoleErrorStub.calledWithMatch("No se encontró el contenedor de combos"));
    });

    //
    it("showCombos.emptyData.ok", async () => {
        const container = document.createElement("div");
        container.id = "detalles-combos";
        document.body.appendChild(container);

        fetchStub.resolves({
            ok: true,
            json: async () => []
        });

        await cut.showCombos();
        assert.include(container.innerHTML, "No hay combos disponibles");
    });

    it("showCombos.fail", async () => {
        const container = document.createElement("div");
        container.id = "detalles-combos";
        document.body.appendChild(container);

        sinon.stub(cut, "getCombo").rejects(new Error("Error de red"));

        await cut.showCombos();
        assert.include(container.innerHTML, "Error al cargar combos");
        assert(consoleErrorStub.calledWithMatch("Error al mostrar combos"));
    });

});
