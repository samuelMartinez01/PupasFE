import assert from 'assert';         
import sinon from 'sinon';           
import { promises as fs } from 'fs';
import TipoProducto from '../../../src/js/Control/TipoProducto.js';

describe('TipoProducto Integración ', () => {
    let cut;   
    let fakeFetch;      
    let mockJson;  
    let consoleError;   

    before(() => {
        return fs.readFile('test/Data/TipoProducto.json', 'utf8')
            .then(data => {
                mockJson = JSON.parse(data);
            });
    });

    beforeEach(() => {
        sinon.restore();
        cut = new TipoProducto();           
        fakeFetch = sinon.stub(global, 'fetch'); 
        consoleError = sinon.stub(console, "error"); 
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('TipoProducto', () => {

        it('getTipoProducto.ok', () => {
            const fakeResponse = {
                ok: true,
                json: sinon.stub().resolves(mockJson)
            };
            fakeFetch.resolves(fakeResponse);

            const promesa = cut.getTipoProducto().then(resultado => {
                assert.strictEqual(fakeFetch.callCount, 1);
                assert.strictEqual(
                    fakeFetch.firstCall.args[0],
                    cut.BASE_URL + "tipoproducto"
                );
                assert.deepStrictEqual(resultado, mockJson);
            });
            return promesa;
        });


        it('getTipoProducto.return=null', () => {
            const fakeError = new Error('Error de red');
            fakeFetch.rejects(fakeError);

            const promesa = cut.getTipoProducto().then(resultado => {
                assert.strictEqual(fakeFetch.callCount, 1);
                assert.strictEqual(resultado, null);
            });

            return promesa;
        });

        it('getTipoProducto.response!=ok', () => {
            const fakeResponse = {
                ok: false,
                status: 404,
                statusText: 'Not found'
            };
            fakeFetch.resolves(fakeResponse);
            const promesa = cut.getTipoProducto().then(resultado => {
                assert.strictEqual(fakeFetch.callCount, 1);
                assert.strictEqual(resultado, null);
            });

            return promesa;
        });

    });
});
