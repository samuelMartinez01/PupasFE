import { assert } from "chai";
import sinon from "sinon";
import createJSDOM from "global-jsdom";
import { promises as fs } from "fs";
createJSDOM();

import Combo from "../../../src/js/Control/Combo.js";
import { orden } from "../../../src/js/Control/Orden.js";

describe("Combo Integracion", () => {
    let cut;
    let fakeFetch;
    let consoleError;
    let mockJson;

    before(() => {
        return fs.readFile('test/Data/Combo.json', 'utf8')
            .then(data => {
                mockJson = JSON.parse(data);
            });
    });

    beforeEach(() => {
        cut = new Combo();
        fakeFetch = sinon.stub(global, "fetch");
        consoleError = sinon.stub(console, "error");
        document.body.innerHTML = "";
    });

    afterEach(() => {
        sinon.restore();
        document.body.innerHTML = "";
        orden.cancelOrden();
    });

    describe("Combo.getCombo", () => {
        it("getCombo.ok", () => {
            const fakeResponse = {
                ok: true,
                json: sinon.stub().resolves(mockJson)
            };
            fakeFetch.resolves(fakeResponse);


            const promesa = cut.getCombo().then(resultado => {
                assert.strictEqual(fakeFetch.callCount, 1);
                assert.strictEqual(
                    fakeFetch.firstCall.args[0],
                    cut.BASE_URL + "combo"
                );
                assert.deepStrictEqual(resultado, mockJson);
            });
            return promesa;
        });

        it("getCombo.server.fail", () => {
            const fakeResponse = {
                ok: false,
                status: 404,
                statusText: 'Not found'
            };
            fakeFetch.resolves(fakeResponse);
            const promesa = cut.getCombo().then(resultado => {
                assert.strictEqual(fakeFetch.callCount, 1);
                assert.strictEqual(resultado, null);
            });
            return promesa;
        });
    })

    describe("Combo.showCombos", () => {
        describe("Combo.showCombos", () => {
            it("showCombos.ok", () => {
                orden.initOrden();
                const container = document.createElement("div");
                container.id = "detalles-combos";
                document.body.appendChild(container);
                const idCombo = 1;
                const fakeCombo = mockJson.filter(p => p.idCombo === idCombo);
                fakeFetch.resolves({
                    ok: true,
                    json: sinon.stub().resolves(fakeCombo)
                });
                const promesa = cut.showCombos().then(() => {
                    assert.include(container.innerHTML, "Cena personal");
                    assert.include(container.innerHTML, "Pupusa de loroco");
                    const btn = container.querySelector(".btn-agregar");
                    assert.exists(btn);
                    btn.click();
                    assert.lengthOf(orden.ordenActual.productos, 2);
                });
                return promesa;
            });

            it("showCombos.fail", () => {
                const container = document.createElement("div");
                container.id = "detalles-combos";
                document.body.appendChild(container);
                sinon.stub(cut, "getCombo").rejects(new Error("Error"));
                const promesa = cut.showCombos().then(() => {
                    assert.include(container.innerHTML, "Error al cargar combos");
                    assert(consoleError.calledWithMatch("Error al mostrar combos"));
                });
                return promesa;
            });

        });

    });
});
