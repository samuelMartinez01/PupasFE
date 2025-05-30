import { assert } from "chai";
import sinon from "sinon";
import Producto from "../../../src/js/Control/Producto.js";


describe("Producto", () => { 
    let cut; 
    let fetch;

   
    beforeEach(() => {
        cut = new Producto(); 
        fetch = sinon.stub(global, "fetch"); 
    });
    afterEach(() => {
        fetch.restore();
    });
    //Test 1
    it("getProductos.ok", async () => {
        const response = [
            { idProducto: 1, nombre: "Cheve", activo: true, observaciones: "Hola" },
            { idProducto: 2, nombre: "Chevex2", activo: true, observaciones: "Hola" },
        ];
    
        fetch.resolves({
            ok: true,                 
            status: 200,              
            json: async () => response,
        });
    
        const result = await cut.getProductos("1");
        assert.deepEqual(result, response);
    });
    

    // Test 2
    it("getProductos.fail", async () => {
        const fakeConsole = sinon.stub(console, "error");
        fetch.rejects(new Error("Error de red")); 
        const result = await cut.getProductos();
        assert.isNull(result);
        assert.isTrue(fakeConsole.calledOnce);
        fakeConsole.restore();
    });
});
