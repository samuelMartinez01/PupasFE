import { assert } from "chai";
import sinon from "sinon";
import createJSDOM from "global-jsdom";
import { promises as fs } from "fs";
import { orden } from "../../../src/js/Control/Orden.js";

createJSDOM();

describe("Orden Integración", () => {
    let fakeFetch;
    let fakeConsole;
    let producto; 

    before(() => {
        return fs.readFile('test/Data/Producto.json', 'utf8')
            .then(data => {
                const mockJson = JSON.parse(data);
                producto = mockJson.find(p => p.idProducto === 1); //De Producto.json
            });
    });

    beforeEach(() => {
        document.body.innerHTML = `
            <button id="crear-orden"></button>
            <button id="cancelar-orden"></button>
            <button id="confirmar-orden"></button>
            <button id="pagar-orden"></button>
            <div id="orden-container"></div>
            <button class="btn-agregar"></button>
        `;
        fakeFetch = sinon.stub(global, "fetch");
        fakeConsole = sinon.stub(console, "error");
    });

    afterEach(() => {
        sinon.restore();
        document.body.innerHTML = "";
        orden.cancelOrden();
    });

    it("initOrden.ok", () => {
        orden.initOrden();
        assert.isTrue(orden.ordenActiva);
        assert.strictEqual(document.getElementById("orden-container").style.display, "block");
        assert.strictEqual(document.getElementById("crear-orden").style.display, "none");
    });

    it("cancelOrden.ok", () => {
        orden.initOrden();
        orden.addProducto(producto);
        orden.cancelOrden();
        assert.isFalse(orden.ordenActiva);
        assert.deepStrictEqual(orden.ordenActual.productos, []);
        assert.strictEqual(document.getElementById("orden-container").style.display, "none");
    });

    it("addProducto.acOrden Nueva", () => {
        orden.initOrden();
        const resOrden = orden.addProducto(producto);
        assert.lengthOf(resOrden.productos, 1);
        assert.strictEqual(resOrden.productos[0].cantidad, 1);
    });

    it("addProducto.existente", () => {
        orden.initOrden();
        orden.addProducto(producto);
        orden.addProducto(producto);
        const encontrado = orden.ordenActual.productos.find(p => p.idProducto === producto.idProducto);
        assert.equal(encontrado.cantidad, 2);
    });

    it("calcularTotal.ok", () => {
        orden.initOrden();
        orden.addProducto(producto);
        orden.addProducto(producto);
        orden.addProducto(producto);
        const total = orden.calcularTotal();
        assert.strictEqual(total, producto.precioActual * 3);
    });

    it("confirmarOrden.ok", async () => {
        orden.initOrden();
        orden.addProducto(producto);
        const fakeResponse = {
            ok: true,
            json: async () => 123
        };
        fakeFetch.resolves(fakeResponse);
        const resultado = await orden.confirmarOrden();
        assert.isTrue(fakeFetch.calledOnce);
        assert.isTrue(resultado.success);
        assert.strictEqual(resultado.idOrden, 123);
        assert.isFalse(orden.ordenActiva);
    });

    it("confirmarOrden.server.fail", async () => {
        orden.initOrden();
        orden.addProducto(producto);
        fakeFetch.resolves({
            ok: false,
            statusText: "Internal Server Error"
        });
        const resultado = await orden.confirmarOrden();
        assert.isFalse(resultado.success);
        assert.isTrue(fakeConsole.calledWithMatch("Error al crear la orden"));
    });

    it("confirmarOrden.network.fail", async () => {
        orden.initOrden();
        orden.addProducto(producto);
        fakeFetch.rejects(new Error("Network error"));
        const resultado = await orden.confirmarOrden();
        assert.isFalse(resultado.success);
        assert.isTrue(fakeConsole.calledWithMatch("Error al confirmar la orden"));
    });
});
