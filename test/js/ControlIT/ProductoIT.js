import { assert } from "chai";
import sinon from "sinon";
import createJSDOM from "global-jsdom";
import Producto from "../../../src/js/Control/Producto.js";
import { orden } from "../../../src/js/Control/Orden.js";
import { promises as fs } from "fs";

createJSDOM();

describe('Producto Integración ', () => {
    let cut;
    let fakeFetch;
    let mockJson;
    let productosFiltrados;
    let idTipoProducto;
    let consoleError;   

    before(() => {
        return fs.readFile('test/Data/Producto.json', 'utf8')
            .then(data => {
                mockJson = JSON.parse(data);
                productosFiltrados = mockJson.filter(p => p.idTipoProducto === 1);
                idTipoProducto = 1;
            });
    });

    beforeEach(() => {
        cut = new Producto();
        fakeFetch = sinon.stub(global, 'fetch');
    });

    afterEach(() => {
        sinon.restore();
        document.body.innerHTML = "";
        orden.cancelOrden();
        consoleError = sinon.stub(console, "error"); 
    });

    describe('Producto.getProducto', () => {
        it('getProducto.ok', () => {
            const fakeResponse = {
                ok: true,
                json: sinon.stub().resolves(productosFiltrados)
            };
            fakeFetch.resolves(fakeResponse);
            const promesa = cut.getProductos(idTipoProducto).then(resultado => {
                assert.strictEqual(fakeFetch.callCount, 1);
                assert.strictEqual(fakeFetch.firstCall.args[0],
                    cut.BASE_URL + `producto/tipoproducto/${idTipoProducto}`
                );
                assert.deepStrictEqual(resultado, productosFiltrados);
            });
            return promesa;
        });


        it('getProducto.return=null', () => {
            const fakeError = new Error('Error de red');
            fakeFetch.rejects(fakeError);
            const promesa = cut.getProductos().then(resultado => {
                assert.strictEqual(fakeFetch.callCount, 1);
                assert.strictEqual(resultado, null);
            });
            return promesa;
        });

        it('getProducto.response!=ok', () => {
            const fakeResponse = {
                ok: false,
                status: 404,
                statusText: 'Not found'
            };
            fakeFetch.resolves(fakeResponse);
            const promesa = cut.getProductos().then(resultado => {
                assert.strictEqual(fakeFetch.callCount, 1);
                assert.strictEqual(resultado, null);
            });
            return promesa;
        });

    });

    describe("Producto.showProductos()", () => {
        it("showProductos.ok", () => {
            orden.initOrden();
            const container = document.createElement("div");
            container.id = `detalles-${idTipoProducto}`;
            document.body.appendChild(container);
            cut.showProductos(productosFiltrados, idTipoProducto);
            assert.include(container.innerHTML, "Coca cola");
            assert.include(container.innerHTML, "Del valle");
            const boton = container.querySelector(".btn-agregar");
            boton.click();
            assert.lengthOf(orden.ordenActual.productos, 1);
        });

        it('showProductos.empty[]', () => {
            const container = document.createElement("div");
            container.id = `detalles-${idTipoProducto}`;
            document.body.appendChild(container);
            cut.showProductos([], idTipoProducto);
            assert.include(container.innerHTML, 'No hay productos disponibles');
        });
    });

});
