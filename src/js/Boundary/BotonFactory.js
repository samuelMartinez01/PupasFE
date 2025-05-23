class BotonFactory {
    static crearBoton({ id, clase, texto, evento, visible = true }) {
        const boton = document.createElement('button');
        boton.id = id;
        boton.className = clase;
        boton.textContent = texto;
        boton.style.display = visible ? 'block' : 'none';
        boton.addEventListener('click', evento);
        return boton;
    }
}

export default BotonFactory;
