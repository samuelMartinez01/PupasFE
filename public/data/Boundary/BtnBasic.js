// /js/components/BtnBasic.js

class BtnBasic extends HTMLElement {
    constructor() {
        super();
        this.action = this.getAttribute('action') || 'default';
        this.text = this.getAttribute('text') || 'Botón';
        this.className = this.getAttribute('class') || 'btn-basic';
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <button class="${this.className}">
                ${this.text}
            </button>
        `;
    }

    setupEventListeners() {
        const button = this.querySelector('button');
        button.addEventListener('click', () => {
            switch (this.action) {
                case 'regresar':
                    this.handleBack();
                    break;
                default:
                    console.log('Acción no definida');
            }
        });
    }

    handleBack() {
        document.getElementById('pagos').style.display = 'none';
        document.getElementById('main-container').style.display = 'block';
    }
}

customElements.define('btn-basic', BtnBasic);
