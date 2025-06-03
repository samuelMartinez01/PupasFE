import DataAccess from "./DataAcces.js";
import { orden } from "./Orden.js";

class Pago extends DataAccess {
    constructor() {
        super();
        this.idOrden = 0;
    }

    async initPago(totalFront) {
        const metodosDePago = [
            'Efectivo',
            'Tarjeta',
            'Bitcoin',
            'Transfer',
            'Paypal'
        ];

        try {
            const contenedorPagos = document.getElementById("pagos");
            contenedorPagos.innerHTML = `
                <h2>Gestión de pagos</h2>
                <p><strong>Monto a pagar:</strong> $${totalFront.toFixed(2)}</p>
                <div class="metodo-pago-container">
                    <label for="metodo-pago">Método de pago:</label>
                     ${metodosDePago.map(metodo =>
                `<label class="radio-metodo">
                        <input type="radio" name="metodo-pago" value="${metodo}">
                         ${metodo}</label> `).join('')}
                </div>
                <button id="btn-confirmar-pago" class="btn-confirmar">Confirmar Pago</button>
                <btn-basic action="regresar" text="Atras" class="btn-regresar"></btn-basic>
            `;
            const btnConfirmarPago = document.getElementById("btn-confirmar-pago");

            btnConfirmarPago.addEventListener("click", () => { //Evento para hacer el pago
                const metodoSeleccionado = document.querySelector('input[name="metodo-pago"]:checked');
                if (metodoSeleccionado) {
                    const datosPago = {
                        metodoPago: metodoSeleccionado.value,
                        referencia: "PAGO-" + Date.now(),
                        fecha: new Date().toISOString()
                    }
                    this.confirmarPago(datosPago);
                } else {
                    alert("Selecciona un metodo de pago");
                    return;
                }
            });

        } catch (error) {
            console.error("Error:", error);
            alert(error.message);
        }
    }


    async confirmarPago(datosPago) {
        if (!navigator.onLine) {
            alert("Al parecer no tienes conexion a internet. Pero guardaremos tu Orden!");

            orden.cancelOrden();
            document.getElementById('pagos').style.display = 'none';
            document.getElementById('main-container').style.display = 'block';
            return;
        }

        try {
            const result = await orden.confirmarOrden();
            if (result.success && result.idOrden) {
                this.idOrden = result.idOrden;
                const pago = {
                    idOrden: this.idOrden,
                    ...datosPago
                }
                const response = await fetch(this.BASE_URL + "pago", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(pago)
                });

                if (response.ok) {
                    const pagoCreado = await response.json();
                    const idPagoCreado = pagoCreado.idPago;
                    console.log("pago con id" + idPagoCreado);
                    await this.createPagoDetalle(idPagoCreado);
                    console.log("Pago y detalle creados con éxito. ID:", idPagoCreado);
                    alert(`Pago Exitoso, su orden ha sido confirmada`);
                    orden.cancelOrden();
                    document.getElementById('pagos').style.display = 'none';
                    document.getElementById('main-container').style.display = 'block';


                } else {
                    let errorMessage = "Error al confirmar el pago";
                    try {
                        const errorData = await response.text();
                        errorMessage = errorData || errorMessage;
                    } catch (e) {
                        console.error(e);
                    }
                    console.error("Error al confirmar el pago:", errorMessage);
                    alert(`Error: ${errorMessage}`);
                }
            } else {
                throw new Error("No se pudo confirmar la orden");
            }
        } catch (error) {
            console.error("Error al procesar el pago:", error);
            alert("Error de conexión con el servidor: " + error.message);
        }
    }

    async createPagoDetalle(idPagoCreado) {
        console.log("Desde detalle" + idPagoCreado);
        try {
            const responseOrden = await fetch(this.BASE_URL + `orden/${this.idOrden}`, { method: "GET" });
            const orden = await responseOrden.json();
            const total = orden.total;
            const response = await fetch(`${this.BASE_URL}pago/${idPagoCreado}/detalle`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idPago: idPagoCreado,
                    monto: total
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Error al crear el detalle");
            }

        } catch (error) {
            console.error("Error en createPagoDetalle:", error);
            throw error;
        }
    }

}

export default Pago;
