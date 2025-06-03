import { assert } from "chai";
import sinon from "sinon";
import createJSDOM from "global-jsdom";
createJSDOM();

import Main from "../../../src/js/Control/Main.js";
import { orden } from "../../../src/js/Control/Orden.js";

describe("Main", () => {
    let app;
    let tipoProductoStub, comboStub, productoStub, pagoStub;

    beforeEach(() => {
        // Crear contenedor principal
        const mainContainer = document.createElement("div");
        mainContainer.id = "main-container";
        document.body.appendChild(mainContainer);

        app = new Main("main-container");

        // Stub de módulos internos
        tipoProductoStub = sinon.stub(app.tipoProducto, "getTipoProducto");
        comboStub = sinon.stub(app.combo, "getCombo");
        productoStub = sinon.stub(app.producto, "getProductos");
        sinon.stub(app.producto, "showProductos");
        sinon.stub(app.combo, "showCombos");
        sinon.stub(app.Pago, "initPago");
        sinon.stub(orden, "initOrden");
        sinon.stub(orden, "cancelOrden");
        sinon.stub(orden, "calcularTotal").returns(50);
    });

    afterEach(() => {
        sinon.restore();
        document.body.innerHTML = "";
    });

    // 1. init.ok crea botones y muestra menú
    it("init.ok", async () => {
        const consoleStub = sinon.stub(console, "error");
        tipoProductoStub.resolves([
            { idTipoProducto: "1", nombre: "Bebidas", observaciones: "" }
        ]);
        comboStub.resolves([]);

        await app.init();

        assert.exists(document.getElementById("crear-orden"));
        consoleStub.restore();

        const cards = document.querySelectorAll(".tipoproducto-card");
        assert.equal(cards.length, 2); // uno por tipo + "Combos"
    });

    // 2. init.null no genera botones si tipoProducto falla
    it("init.null", async () => {
        tipoProductoStub.resolves(null);
        comboStub.resolves([]);

        await app.init();

        assert.notExists(document.getElementById("crear-orden"));
        assert.equal(document.querySelectorAll(".tipoproducto-card").length, 0);
    });

    // 3. createBotonesOrden ejecuta los eventos correctamente
    it("createBotonesOrden.ok", () => {
        app.createBotonesOrden();

        // Simular clic en Crear
        document.getElementById("crear-orden").click();
        assert(orden.initOrden.calledOnce);

    });

    // 4. showMenu.ok para productos llama getProductos y showProductos
    it("showMenu.productos.ok", async () => {
        const tipo = { idTipoProducto: "1", nombre: "Bebidas" };
        productoStub.resolves([{ idProducto: 1, nombre: "Agua", precioActual: 1 }]);

        app.showMenu([tipo]);

        const btn = document.querySelector(".tipoproducto-card");
        btn.click(); // Simula clic

        // Esperar a que se resuelva el async
        await new Promise(resolve => setTimeout(resolve, 0));

        assert(app.producto.getProductos.calledWith("1"));
        assert(app.producto.showProductos.called);
    });

    // 5. showMenu.ok para combos llama showCombos
    it("showMenu.combos.ok", async () => {
        const tipo = { idTipoProducto: "0", nombre: "Combos" };

        app.showMenu([tipo]);

        const btn = document.querySelector(".tipoproducto-card");
        btn.click();

        await new Promise(resolve => setTimeout(resolve, 0));

        assert(app.combo.showCombos.calledOnce);
    });
});
