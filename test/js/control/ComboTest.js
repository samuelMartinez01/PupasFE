import { assert } from "chai";
import sinon from "sinon";
import createJSDOM from "global-jsdom";
createJSDOM();

import Combo from "../../../src/js/Control/Combo.js";
import { orden } from "../../../src/js/Control/Orden.js";

describe("Combo", () => {
    let cut; // class under test
    let fetchStub;
    let consoleErrorStub;

    beforeEach(() => {
        cut = new Combo();
        fetchStub = sinon.stub(global, "fetch");
        consoleErrorStub = sinon.stub(console, "error");

        // Simula contenedor en el DOM
        const container = document.createElement("div");
        container.id = "detalles-combos";
        document.body.appendChild(container);
    });

    afterEach(() => {
        fetchStub.restore();
        consoleErrorStub.restore();
        document.body.innerHTML = "";
    });

    // 1. getCombo.ok  fetch que responde correctamente y el json es valido
    it("getCombo.ok", async () => {
        const combos = [{ idCombo: 1, nombre: "Combo 1", productos: [], precioTotal: 10.0 }];
        fetchStub.resolves({
            ok: true,
            json: async () => combos
        });

        const result = await cut.getCombo();
        assert.deepEqual(result, combos);
    });

    // 2. getCombo.fail fetc lanza error a esto se devuelve null
    it("getCombo.fail", async () => {
        fetchStub.resolves({ ok: false });
        const result = await cut.getCombo();
        assert.isNull(result);
        assert(consoleErrorStub.calledWithMatch("Error al obtener los combos"));
    });

    // 3. showCombos.ok (renderiza combos)
    it("showCombos.ok", async () => {
        const fakeCombo = {
            idCombo: 1,
            nombre: "Combo Test",
            descripcionPublica: "¡Gran combo!",
            precioTotal: 20.0,
            productos: [
                {
                    idProducto: 1,
                    nombre: "Refresco",
                    precioUnitario: 1.5,
                    cantidad: 2
                }
            ]
        };

        sinon.stub(cut, "getCombo").resolves([fakeCombo]);
        orden.ordenActiva = true;

        await cut.showCombos();

        const comboCards = document.querySelectorAll(".combo-card");
        assert.equal(comboCards.length, 1);
        assert.include(comboCards[0].innerHTML, "Combo Test");
        assert.include(comboCards[0].innerHTML, "$20.00");
        assert.include(comboCards[0].innerHTML, "¡Gran combo!");

        cut.getCombo.restore();
    });

    // 4. showCombos.noData se muestra si no hay combos disponibles
    it("showCombos.noData", async () => {
        sinon.stub(cut, "getCombo").resolves([]);

        await cut.showCombos();

        const container = document.getElementById("detalles-combos");
        assert.include(container.innerHTML, "No hay combos disponibles");

        cut.getCombo.restore();
    });

    // 5. showCombos.fial falla al obtener o cargar los combos
    it("showCombos.fail", async () => {
        sinon.stub(cut, "getCombo").rejects(new Error("Falló getCombo"));

        await cut.showCombos();

        const container = document.getElementById("detalles-combos");
        assert.include(container.innerHTML, "Error al cargar combos");
        assert(consoleErrorStub.calledWithMatch("Error al mostrar combos"));

        cut.getCombo.restore();
    });
});
