import DataAccess from "./DataAcces.js";
import { orden } from "./Orden.js";

class Pago extends DataAccess {
    constructor() {
        super();
        this.idOrden = 0;
        this.isProcessing = false;
    }

    async initPago(totalFront) {
        // Solo métodos de pago principales para mejor UX
        const metodosDePago = [
            'Efectivo',
            'Tarjeta'
        ];

        try {
            const contenedorPagos = document.getElementById("pagos");
            contenedorPagos.innerHTML = `
                <h2>Gestión de pagos</h2>
                <p><strong>Monto a pagar:</strong> $${totalFront.toFixed(2)}</p>
                <div class="metodo-pago-container">
                    <label for="metodo-pago">Selecciona tu método de pago:</label>
                    ${metodosDePago.map(metodo =>
                `<label class="radio-metodo">
                            <input type="radio" name="metodo-pago" value="${metodo}">
                            ${metodo}
                        </label>`
            ).join('')}
                </div>
                <button id="btn-confirmar-pago" class="btn-confirmar">
                    Confirmar Pago
                </button>
                <div id="pago-messages"></div>
            `;

            const btnConfirmarPago = document.getElementById("btn-confirmar-pago");

            btnConfirmarPago.addEventListener("click", () => {
                this.procesarPago();
            });

        } catch (error) {
            console.error("Error:", error);
            this.mostrarMensaje("Error al cargar el sistema de pagos", 'error');
        }
    }

    async procesarPago() {
        if (this.isProcessing) return;

        const metodoSeleccionado = document.querySelector('input[name="metodo-pago"]:checked');
        const btnConfirmar = document.getElementById("btn-confirmar-pago");

        if (!metodoSeleccionado) {
            this.mostrarMensaje("Por favor selecciona un método de pago", 'error');
            return;
        }

        try {
            // Cambiar estado del botón a procesando
            this.isProcessing = true;
            btnConfirmar.classList.add('processing');
            btnConfirmar.textContent = 'Procesando...';
            btnConfirmar.disabled = true;

            const datosPago = {
                metodoPago: metodoSeleccionado.value,
                referencia: "PAGO-" + Date.now(),
                fecha: new Date().toISOString()
            };

            await this.confirmarPago(datosPago);

        } catch (error) {
            console.error("Error al procesar pago:", error);
            this.mostrarMensaje("Error al procesar el pago: " + error.message, 'error');
        } finally {
            // Restaurar estado del botón
            this.isProcessing = false;
            btnConfirmar.classList.remove('processing');
            btnConfirmar.textContent = 'Confirmar Pago';
            btnConfirmar.disabled = false;
        }
    }

    async confirmarPago(datosPago) {
        try {
            const result = await orden.confirmarOrden();
            if (result.success && result.idOrden) {
                this.idOrden = result.idOrden;
                const pago = {
                    idOrden: this.idOrden,
                    ...datosPago
                };

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

                    this.mostrarMensaje(`¡Pago exitoso! Su orden ha sido confirmada. ID: ${idPagoCreado}`, 'success');

                    // Limpiar orden y regresar después de 3 segundos
                    setTimeout(() => {
                        orden.cancelOrden();
                        this.regresarAlHome();
                    }, 3000);

                } else {
                    let errorMessage = "Error al confirmar el pago";
                    try {
                        const errorData = await response.text();
                        errorMessage = errorData || errorMessage;
                    } catch (e) {
                        console.error(e);
                    }
                    throw new Error(errorMessage);
                }
            } else {
                throw new Error("No se pudo confirmar la orden");
            }
        } catch (error) {
            console.error("Error al procesar el pago:", error);
            throw new Error("Error de conexión con el servidor: " + error.message);
        }
    }

    async createPagoDetalle(idPagoCreado) {
        console.log("Desde detalle" + idPagoCreado);
        try {
            const responseOrden = await fetch(this.BASE_URL + `orden/${this.idOrden}`, { method: "GET" });
            const ordenData = await responseOrden.json();
            const total = ordenData.total;

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

    mostrarMensaje(mensaje, tipo) {
        const messagesContainer = document.getElementById('pago-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `pago-message ${tipo}`;
        messageDiv.textContent = mensaje;

        messagesContainer.appendChild(messageDiv);

        // Remover mensaje después de 5 segundos (excepto mensajes de éxito que se quedan más tiempo)
        const timeout = tipo === 'success' ? 8000 : 5000;
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, timeout);
    }

    regresarAlHome() {
        // Llamar a la función global del home para regresar
        if (typeof regresarDelPago === 'function') {
            regresarDelPago();
        }
    }
}

export default Pago;