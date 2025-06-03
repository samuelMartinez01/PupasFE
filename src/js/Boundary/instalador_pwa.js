class InstaladorPwa extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: "open" });
        this.eventoInstalar = null;
        this.instalada = false;
    }

    connectedCallback() {
        const style = document.createElement("style");
        style.textContent = `
            #btnInstalar {
                padding: 10px 20px;
                font-size: 16px;
                background-color: #FF6600;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
            }
        `;

        const boton = document.createElement("button");
        boton.id = "btnInstalar";
        boton.textContent = "PupaSV📲";
        boton.disabled = true;
        

        this.root.appendChild(style);
        this.root.appendChild(boton);

        boton.addEventListener("click", () => this.instalada ? this.simularDesinstalar() : this.instalar());

        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.instalada = true;
            boton.disabled = false;
            boton.textContent = "🗑️ Desinstalar App";
        }

        window.addEventListener("beforeinstallprompt", (evento) => {
            evento.preventDefault();
            this.eventoInstalar = evento;
            if (!this.instalada) {
                boton.disabled = false;
                boton.textContent = "📲 Instalar App";
            }
        });

        window.addEventListener("appinstalled", () => {
            this.instalada = true;
            boton.textContent = "🗑️Desinstalar App";
        });
    }

    async instalar() {
        if (!this.eventoInstalar) return;
        this.eventoInstalar.prompt();
        const res = await this.eventoInstalar.userChoice;
        if (res.outcome === 'accepted') {
            this.root.getElementById("btnInstalar").textContent = "🗑️Desinstalar App";
            this.instalada = true;
        }
    }

    simularDesinstalar() {
        alert("Haz clic derecho sobre los 3 puntos y pressiona Desinstalar App.");
    }
}

customElements.define("instalador-pwa", InstaladorPwa);
export default InstaladorPwa;