import { assert } from "chai";
import sinon from "sinon";
import createJSDOM from "global-jsdom";
createJSDOM(); // Simula DOM

import Main from "../../../src/js/Control/Main.js";
import * as ordenModule from "../../../src/js/Control/Orden.js";

describe("Main Integracion", () => {
    let main;
    let getTipoProductoStub, getComboStub, getProductosStub, showProductosStub, showCombosStub, initPagoStub;

    beforeEach(() => {
        document.body.innerHTML = ""; // Limpiar DOM
        const container = document.createElement("div");
        container.id = "main-container";
        document.body.appendChild(container);

        // Crear stubs para métodos de las clases inyectadas
        getTipoProductoStub = sinon.stub().resolves([
            { idTipoProducto: 1, nombre: "Bebidas", observaciones: "" }
        ]);
        getComboStub = sinon.stub().resolves([{ idCombo: 1, nombre: "Combo 1" }]);
        getProductosStub = sinon.stub().resolves([{ idProducto: 1, nombre: "Coca", precioActual: 1.5 }]);
        showProductosStub = sinon.stub();
        showCombosStub = sinon.stub();
        initPagoStub = sinon.stub();

        // Crear instancia de Main con dependencias inyectadas
        main = new Main("main-container", {
            TipoProductoClass: function () {
                return { getTipoProducto: getTipoProductoStub };
            },
            ProductoClass: function () {
                return {
                    getProductos: getProductosStub,
                    showProductos: showProductosStub
                };
            },
            ComboClass: function () {
                return {
                    getCombo: getComboStub,
                    showCombos: showCombosStub
                };
            },
            PagoClass: function () {
                return { initPago: initPagoStub };
            }
        });
    });

    afterEach(() => {
        sinon.restore();
        document.body.innerHTML = "";
    });

    it("init.ok", async () => {
        await main.init();
        assert(getTipoProductoStub.calledOnce);
        assert(getComboStub.calledOnce);
        const botones = document.querySelectorAll(".tipoproducto-card");
        assert.lengthOf(botones, 2); // 1 tipo + 1 combo
    });

    it("init.null", async () => {
        getTipoProductoStub.resolves(null);
        await main.init();
        const botones = document.querySelectorAll(".tipoproducto-card");
        assert.lengthOf(botones, 0);
    });

    it("createBotonesOrden.ok", () => {
        const fakeInit = sinon.stub(ordenModule.orden, "initOrden");
        global.confirm = () => true;

        main.createBotonesOrden();

        const btnCrear = document.getElementById("crear-orden");

        assert.exists(btnCrear);

        btnCrear.click();
        assert(fakeInit.calledOnce);
    });

    it("showMenu.productos.ok", async () => {
        await main.init();

        const btnTipo = document.querySelector(".tipoproducto-card");
        const contenedor = document.getElementById("detalles-1");

        assert.equal(contenedor.style.display, "none");
        btnTipo.click();
        await new Promise(r => setTimeout(r, 10));

        assert(getProductosStub.calledOnce);
        assert(showProductosStub.calledOnce);
        assert.equal(contenedor.style.display, "block");
    });

    it("showMenu.combos.ok", async () => {
        getTipoProductoStub.resolves([{ idTipoProducto: "0", nombre: "Combos", observaciones: "" }]);
        await main.init();

        const btnCombo = document.querySelector(".tipoproducto-card");
        const contenedor = document.getElementById("detalles-combos");

        assert.equal(contenedor.style.display, "none");
        btnCombo.click();
        await new Promise(r => setTimeout(r, 10));

        assert(showCombosStub.calledOnce);
        assert.equal(contenedor.style.display, "block");
    });
});
