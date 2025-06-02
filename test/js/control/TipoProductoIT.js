import { assert } from "chai";
import sinon from "sinon";
import TipoProducto from "../../../src/js/Control/TipoProducto.js";

describe("TipoProducto Integracion", () => {
    let cut; // Class Under Test
    let fetchStub; // Stub para simular fetch
    let consoleErrorStub;

    beforeEach(() => {
        cut = new TipoProducto(); // Nueva instancia antes de cada test
        fetchStub = sinon.stub(global, "fetch"); // Interceptar llamadas a fetch
        consoleErrorStub = sinon.stub(console, "error"); // Interceptar errores en consola
    });

    afterEach(() => {
        fetchStub.restore(); // Restaurar fetch original
        consoleErrorStub.restore(); // Restaurar console.error
    });

    // Caso exitoso: fetch responde con datos válidos
    it("getTipoProducto.ok", async () => {
        const fakeResponse = [
            { idTipoProducto: 1, nombre: "Bebidas", activo: true, observaciones: "Frías" },
            { idTipoProducto: 2, nombre: "Snacks", activo: true, observaciones: "Empaque individual" },
        ];

        fetchStub.resolves({
            ok: true,
            status: 200,
            json: async () => fakeResponse
        });

        const result = await cut.getTipoProducto();
        assert.deepEqual(result, fakeResponse);
    });

    // Se genera exepcion o por problemas de red
    it("getTipoProducto.network.fail", async () => {
        fetchStub.rejects(new Error("Fallo de red"));

        const result = await cut.getTipoProducto();

        assert.isNull(result);
        assert(consoleErrorStub.calledOnce);
        assert(consoleErrorStub.calledWithMatch("Error al obtener los tipos de producto:"));
    });

    // Error de servidor respuesta distinta 200
    it("getTipoProducto.server.fail", async () => {
        fetchStub.resolves({
            ok: false,
            status: 500,
            statusText: "Internal Server Error"
        });

        const result = await cut.getTipoProducto();

        assert.isNull(result);
        assert(consoleErrorStub.calledOnce);
        assert(consoleErrorStub.calledWithMatch("Error al obtener los tipos de producto:"));
    });
});
