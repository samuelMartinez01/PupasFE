class SucursalesPupas extends HTMLElement {
    static get observedAttributes() {
        return ['sucursaluno', 'sucursaldos', 'sucursaltres'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._handleOutsideClick = this._handleOutsideClick.bind(this);
    }

    connectedCallback() {
        this.render();
        document.addEventListener('click', this._handleOutsideClick);
    }

    disconnectedCallback() {
        document.removeEventListener('click', this._handleOutsideClick);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const sucursal1 = this.getAttribute('sucursaluno') || 'Sucursal 1';
        const sucursal2 = this.getAttribute('sucursaldos') || 'Sucursal 2';
        const sucursal3 = this.getAttribute('sucursaltres') || 'Sucursal 3';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    position: relative;
                    font-family: Arial, sans-serif;
                    margin: 10px;
                }

                .dropdown-btn {
                    background-color: #4CAF50;
                    color: white;
                    padding: 12px 20px;
                    border: none;
                    cursor: pointer;
                    border-radius: 4px;
                    font-size: 16px;
                    min-width: 200px;
                    text-align: left;
                    position: relative;
                }

                .dropdown-btn::after {
                    content: '▼';
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 12px;
                }

                .dropdown-content {
                    display: none;
                    position: absolute;
                    background-color: #f9f9f9;
                    min-width: 200px;
                    box-shadow: 0px 8px 16px rgba(0,0,0,0.2);
                    z-index: 1;
                    border-radius: 4px;
                    max-height: 300px;
                    overflow-y: auto;
                }

                :host([open]) .dropdown-content {
                    display: block;
                }

                .dropdown-content a {
                    color: black;
                    padding: 12px 16px;
                    text-decoration: none;
                    display: block;
                    border-bottom: 1px solid #ddd;
                    cursor: pointer;
                }

                .dropdown-content a:hover {
                    background-color: #f1f1f1;
                }

                .selected {
                    background-color: #e0e0e0;
                    font-weight: bold;
                }
            </style>

            <button class="dropdown-btn">Selecciona una sucursal</button>
            <div class="dropdown-content">
                <a href="#" data-value="${sucursal1}">${sucursal1}</a>
                <a href="#" data-value="${sucursal2}">${sucursal2}</a>
                <a href="#" data-value="${sucursal3}">${sucursal3}</a>
            </div>
        `;

        this._initEventListeners();
    }

    _initEventListeners() {
        this.button = this.shadowRoot.querySelector('.dropdown-btn');
        this.content = this.shadowRoot.querySelector('.dropdown-content');
        this.options = this.shadowRoot.querySelectorAll('.dropdown-content a');

        this.button.onclick = (e) => {
            e.stopPropagation();
            this.toggleMenu();
        };

        this.options.forEach(option => {
            option.onclick = (e) => {
                e.preventDefault();
                this._selectOption(option);
            };
        });
    }

    toggleMenu() {
        this.hasAttribute('open') ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        this.setAttribute('open', '');
    }

    closeMenu() {
        this.removeAttribute('open');
    }

    _handleOutsideClick(e) {
        if (!this.contains(e.target)) {
            this.closeMenu();
        }
    }

    _selectOption(option) {
        this.options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        this.button.textContent = option.textContent;

        this.dispatchEvent(new CustomEvent('sucursal-selected', {
            detail: { sucursal: option.dataset.value },
            bubbles: true,
            composed: true
        }));

        this.closeMenu();
    }
}

customElements.define('sucursal-pupas', SucursalesPupas);