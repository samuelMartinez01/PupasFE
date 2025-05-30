import { assert } from "chai";
import sinon from "sinon";
import TipoProducto from "../../../src/js/Control/TipoProducto.js";

/*
Función de Mocha para agrupar pruebas relacionadas
*/
describe("TipoProducto", () => { //Nombre del test
    let cut; //Class Under Test
    let fetch;

    //Crea un nuevo objeto antes de cada prueba para que todas las pruebas empiecen con un objeto limpio
    beforeEach(() => {
        cut = new TipoProducto(); //Instancia de la clase TipoProducto
        fetch = sinon.stub(global, "fetch"); //Simula el fetch
    });
    //Restaura fetch a su versión original 
    afterEach(() => {
        fetch.restore();
    });
    //Test 1
    it("getTipoProducto.ok ", async () => {
        const response = [
            { idTipoProducto: 1, nombre: "Cheve", activo: true, observaciones: "Hola" },
            { idTipoProducto: 2, nombre: "Chevex2", activo: true, observaciones: "Hola" },
        ];
        //Cuando se llame a fakeFetch()
        //Devolverá un objeto simulado con una función json()
        //al llamarse, devuelve una promesa con fakeResponse
        fetch.resolves({ //resolves => Cuando alguien llame a fetch, devuelve automáticamente una promesa resuelta con este objeto
            ok: true,
            status: 200,
            json: async () => response,
        });
        const result = await cut.getTipoProducto();
        assert.deepEqual(result, response);
    });

    /* Test 2
    Verifica qué pasa cuando la llamada a fetch falla
    */
    it("getTipoProducto.fail", async () => {
        const fakeConsole = sinon.stub(console, "error"); //Stub para la función console.error
        fetch.rejects(new Error("Error de red")); // Cuando se llame a fetch devolvera una promesa rechazada con un error
        const result = await cut.getTipoProducto();
        assert.isNull(result);
        assert.isTrue(fakeConsole.calledOnce);//console.error fue llamado una vez?
        fakeConsole.restore();
    });
});
