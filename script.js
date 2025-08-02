// --- Modal de controles ---
function crearModalControles() {
    if (document.getElementById('modalControles')) return;
    const modal = document.createElement('div');
    modal.id = 'modalControles';
    modal.innerHTML = `
        <div class="modal-controles-content">
            <button class="close-btn" title="Cerrar">&times;</button>
            <h2>Controles y Hotkeys</h2>
            <ul>
                <li><span class="hotkey">⬅️ ➡️</span> Mover al personaje</li>
                <li><span class="hotkey">⬆️ ⬇️</span> Cambiar ángulo de disparo</li>
                <li><span class="hotkey">Barra espaciadora</span> Mantén presionado para cargar potencia y disparar (modo SLICE)</li>
                <li><span class="hotkey">Mouse</span> Arrastra sobre la barra para disparar (modo DRAG)</li>
                <li><span class="hotkey">1, 2, 3</span> Seleccionar tipo de bala</li>
                <li><span class="hotkey">M</span> Activar/desactivar música</li>
                <li><span class="hotkey">T</span> Teletransportar al jugador a la posición del cursor</li>
                <li><span class="hotkey">Tab</span> Mostrar estadísticas de la partida</li>
                <li><span class="hotkey">Aimbot</span> Activa el modo DIOS con el botón correspondiente</li>
            </ul>
            <div style="margin-top:12px;color:#ffe259;font-size:0.95em;">Ángulo actual: <span id="angleDisplayModal">45</span>°</div>
        </div>
    `;
    document.body.appendChild(modal);
    // Actualizar ángulo en el modal
    const angleDisplayModal = modal.querySelector('#angleDisplayModal');
    if (angleDisplayModal && typeof jugador !== 'undefined') {
        angleDisplayModal.textContent = jugador.angulo;
    }
    // Cerrar modal
    modal.querySelector('.close-btn').onclick = () => {
        modal.remove();
    };
    // Cerrar con Escape
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.remove();
    });
    // Focus para permitir cerrar con Escape
    setTimeout(() => { modal.focus(); }, 100);
}

window.addEventListener('DOMContentLoaded', () => {
    const btnControles = document.getElementById('btnControles');
    if (btnControles) {
        btnControles.onclick = crearModalControles;
    }
});
// --- Botón para cambiar modo de carga del powerbar ---
let modoCarga = 'slice'; // slice = barra espaciadora, drag = arrastrar mouse
function crearBotonModoCarga() {
    let btn = document.getElementById('btnModoCarga');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'btnModoCarga';
        btn.textContent = 'SLICE';
        btn.style.position = 'fixed';
        btn.style.right = '220px';
        btn.style.bottom = '32px';
        btn.style.zIndex = '10000';
        btn.style.padding = '18px 32px';
        btn.style.fontSize = '1.3em';
        btn.style.background = 'linear-gradient(90deg,#ffe259,#ffa751)';
        btn.style.color = '#222';
        btn.style.border = 'none';
        btn.style.borderRadius = '18px';
        btn.style.boxShadow = '0 4px 16px #000a';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = 'bold';
        btn.style.transition = 'background 0.3s';
        document.body.appendChild(btn);
    }
    btn.onclick = () => {
        modoCarga = modoCarga === 'slice' ? 'drag' : 'slice';
        btn.textContent = modoCarga === 'slice' ? 'SLICE' : 'DRAG';
    };
}
window.addEventListener('DOMContentLoaded', crearBotonModoCarga);
// --- Línea dorada brillante en powerBar para modo DIOS ---
function mostrarLineaDiosPowerBar(potenciaIdeal) {
    const container = document.getElementById("powerBarContainer");
    const powerBar = document.getElementById("powerBar");
    if (!container || !powerBar) return;
    let diosMarker = document.getElementById("diosPowerMarker");
    if (!diosMarker) {
        diosMarker = document.createElement("div");
        diosMarker.id = "diosPowerMarker";
        diosMarker.style.position = "absolute";
        diosMarker.style.top = "0";
        diosMarker.style.bottom = "0";
        diosMarker.style.width = "2px";
        diosMarker.style.background = "linear-gradient(180deg,#ffe259,#ffa751)";
        diosMarker.style.borderRadius = "1px";
        diosMarker.style.pointerEvents = "none";
        diosMarker.style.zIndex = "10002";
        diosMarker.style.boxShadow = "0 0 12px #ffe259a0, 0 0 24px #ffa751a0";
        container.appendChild(diosMarker);
    }
    const markerWidth = diosMarker.offsetWidth || 2;
    const barWidth = container.clientWidth;
    const offset = (potenciaIdeal / 100) * barWidth - (markerWidth / 2) - 10;
    diosMarker.style.left = `${offset}px`;
    // Animación de brillo pulsante
    let frame = Date.now() % 1200;
    let alpha = 0.7 + 0.3 * Math.sin(frame * 0.01);
    diosMarker.style.opacity = alpha;
}

function ocultarLineaDiosPowerBar() {
    const diosMarker = document.getElementById("diosPowerMarker");
    if (diosMarker && diosMarker.parentElement) diosMarker.parentElement.removeChild(diosMarker);
}
// --- Línea de potencia ideal en powerbar para modo DIOS ---
let animFramePowerBar = 0;
function dibujarIndicadorPowerBar(potenciaIdeal) {
    const bar = document.getElementById('powerBar');
    const container = document.getElementById('powerBarContainer');
    if (!bar || !container) return;
    let overlay = document.getElementById('powerBarOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'powerBarOverlay';
        overlay.style.position = 'absolute';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '10001';
        overlay.style.background = 'none';
        container.appendChild(overlay);
    }
    // Posicionar overlay exactamente sobre el powerBar
    overlay.style.left = bar.offsetLeft + 'px';
    overlay.style.top = bar.offsetTop + 'px';
    overlay.style.width = bar.offsetWidth + 'px';
    overlay.style.height = bar.offsetHeight + 'px';
    // Animación: destello pulsante
    animFramePowerBar = (animFramePowerBar + 1) % 60;
    const alpha = 0.5 + 0.5 * Math.sin(animFramePowerBar * 0.2);
    const markerWidth = 6;
    const barWidth = bar.offsetWidth;
    const offset = (potenciaIdeal / 100) * barWidth - (markerWidth / 2);
    overlay.innerHTML = `<div style="position:absolute;left:${offset}px;top:0;height:100%;width:${markerWidth}px;background:linear-gradient(180deg,#ff5151,#ffe259);border-radius:3px;box-shadow:0 0 12px #ffe259a0;opacity:${alpha};transition:none;"></div>`;
    requestAnimationFrame(() => dibujarIndicadorPowerBar(potenciaIdeal));
}
    // --- Modo DIOS: calcular potencia ideal y dibujar indicador en powerbar ---
    // Limpiar marcador dorado antes de recalcular
    ocultarLineaDiosPowerBar();
    if (modoDios && typeof enemigo !== 'undefined' && enemigo.vida > 0) {
        // Buscar la potencia que hace que la trayectoria pase cerca del enemigo
        let potenciaIdeal = 50;
        let mejorDist = Infinity;
        for (let p = 10; p <= 100; p += 1) {
            const tray = simularTrayectoria(
                jugador.angulo,
                p,
                typeof viento !== 'undefined' ? viento : 0,
                jugador.x * scaleX,
                obtenerAltura(jugador.x * scaleX)
            );
            for (let punto of tray) {
                const dx = (punto.x * scaleX) - (enemigo.x * scaleX);
                const dy = (canvas.height - punto.y * scaleY) - obtenerAltura(enemigo.x * scaleX);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mejorDist) {
                    mejorDist = dist;
                    potenciaIdeal = p;
                }
            }
        }
        mostrarLineaDiosPowerBar(potenciaIdeal);
    }
// --- Modo Dios ---
var modoDios = false;
function crearBotonModoDios() {
    let btn = document.getElementById('btnModoDios');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'btnModoDios';
        btn.textContent = 'Aimbot OFF';
        btn.style.position = 'fixed';
        btn.style.right = '32px';
        btn.style.bottom = '32px';
        btn.style.zIndex = '10000';
        btn.style.padding = '18px 32px';
        btn.style.fontSize = '1.3em';
        btn.style.background = 'linear-gradient(90deg,#ffe259,#ffa751)';
        btn.style.color = '#222';
        btn.style.border = 'none';
        btn.style.borderRadius = '18px';
        btn.style.boxShadow = '0 4px 16px #000a';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = 'bold';
        btn.style.transition = 'background 0.3s';
        document.body.appendChild(btn);
    }
    btn.onclick = () => {
        modoDios = !modoDios;
        btn.style.background = modoDios ? 'linear-gradient(90deg,#ff5151,#ffe259)' : 'linear-gradient(90deg,#ffe259,#ffa751)';
        btn.textContent = modoDios ? 'Aimbot ON' : 'Aimbot OFF';
        dibujarEscena();
        // Forzar renderizado del marcador dorado en powerBar
        if (modoDios) {
            // Calcular potencia ideal y mostrar el marcador dorado
            if (typeof enemigo !== 'undefined' && enemigo.vida > 0) {
                let potenciaIdeal = 50;
                let mejorDist = Infinity;
                for (let p = 10; p <= 100; p += 1) {
                    const tray = simularTrayectoria(
                        jugador.angulo,
                        p,
                        typeof viento !== 'undefined' ? viento : 0,
                        jugador.x * scaleX,
                        obtenerAltura(jugador.x * scaleX)
                    );
                    for (let punto of tray) {
                        const dx = (punto.x * scaleX) - (enemigo.x * scaleX);
                        const dy = (canvas.height - punto.y * scaleY) - obtenerAltura(enemigo.x * scaleX);
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < mejorDist) {
                            mejorDist = dist;
                            potenciaIdeal = p;
                        }
                    }
                }
                mostrarLineaDiosPowerBar(potenciaIdeal);
            }
        } else {
            ocultarLineaDiosPowerBar();
        }
    };
}
window.addEventListener('DOMContentLoaded', crearBotonModoDios);
    window.turnosEnemigo = (window.turnosEnemigo || 0) + 1;
    // Posicionar el cursor en el primer campo al mostrar el modal solo si existe
    requestAnimationFrame(() => {
        const inputJugador = document.getElementById('inputNombreJugador');
        if (inputJugador) {
            inputJugador.focus();
            inputJugador.select();
        }
    });
// --- Modal de nombres ---
let nombreJugador = "Jugador";
let juegoIniciado = false;
let nombreEnemigo = "Enemigo";

function crearModalNombres() {
    const modal = document.createElement('div');
    modal.id = 'modalNombres';
    modal.innerHTML = `
        <div class="modal-bg"></div>
        <div class="modal-content">
            <h2>¡Bienvenido a EkkelBound!</h2>
            <label>Tu nombre:</label>
            <input type="text" id="inputNombreJugador" maxlength="16" placeholder="Jugador" autocomplete="off" required />
            <label>Nombre del enemigo:</label>
            <input type="text" id="inputNombreEnemigo" maxlength="16" placeholder="Enemigo" autocomplete="off" required />
            <button id="btnIniciarJuego">Jugar</button>
        </div>
    `;
    document.body.appendChild(modal);
    // Estilos
    const style = document.createElement('style');
    style.innerHTML = `
    #modalNombres {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        z-index: 99999; display: flex; align-items: center; justify-content: center;
        animation: modalFadeIn 1s cubic-bezier(.68,-0.55,.27,1.55);
    }
    .modal-bg {
        position: absolute; width: 100%; height: 100%;
        background: linear-gradient(120deg, #222 60%, #ffe259 100%);
        opacity: 0.92; border-radius: 0 0 80px 80px;
        filter: blur(2px);
        animation: modalBgIn 1.2s cubic-bezier(.68,-0.55,.27,1.55);
    }
    .modal-content {
        position: relative; z-index: 2; background: rgba(34,34,34,0.98);
        border-radius: 32px; box-shadow: 0 8px 32px #000a, 0 0 24px #ffe259a0;
        padding: 48px 36px 32px 36px; min-width: 340px; text-align: center;
        animation: modalContentIn 1.2s cubic-bezier(.68,-0.55,.27,1.55);
    }
    .modal-content h2 {
        font-size: 2.2em; color: #ffe259; margin-bottom: 24px;
        text-shadow: 0 0 24px #ffa751, 0 0 6px #000, 2px 2px 16px #000;
    }
    .modal-content label {
        display: block; font-size: 1.1em; color: #fff; margin: 18px 0 6px 0;
        font-weight: 600; letter-spacing: 1px;
    }
    .modal-content input {
        width: 80%; padding: 10px 16px; font-size: 1.1em; border-radius: 12px;
        border: none; margin-bottom: 8px; background: #ffe25922; color: #fff;
        box-shadow: 0 2px 8px #ffe25944; outline: none; transition: box-shadow 0.3s;
    }
    .modal-content input::placeholder {
        color: #222;
        opacity: 1;
    }
    .modal-content input:focus {
        box-shadow: 0 0 12px #ffe25999;
    }
    .modal-content button {
        margin-top: 24px; padding: 12px 32px; font-size: 1.2em; font-weight: bold;
        border-radius: 18px; border: none; background: linear-gradient(90deg,#ffe259,#ffa751);
        color: #222; box-shadow: 0 2px 8px #ffa75199; cursor: pointer;
        transition: background 0.3s, transform 0.2s;
    }
    .modal-content button:hover {
        background: linear-gradient(90deg,#ffa751,#ffe259); transform: scale(1.08);
    }
    @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalBgIn { from { opacity: 0; } to { opacity: 0.92; } }
    @keyframes modalContentIn { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    `;
    document.head.appendChild(style);
    // Inputs y botón
    const inputJugador = document.getElementById('inputNombreJugador');
    const inputEnemigo = document.getElementById('inputNombreEnemigo');
    const btnJugar = document.getElementById('btnIniciarJuego');

    // Tab navega entre campos (comportamiento nativo, pero aseguramos focus)
    inputJugador.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            // Solo navega entre campos, no cambia bala
            e.preventDefault();
            inputEnemigo.focus();
        } else if (e.key === 'Enter') {
            btnJugar.click();
        }
    });
    inputEnemigo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            btnJugar.click();
        }
    });

    // Evento botón con validación
    btnJugar.onclick = () => {
        let valid = true;
        if (!inputJugador.value.trim()) {
            inputJugador.style.boxShadow = '0 0 12px #ff5151';
            valid = false;
        } else {
            inputJugador.style.boxShadow = '';
        }
        if (!inputEnemigo.value.trim()) {
            inputEnemigo.style.boxShadow = '0 0 12px #ff5151';
            valid = false;
        } else {
            inputEnemigo.style.boxShadow = '';
        }
        if (!valid) return;
        nombreJugador = inputJugador.value.trim();
        nombreEnemigo = inputEnemigo.value.trim();
        modal.style.opacity = '0';
        setTimeout(() => { modal.remove(); }, 600);
        juegoIniciado = true;
        iniciarMusica();
        dibujarEscena();
        iniciarTimerTurno();
    };
}

window.addEventListener('DOMContentLoaded', () => {
    // --- Control de Tab para modal y cambio de bala ---
    let tabPressed = false;
    let tabTimer = null;
    // --- Modal de estadísticas de partida ---
    function crearModalStats() {
        let modal = document.getElementById('modalStats');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalStats';
            document.body.appendChild(modal);
        }
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.width = '60vw';
        modal.style.height = '60vh';
        modal.style.background = 'linear-gradient(120deg, #222 60%, #ffe259 100%)';
        modal.style.borderRadius = '48px';
        modal.style.boxShadow = '0 8px 32px #000a, 0 0 24px #ffe259a0';
        modal.style.zIndex = '100000';
        modal.style.display = 'none';
        modal.style.padding = '0';
        modal.style.overflow = 'hidden';
            // Calcular turnos y daño
            window.turnosJugador = (window.turnosJugador || 0);
            window.turnosEnemigo = (window.turnosEnemigo || 0);
            window.dañoTotalJugador = (window.dañoTotalJugador || 0);
            window.dañoTotalEnemigo = (window.dañoTotalEnemigo || 0);
            // Redondear gasolina
            let gasolinaJugador = Math.round(gasolina);
            let gasolinaEnemigo = 100;
            modal.innerHTML = `
                <div style="display:flex;height:100%;width:100%;">
                    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(34,34,34,0.92);border-radius:48px 0 0 48px;padding:32px 18px 32px 32px;">
                        <h2 style='color:#ffe259;font-size:2em;margin-bottom:18px;text-shadow:0 0 24px #ffa751;'>${nombreJugador}</h2>
                        <div style='font-size:1.2em;color:#fff;margin-bottom:12px;'>HP: <span style='color:#ffe259'>${jugador.vida}</span></div>
                        <div style='font-size:1.2em;color:#fff;margin-bottom:12px;'>Turnos jugados: <span style='color:#ffe259'>${window.turnosJugador}</span></div>
                        <div style='font-size:1.2em;color:#fff;margin-bottom:12px;'><span style='background:#ff5151;color:#fff;padding:4px 16px;border-radius:12px;font-weight:bold;'>Muertes: ${window.muertesJugador || 0}</span></div>
                        <div style='font-size:1.2em;color:#fff;margin-bottom:12px;'><span style='background:#ffe259;color:#222;padding:4px 16px;border-radius:12px;font-weight:bold;'>Kills: ${window.killsJugador || 0}</span></div>
                    </div>
                    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(255,226,89,0.12);border-radius:0 48px 48px 0;padding:32px 32px 32px 18px;">
                        <h2 style='color:#222;font-size:2em;margin-bottom:18px;text-shadow:0 0 24px #ffe259;'>${nombreEnemigo}</h2>
                        <div style='font-size:1.2em;color:#222;margin-bottom:12px;'>HP: <span style='color:#ff5151'>${enemigo.vida}</span></div>
                        <div style='font-size:1.2em;color:#222;margin-bottom:12px;'>Turnos jugados: <span style='color:#ff5151'>${window.turnosEnemigo}</span></div>
                        <div style='font-size:1.2em;color:#222;margin-bottom:12px;'><span style='background:#ff5151;color:#fff;padding:4px 16px;border-radius:12px;font-weight:bold;'>Muertes: ${window.muertesEnemigo || 0}</span></div>
                        <div style='font-size:1.2em;color:#222;margin-bottom:12px;'><span style='background:#ffe259;color:#222;padding:4px 16px;border-radius:12px;font-weight:bold;'>Kills: ${window.killsEnemigo || 0}</span></div>
                    </div>
                </div>
            `;
    }

    function mostrarModalStats() {
    // Elimina el modal anterior y crea uno nuevo para forzar actualización
    let oldModal = document.getElementById('modalStats');
    if (oldModal) oldModal.remove();
    crearModalStats();
    const modal = document.getElementById('modalStats');
    modal.style.display = 'block';
    }
    function ocultarModalStats() {
        const modal = document.getElementById('modalStats');
        if (modal) modal.style.display = 'none';
    }

    window.addEventListener('keydown', (e) => {
        if (!juegoIniciado) return;
        if (e.key === 'Tab') {
            e.preventDefault();
            if (tabPressed) return;
            tabPressed = true;
            tabTimer = setTimeout(() => {
                tabPressed = 'modal';
                mostrarModalStats();
            }, 50);
            return;
        }
        // Selección de bala con 1, 2, 3
        if (e.key === '1') {
            window.tipoBalaActual = '1';
            window.actualizarBotones('1');
        }
        if (e.key === '2') {
            window.tipoBalaActual = '2';
            window.actualizarBotones('2');
        }
        if (e.key === '3') {
            window.tipoBalaActual = 'SS';
            window.actualizarBotones('SS');
        }
    });
    window.addEventListener('keyup', (e) => {
        if (!juegoIniciado) return;
        if (e.key === 'Tab') {
            e.preventDefault();
            if (tabPressed) {
                if (tabTimer) {
                    clearTimeout(tabTimer);
                    tabTimer = null;
                }
                if (tabPressed === 'modal') {
                    ocultarModalStats();
                }
                tabPressed = false;
            }
        }
    });
    // --- Tabla de jugadores abajo a la izquierda ---
    function crearTablaJugadores() {
        let tabla = document.getElementById('tablaJugadores');
        if (!tabla) {
            tabla = document.createElement('div');
            tabla.id = 'tablaJugadores';
            document.body.appendChild(tabla);
        }
        tabla.style.position = 'fixed';
        tabla.style.left = '24px';
        tabla.style.bottom = '24px';
        tabla.style.zIndex = '9999';
        tabla.style.background = 'rgba(34,34,34,0.92)';
        tabla.style.borderRadius = '18px';
        tabla.style.boxShadow = '0 2px 12px #000a';
        tabla.style.padding = '8px 12px';
        tabla.style.minWidth = '110px';
        tabla.style.fontFamily = 'Arial, sans-serif';
        tabla.style.color = '#ffe259';
        tabla.style.fontSize = '0.85em';
        tabla.style.userSelect = 'none';
        tabla.style.transition = 'opacity 0.3s';
    }

    function actualizarTablaJugadores() {
        crearTablaJugadores();
        const tabla = document.getElementById('tablaJugadores');
        // Orden de turno
        let jugadores = [
            {
                nombre: nombreJugador,
                hp: jugador.vida,
                tiempo: turnoJugador === 1 ? gasolinaTimer : '',
                turno: turnoJugador === 1
            },
            {
                nombre: nombreEnemigo,
                hp: enemigo.vida,
                tiempo: turnoJugador === 2 ? gasolinaTimer : '',
                turno: turnoJugador === 2
            }
        ];
        // Ordenar por turno actual primero
        jugadores.sort((a, b) => b.turno - a.turno);
        let html = `<table style="width:100%;border-collapse:collapse;">
            <thead><tr style="font-size:0.95em;text-align:left;"><th>Turno</th><th>Jugador</th><th>HP</th><th>⏳</th></tr></thead><tbody>`;
        for (let j of jugadores) {
            html += `<tr style="background:${j.turno ? '#ffe25922' : 'none'};font-weight:${j.turno ? 'bold' : 'normal'};">
                <td style="padding:2px 4px;">${j.turno ? '▶️' : ''}</td>
                <td style="padding:2px 4px;">${j.nombre}</td>
                <td style="padding:2px 4px;">${j.hp}</td>
                <td style="padding:2px 4px;">${j.tiempo !== '' ? j.tiempo + 's' : ''}</td>
            </tr>`;
        }
        html += '</tbody></table>';
        tabla.innerHTML = html;
    }

    window.actualizarTablaJugadores = actualizarTablaJugadores;

    setInterval(actualizarTablaJugadores, 500);
    actualizarTablaJugadores();
    // Actualiza la tabla de jugadores
    if (window.actualizarTablaJugadores) window.actualizarTablaJugadores();
    crearModalNombres();
});
// ...existing code...
// --- Música de fondo ---
let musicaMuteada = false;
let musica;

function iniciarMusica() {
    if (!musica) {
        musica = document.getElementById('bgMusic');
    }
    if (musica) {
        musica.play();
        mostrarIconoMusica();
    }
}

function toggleMusica() {
    musicaMuteada = !musicaMuteada;
    if (!musica) {
        musica = document.getElementById('bgMusic');
    }
    if (musica) {
        musica.muted = musicaMuteada;
        mostrarIconoMusica();
    }
}

function mostrarIconoMusica() {
    let icono = document.getElementById('iconoMusica');
    if (!icono) {
        icono = document.createElement('div');
        icono.id = 'iconoMusica';
        icono.style.position = 'fixed';
        icono.style.top = '16px';
        icono.style.left = '16px';
        icono.style.zIndex = '1000';
        icono.style.fontSize = '44px';
        icono.style.background = 'rgba(34,34,34,0.85)';
        icono.style.borderRadius = '50%';
        icono.style.padding = '10px';
        icono.style.boxShadow = '0 2px 8px #0006';
        icono.style.transition = 'opacity 0.3s';
        document.body.appendChild(icono);
    }
    icono.innerHTML = musicaMuteada
        ? '<span title="Música muteada">🔇</span>'
        : '<span title="Música activa">🔊</span>';
    icono.style.opacity = '1';

    // Añadir evento click para mutear/desmutear
    icono.onclick = function() {
        toggleMusica();
    };
}

// Iniciar música al empezar la partida (cuando el DOM esté listo)
// Reproducir música en la primera interacción del usuario
window.addEventListener('DOMContentLoaded', () => {
    mostrarIconoMusica();
    let started = false;
    function startMusicOnce() {
        if (!started && juegoIniciado) {
            iniciarMusica();
            started = true;
        }
    }
    document.addEventListener('keydown', startMusicOnce, { once: true });
    document.addEventListener('mousedown', startMusicOnce, { once: true });
    document.addEventListener('touchstart', startMusicOnce, { once: true });
});

// Tecla M para mutear/desmutear
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm' && juegoIniciado) {
        toggleMusica();
    }
});
// Rompe el terreno en la zona de impacto (recorta un círculo)
function romperTerreno(x, y, radio) {
    // x, y en coordenadas de canvas
    for (let i = 0; i < terreno.length; i++) {
        const tx = i * scaleX;
        const dist = Math.hypot(tx - x, terreno[i] - y);
        // Si el punto está dentro del círculo, baja la altura
        if (dist < radio) {
            // Baja la altura del terreno en ese punto
            terreno[i] += radio * 0.7 * (1 - dist / radio);
            // Limita para no pasar el fondo
            terreno[i] = Math.min(canvas.height - UI_OFFSET, terreno[i]);
        }
    }
}
let gasolina = 100;
let gasolinaInterval = null;
let gasolinaBloqueada = false;
let gasolinaTimer = 20;
let turnoJugador = 1; // 1 = jugador, 2 = enemigo
let precisionEnemigo = 1.0; // DEBUG: 1 = siempre acierta
let contadorAciertosEnemigo = 0;
let contadorTurnosEnemigo = 0;
let precisionEnemigoAnterior = precisionEnemigo;
// Reinicia contadores si precisionEnemigo cambió
if (precisionEnemigo !== precisionEnemigoAnterior) {
    contadorAciertosEnemigo = 0;
    contadorTurnosEnemigo = 0;
    precisionEnemigoAnterior = precisionEnemigo;
}
let disparoRealizado = false;
// Cargar imagen de fondo
const fondo = new Image();
fondo.src = 'background.svg';

// Espera a que el fondo esté cargado antes de dibujar la escena inicial
fondo.onload = () => {
    dibujarEscena();
};
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth * 2; // Doble de ancho para el mapa
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
// Elimina cualquier fondo CSS del canvas
canvas.style.background = 'transparent';
// Variable para guardar la última posición del cursor sobre el canvas
let ultimaPosicionCursor = { x: null, y: null };

// Detectar la posición del cursor sobre el canvas
canvas.addEventListener('mousemove', function(e) {
    // Obtener la posición relativa al canvas
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    ultimaPosicionCursor.x = x;
    ultimaPosicionCursor.y = y;
});

// Teletransportar al jugador al presionar T
document.addEventListener('keydown', function(e) {
    if (e.key.toLowerCase() === 't' && ultimaPosicionCursor.x !== null) {
        // Calcular la posición X en el mapa
        const nuevaX = Math.max(0, Math.min(canvas.width, ultimaPosicionCursor.x));
        // El jugador debe pisar el terreno
        jugador.x = Math.floor(nuevaX / scaleX);
        // Opcional: resetear ángulo y potencia si lo deseas
        // jugador.angulo = 45;
        // jugador.potencia = 50;
        dibujarEscena();
    }
});
const GRAVEDAD = 9.8;
const FACTOR_POTENCIA = 1.2;
const scaleX = 5;
const scaleY = 5;
const UI_OFFSET = 300;
const GROUND_Y = canvas.height - UI_OFFSET;

let terreno = [];
let terrenoPattern = null;
const SEGMENTOS = Math.ceil(canvas.width / scaleX); // Ahora será mucho más grande
let tipoBala = "1";

function generarTerreno() {
    terreno = [];
    // Generar la textura del terreno una sola vez
    if (!terrenoPattern) {
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = 32;
        patternCanvas.height = 32;
        const pctx = patternCanvas.getContext('2d');
        // Fondo base marrón oscuro
        pctx.fillStyle = '#3b2412';
        pctx.fillRect(0, 0, 32, 32);
        // Líneas horizontales más oscuras
        pctx.strokeStyle = '#2a170a';
        pctx.lineWidth = 2;
        for (let y = 6; y < 32; y += 8) {
            pctx.beginPath();
            pctx.moveTo(0, y);
            pctx.lineTo(32, y);
            pctx.stroke();
        }
        // Puntos claros para simular piedras (más grisáceos)
        for (let i = 0; i < 10; i++) {
            pctx.fillStyle = '#6e5c4a';
            pctx.beginPath();
            pctx.arc(Math.random() * 32, Math.random() * 32, Math.random() * 2 + 1, 0, 2 * Math.PI);
            pctx.fill();
        }
        // Puntos oscuros para simular tierra
        for (let i = 0; i < 8; i++) {
            pctx.fillStyle = '#1a0e05';
            pctx.beginPath();
            pctx.arc(Math.random() * 32, Math.random() * 32, Math.random() * 2 + 1, 0, 2 * Math.PI);
            pctx.fill();
        }
        terrenoPattern = ctx.createPattern(patternCanvas, 'repeat');
    }
    let alturaBase = GROUND_Y - 50;
    let altura = alturaBase;
    let tramoTipo = 0; // 0 = plano, 1 = irregular, 2 = plano alto
    let tramoDuracion = 0;
    let tramoAltura = alturaBase;
    let SEGMENTO_MEDIO = Math.floor(SEGMENTOS / 12); // tramos medianos
    let planoAltoProb = 0.18; // probabilidad de plano alto
    for (let i = 0; i <= SEGMENTOS; i++) {
        if (tramoDuracion <= 0) {
            // Decide el tipo de tramo: plano normal, irregular o plano alto
            let r = Math.random();
            if (r < planoAltoProb) {
                tramoTipo = 2; // plano alto
                tramoDuracion = SEGMENTO_MEDIO + Math.floor(Math.random() * SEGMENTO_MEDIO);
                // Limita la altura para que sea empinada pero no vertical y coherente
                let alturaAnterior = altura;
                let alturaMax = Math.max(alturaBase - 70, alturaAnterior - 40); // no más de 40px de diferencia
                let alturaMin = Math.min(alturaBase - 30, alturaAnterior + 40);
                tramoAltura = alturaMax + Math.random() * (alturaMin - alturaMax);
            } else {
                tramoTipo = tramoTipo === 0 ? 1 : 0; // alterna entre plano e irregular
                tramoDuracion = SEGMENTO_MEDIO + Math.floor(Math.random() * SEGMENTO_MEDIO);
                tramoAltura = altura + (Math.random() - 0.5) * 8;
            }
        }
        if (tramoTipo === 0) {
            // tramo plano
            altura = tramoAltura;
        } else if (tramoTipo === 2) {
            // tramo plano alto
            altura = tramoAltura;
        } else {
            // tramo irregular pero suave
            altura += (Math.random() - 0.5) * 6;
        }
        // Permite que el plano alto sea realmente más alto
        if (tramoTipo === 2) {
            altura = Math.max(alturaBase - 90, Math.min(alturaBase - 30, altura));
        } else {
            altura = Math.max(alturaBase - 30, Math.min(alturaBase + 30, altura));
        }
        terreno.push(altura);
        tramoDuracion--;
    }
}

generarTerreno();

function obtenerAltura(x) {
    const i = Math.floor(x / scaleX);
    const t = x / scaleX - i;
    const y1 = terreno[i] || GROUND_Y;
    const y2 = terreno[i + 1] || GROUND_Y;
    return y1 * (1 - t) + y2 * t;
}

let disparando = false;
let cargando = false;
let cargaPotencia = 0;
let cargaInterval;

const powerMarker = document.getElementById("powerMarker");

const spriteSheet = new Image();
spriteSheet.src = 'armor_transparent.png';

spriteSheet.onload = () => {
    // Solo dibuja la escena si el fondo ya está cargado
    if (fondo.complete && fondo.naturalWidth > 0) {
        dibujarEscena();
    }
};

const jugador = {
    x: Math.floor(Math.random() * 100) + 10,
    angulo: 45,
    potencia: 50,
    flip: false,
    vida: 100
};

let enemigo = {
    x: Math.floor(Math.random() * 100) + 120,
    radio: 6,
    flip: false,
    vida: 100
};

function simularTrayectoria(anguloDeg, potencia, viento, inicioX, inicioY) {
    const anguloRad = anguloDeg * (Math.PI / 180);
    const v0 = potencia * FACTOR_POTENCIA;
    const dir = jugador.flip ? -1 : 1;
    const vx = dir * v0 * Math.cos(anguloRad) + viento;
    const vy = v0 * Math.sin(anguloRad);

    // Usar el punto de inicio proporcionado
    const startX = inicioX / scaleX;
    const startY = (canvas.height - inicioY) / scaleY;

    let puntos = [];
    let t = 0;
    const dt = 0.08; // Más grande para mayor velocidad

    // Si el ángulo es casi recto (cercano a 0° o 180°), reducir el efecto de la gravedad
    let gravedadLocal = GRAVEDAD;
    if (anguloDeg < 10 || anguloDeg > 80) {
        gravedadLocal = GRAVEDAD * 0.3; // Trayectoria más recta
    }

    while (true) {
        const x = startX + vx * t;
        const y = startY + vy * t - 0.5 * gravedadLocal * t * t;
        if (y < 0) break;
        puntos.push({ x, y });
        t += dt;
    }

    return puntos;
}

function dibujarBarraVida(x, vida) {
    // Posición base del personaje
    const px = x * scaleX;
    const py = obtenerAltura(x * scaleX);
    // Ajustes proporcionales al ancho del terreno
    const spriteScale = Math.max(0.7, Math.min(1.2, canvas.width / 2400));
    const nombreY = py - 80 * spriteScale; // Arriba del sprite
    const barY = py + 10 * spriteScale;    // Más cerca, justo debajo del sprite
    let nombre = (x === jugador.x) ? nombreJugador : nombreEnemigo;
    ctx.save();
    ctx.font = `bold ${28 * spriteScale}px "Segoe UI", Arial, sans-serif`;
    ctx.fillStyle = '#ffe259';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 10 * spriteScale;
    ctx.fillText(nombre, px, nombreY);
    ctx.restore();
    // Barra de vida proporcional
    const barWidth = 70 * spriteScale;
    const barHeight = 12 * spriteScale;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(px - barWidth / 2, barY, barWidth, barHeight);
    let grad = ctx.createLinearGradient(px - barWidth / 2, barY, px + barWidth / 2, barY);
    grad.addColorStop(0, vida > 30 ? '#00e676' : '#ff5151');
    grad.addColorStop(1, vida > 30 ? '#ffe259' : '#ff5151');
    ctx.fillStyle = grad;
    ctx.fillRect(px - barWidth / 2, barY, barWidth * (vida / 100), barHeight);
    ctx.lineWidth = 2 * spriteScale;
    ctx.strokeStyle = '#fff';
    ctx.shadowColor = '#ffe259';
    ctx.shadowBlur = 6 * spriteScale;
    ctx.strokeRect(px - barWidth / 2, barY, barWidth, barHeight);
    ctx.font = `bold ${14 * spriteScale}px "Segoe UI", Arial, sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4 * spriteScale;
    ctx.fillText(`${vida} HP`, px, barY + barHeight - 2 * spriteScale);
    ctx.restore();
}

function dibujarTerreno() {
    ctx.beginPath();
    ctx.moveTo(0, terreno[0]);
    for (let i = 1; i < terreno.length; i++) {
        ctx.lineTo(i * scaleX, terreno[i]);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Fija la textura respecto al canvas (sin desplazamiento)
    ctx.fillStyle = terrenoPattern;
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Resetea transform por si acaso
    ctx.restore();
}

function dibujarEscena() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Dibujar fondo si está cargado
    if (fondo.complete && fondo.naturalWidth > 0) {
        ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);
    }
    dibujarTerreno();


    const px = jugador.x * scaleX;
    const py = obtenerAltura(px);

    if (spriteSheet.complete) {
        // Escalado proporcional
        const spriteScale = Math.max(0.7, Math.min(1.2, canvas.width / 2400));
        ctx.save();
        ctx.translate(px, py);
        if (!jugador.flip) {
            ctx.scale(-1, 1);
        }
        ctx.drawImage(spriteSheet, -45 * spriteScale, -90 * spriteScale, 90 * spriteScale, 90 * spriteScale);
        ctx.restore();
        dibujarBarraVida(jugador.x, jugador.vida);
    }

    if (enemigo.vida > 0 && spriteSheet.complete) {
        const ex = enemigo.x * scaleX;
        const ey = obtenerAltura(ex);
        const spriteScale = Math.max(0.7, Math.min(1.2, canvas.width / 2400));
        ctx.save();
        ctx.translate(ex, ey);
        if (jugador.x > enemigo.x) {
            ctx.scale(-1, 1);
        }
        ctx.drawImage(spriteSheet, -45 * spriteScale, -90 * spriteScale, 90 * spriteScale, 90 * spriteScale);
        ctx.restore();
        dibujarBarraVida(enemigo.x, enemigo.vida);

        // Indicador de ángulo del enemigo
        const dirE = enemigo.x < jugador.x ? 1 : -1;
        const radE = enemigo.angulo * Math.PI / 180;
        const txE = ex + dirE * Math.cos(radE) * 80 * spriteScale;
        const tyE = ey - Math.sin(radE) * 80 * spriteScale;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(ex, ey - 45 * spriteScale);
        ctx.lineTo(txE, tyE);
        ctx.strokeStyle = '#ff5151';
        ctx.lineWidth = 4 * spriteScale;
        ctx.shadowColor = '#ff5151';
        ctx.shadowBlur = 10 * spriteScale;
        ctx.stroke();
        ctx.restore();
        // Círculo en la punta
        ctx.save();
        ctx.beginPath();
        ctx.arc(txE, tyE, 8 * spriteScale, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff5151';
        ctx.shadowColor = '#ff5151';
        ctx.shadowBlur = 12 * spriteScale;
        ctx.fill();
        ctx.restore();
        ctx.font = `bold ${14 * spriteScale}px sans-serif`;
        ctx.fillStyle = '#ff5151';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6 * spriteScale;
        ctx.fillText(`${Math.round(enemigo.angulo)}°`, txE + 12 * spriteScale, tyE - 8 * spriteScale);
        ctx.shadowBlur = 0;
    }

    const spriteScale = Math.max(0.7, Math.min(1.2, canvas.width / 2400));
    const dir = jugador.flip ? -1 : 1;
    const rad = jugador.angulo * Math.PI / 180;
    const tx = px + dir * Math.cos(rad) * 80 * spriteScale;
    const ty = py - Math.sin(rad) * 80 * spriteScale;

    // Indicador de ángulo estilizado
    let potenciaIndicador = 50;
    if (typeof cargando !== 'undefined' && cargando) {
        potenciaIndicador = typeof cargaPotencia !== 'undefined' ? cargaPotencia : 50;
    }
    const trayectoria = simularTrayectoria(
        jugador.angulo,
        potenciaIndicador,
        typeof viento !== 'undefined' ? viento : 0,
        jugador.x * scaleX,
        obtenerAltura(jugador.x * scaleX)
    );
    if (trayectoria.length > 1) {
        let puntosMostrar = 4;
        let trayectoriaFinal = trayectoria;
        let cx, cy;
        if (modoDios && typeof enemigo !== 'undefined' && enemigo.vida > 0) {
            let potenciaIdeal = 50;
            let mejorDist = Infinity;
            for (let p = 10; p <= 100; p += 1) {
                const tray = simularTrayectoria(
                    jugador.angulo,
                    p,
                    typeof viento !== 'undefined' ? viento : 0,
                    jugador.x * scaleX,
                    obtenerAltura(jugador.x * scaleX)
                );
                for (let punto of tray) {
                    const dx = (punto.x * scaleX) - (enemigo.x * scaleX);
                    const dy = (canvas.height - punto.y * scaleY) - obtenerAltura(enemigo.x * scaleX);
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mejorDist) {
                        mejorDist = dist;
                        potenciaIdeal = p;
                    }
                }
            }
            trayectoriaFinal = simularTrayectoria(
                jugador.angulo,
                potenciaIdeal,
                typeof viento !== 'undefined' ? viento : 0,
                jugador.x * scaleX,
                obtenerAltura(jugador.x * scaleX)
            );
            puntosMostrar = trayectoriaFinal.length;
        }
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(px, py - 45 * spriteScale);
        let finEncontrado = false;
        let finX = null, finY = null;
        for (let i = 0; i < Math.min(trayectoriaFinal.length, puntosMostrar); i++) {
            const punto = trayectoriaFinal[i];
            const x = punto.x * scaleX;
            const y = canvas.height - punto.y * scaleY;
            if (modoDios && !finEncontrado) {
                const terrenoY = obtenerAltura(x);
                const enemigoX = enemigo.x * scaleX;
                if (Math.abs(x - enemigoX) < 15 * spriteScale && y >= terrenoY) {
                    finEncontrado = true;
                    finX = x;
                    finY = terrenoY;
                    ctx.lineTo(x, terrenoY);
                    break;
                }
            }
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = modoDios ? '#ffe259' : '#00e6ff';
        ctx.lineWidth = 4 * spriteScale;
        ctx.shadowColor = modoDios ? '#ffe259' : '#00e6ff';
        ctx.shadowBlur = 10 * spriteScale;
        ctx.stroke();
        ctx.restore();

        // Círculo e indicador de ángulo al inicio de la trayectoria
        const primero = trayectoriaFinal[0];
        cx = primero.x * scaleX;
        cy = canvas.height - primero.y * scaleY;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, 8 * spriteScale, 0, 2 * Math.PI);
        ctx.fillStyle = modoDios ? '#ffe259' : '#00e6ff';
        ctx.shadowColor = modoDios ? '#ffe259' : '#00e6ff';
        ctx.shadowBlur = 12 * spriteScale;
        ctx.fill();
        ctx.restore();

        // Círculo dorado en el punto final sobre el terreno cerca del enemigo
        if (modoDios && finEncontrado) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(finX, finY, 8 * spriteScale, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffe259';
            ctx.shadowColor = '#ffe259';
            ctx.shadowBlur = 12 * spriteScale;
            ctx.fill();
            ctx.restore();
        }

        ctx.font = `bold ${14 * spriteScale}px sans-serif`;
        ctx.fillStyle = modoDios ? '#ffe259' : '#00e6ff';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6 * spriteScale;
        ctx.fillText(`${jugador.angulo}°`, cx + 12 * spriteScale, cy - 8 * spriteScale);
        ctx.shadowBlur = 0;
    }
}

function mostrarImpactoCentral(killed = false) {
    // Reproducir sonido de explosión
    function reproducirExplosion() {
        let audio = document.getElementById('explosionAudio');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'explosionAudio';
            audio.src = 'explosion.mp3';
            audio.preload = 'auto';
            document.body.appendChild(audio);
        }
        audio.currentTime = 0;
        audio.play();
    }

    reproducirExplosion();
    // Animación de explosión profesional en el canvas
    function explosionAnim(x, y) {
        const particles = [];
        const numParticles = 60;
        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const speed = Math.random() * 6 + 4;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 18 + 12,
                alpha: 1,
                color: `rgba(${220 + Math.random() * 35 | 0},${80 + Math.random() * 80 | 0},${10 + Math.random() * 40 | 0},1)`
            });
        }
        let frame = 0;
        function animate() {
            frame++;
            dibujarEscena();
            for (let p of particles) {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                const grad = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.radius);
                grad.addColorStop(0, '#fff');
                grad.addColorStop(0.2, p.color);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.restore();
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.92;
                p.vy *= 0.92;
                p.radius *= 0.96;
                p.alpha *= 0.93;
            }
            if (frame < 32) {
                requestAnimationFrame(animate);
            } else {
                dibujarEscena();
            }
        }
        animate();
    }

    // Mostrar texto de impacto o killed
    const impacto = document.createElement('div');
    impacto.textContent = killed ? '💀 KILLED!' : '🔥 ¡IMPACTO! 🔥';
    impacto.style.position = 'absolute';
    impacto.style.top = '50%';
    impacto.style.left = '50%';
    impacto.style.transform = 'translate(-50%, -50%) scale(1)';
    impacto.style.fontSize = '48px';
    impacto.style.color = '#ffcc00';
    impacto.style.fontWeight = 'bold';
    impacto.style.textShadow = '2px 2px 10px black';
    impacto.style.zIndex = '100';
    impacto.style.opacity = '1';
    impacto.style.transition = 'opacity 1s ease-out, transform 1s ease-out';

    document.body.appendChild(impacto);

    setTimeout(() => {
        impacto.style.opacity = '0';
        impacto.style.transform = 'translate(-50%, -50%) scale(1.5)';
    }, 100);

    setTimeout(() => {
        impacto.remove();
    }, 1500);

    // Calcular posición de impacto en canvas
    let impactX = null, impactY = null;
    if (turnoJugador === 1 && enemigo.vida > 0) {
        impactX = enemigo.x * scaleX;
        impactY = obtenerAltura(impactX) - 30;
    } else if (turnoJugador === 2 && jugador.vida > 0) {
        impactX = jugador.x * scaleX;
        impactY = obtenerAltura(impactX) - 30;
    }
    if (impactX && impactY) {
        explosionAnim(impactX, impactY);
    }
}

function mostrarDaño(valor, x, y) {
    const dmg = document.getElementById('damageIndicator');
    dmg.textContent = `-${valor}`;
    dmg.style.left = `${x}px`;
    dmg.style.top = `${y - 80}px`;
    dmg.style.opacity = '1';
    dmg.style.transform = 'translateY(0px)';
    dmg.style.display = 'block';
    setTimeout(() => {
        dmg.style.opacity = '0';
        dmg.style.transform = 'translateY(-40px)';
    }, 50);
    setTimeout(() => {
        dmg.style.display = 'none';
    }, 1000);

    // Si alguien muere, respawnea y pasa turno automáticamente
    function animarCaida(obj, callback) {
        const x = obj.x * scaleX;
        const yFinal = obtenerAltura(x);
        let yActual = -120;
        let frame = 0;
        function anim() {
            frame++;
            let t = Math.min(1, frame / 32);
            // Ease out
            t = 1 - Math.pow(1 - t, 2);
            let y = yActual + (yFinal - yActual) * t;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (fondo.complete && fondo.naturalWidth > 0) {
                ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);
            }
            dibujarTerreno();
            // Dibuja el personaje que cae
            if (spriteSheet.complete) {
                ctx.save();
                ctx.translate(x, y);
                if (obj === jugador && !jugador.flip) ctx.scale(-1, 1);
                ctx.drawImage(spriteSheet, -45, -90, 90, 90);
                ctx.restore();
                dibujarBarraVida(obj.x, obj.vida);
            }
            // Dibuja el otro personaje en su ubicación normal
            let otro, otroFlip;
            if (obj === jugador) {
                otro = enemigo;
                otroFlip = enemigo.flip;
            } else {
                otro = jugador;
                otroFlip = jugador.flip;
            }
            // Guardar orientación al inicio de la animación
            if (anim.frame === undefined) anim.frame = 0;
            if (anim.frame === 0) anim.otroFlipOriginal = otroFlip;
            otroFlip = anim.otroFlipOriginal;
            if (otro.vida > 0 && spriteSheet.complete) {
                const ox = otro.x * scaleX;
                const oy = obtenerAltura(ox);
                ctx.save();
                ctx.translate(ox, oy);
                if (otro === jugador && !otroFlip) ctx.scale(-1, 1);
                ctx.drawImage(spriteSheet, -45, -90, 90, 90);
                ctx.restore();
                dibujarBarraVida(otro.x, otro.vida);
            }
            if (frame < 32) {
                requestAnimationFrame(anim);
            } else {
                if (callback) callback();
            }
        }
        anim();
    }

    // Detectar muerte real (vida pasa de >0 a <=0)
    if (jugador.vida <= 0 && jugador.vida + valor > 0) {
        window.muertesJugador = (window.muertesJugador || 0) + 1;
        window.killsEnemigo = (window.killsEnemigo || 0) + 1;
        setTimeout(() => {
            jugador.x = Math.floor(Math.random() * 100) + 10;
            jugador.vida = 100;
            animarCaida(jugador, () => {
                dibujarEscena();
                turnoJugador = 2;
                disparoRealizado = false;
                enemigoActua();
            });
        }, 1200);
    }
    if (enemigo.vida <= 0 && enemigo.vida + valor > 0) {
        window.muertesEnemigo = (window.muertesEnemigo || 0) + 1;
        window.killsJugador = (window.killsJugador || 0) + 1;
        setTimeout(() => {
            // Respawnea lejos del jugador (mínimo 100px de distancia)
            do {
                enemigo.x = Math.floor(Math.random() * 100) + 120;
            } while (Math.abs(enemigo.x - jugador.x) < 100);
            enemigo.vida = 100;
            animarCaida(enemigo, () => {
                dibujarEscena();
                turnoJugador = 1;
                disparoRealizado = false;
                iniciarTimerTurno();
            });
        }, 1200);
    }
}

function actualizarEnemigo() {
    enemigo = {
        x: Math.floor(Math.random() * 100) + 120,
        radio: 6,
        flip: false,
        vida: 100
    };
    dibujarEscena();
}

function dispararPotencia(potencia) {
    if (disparando) return;
    disparando = true;

    const tipo = window.tipoBalaActual || '1';
    const viento = 0;

    // Calcular el punto de inicio igual que en dibujarEscena
    const px = jugador.x * scaleX;
    const py = obtenerAltura(px);
    const dir = jugador.flip ? -1 : 1;
    const rad = jugador.angulo * Math.PI / 180;
    const tx = px + dir * Math.cos(rad) * 40;
    const ty = py - Math.sin(rad) * 40;

    // Pasar el punto de inicio a la simulación
    const puntos = simularTrayectoria(jugador.angulo, potencia, viento, tx, ty);
    let i = 0;

    const container = document.getElementById("powerBarContainer");
    const markerWidth = powerMarker.offsetWidth || 2;
    const barWidth = container.clientWidth;
    const offset = (potencia / 100) * barWidth - (markerWidth / 2) - 10;
    powerMarker.style.left = `${offset}px`;

    function animar() {
        if (i >= puntos.length) {
            disparando = false;
            setTimeout(() => {
                turnoJugador = 2;
                disparoRealizado = false;
                enemigoActua();
            }, 400);
            return;
        }

        dibujarEscena();
        const p = puntos[i];
        const px = p.x * scaleX;
        const py = canvas.height - p.y * scaleY;

        // Colisión con el terreno
        const terrenoY = obtenerAltura(px);
        if (py > terrenoY) {
            // Reproducir sonido de explosión
            let audio = document.getElementById('explosionAudio');
            if (!audio) {
                audio = document.createElement('audio');
                audio.id = 'explosionAudio';
                audio.src = 'explosion.mp3';
                audio.preload = 'auto';
                document.body.appendChild(audio);
            }
            audio.currentTime = 0;
            audio.play();
            // Rompe el terreno en el punto de impacto
            romperTerreno(px, py, tipo === 'SS' ? 300 : tipo === '2' ? 120 : 100);

            // Daño reducido si el impacto está cerca del enemigo
            const ex = enemigo.x * scaleX;
            const ey = obtenerAltura(ex);
            const dist = Math.hypot(px - ex, py - ey);
            const radioCercano = tipo === 'SS' ? 120 : tipo === '2' ? 60 : 40;
            if (enemigo.vida > 0 && dist < radioCercano) {
                let daño = tipo === 'SS' ? 30 : tipo === '2' ? 18 : 12;
                enemigo.vida = Math.max(0, enemigo.vida - daño);
                mostrarDaño(daño, ex, ey);
                if (enemigo.vida <= 0) {
                    setTimeout(() => {
                        actualizarEnemigo();
                    }, 1000);
                }
            }

            disparando = false;
            dibujarEscena();
            setTimeout(() => {
                turnoJugador = 2;
                disparoRealizado = false;
                enemigoActua();
            }, 400);
            return;
        }

        ctx.save();
        if (tipo === '1') {
            ctx.fillStyle = 'orange';
        } else if (tipo === '2') {
            ctx.fillStyle = 'red';
        } else if (tipo === 'SS') {
            const gradient = ctx.createRadialGradient(px, py, 4, px, py, 20);
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(0.5, 'cyan');
            gradient.addColorStop(1, 'blue');
            ctx.fillStyle = gradient;
        }
        ctx.beginPath();
        ctx.arc(px, py, tipo === 'SS' ? 14 : tipo === '2' ? 10 : 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        const ex = enemigo.x * scaleX;
        const ey = obtenerAltura(ex);
        const bbox = {
            x: ex - 30,
            y: ey - 60,
            w: 60,
            h: 60
        };

        if (enemigo.vida > 0 && px >= bbox.x && px <= bbox.x + bbox.w && py >= bbox.y && py <= bbox.y + bbox.h) {
            let daño = 20;
            if (tipo === '2') daño = 35;
            if (tipo === 'SS') daño = 60;
            const vidaRestante = enemigo.vida - daño;
            mostrarImpactoCentral(vidaRestante <= 0);
            enemigo.vida = Math.max(0, vidaRestante);
            mostrarDaño(daño, ex, ey);
            if (enemigo.vida <= 0) {
                setTimeout(() => {
                    actualizarEnemigo();
                }, 1000);
            }
            disparando = false;
            dibujarEscena();
            setTimeout(() => {
                turnoJugador = 2;
                disparoRealizado = false;
                enemigoActua();
            }, 400);
            return;
        }

        i++;
        requestAnimationFrame(animar);
    }

    animar();
}


function actualizarUI() {
    // Mostrar ángulo solo en el modal de controles si está abierto
    const angleDisplayModal = document.getElementById("angleDisplayModal");
    if (angleDisplayModal) {
        angleDisplayModal.textContent = jugador.angulo;
    }
    // Actualiza la barra de gasolina
    const gasolinaBar = document.getElementById("gasolinaBar");
    if (gasolinaBar) {
        gasolinaBar.style.width = gasolina + "%";
    }
    // Timer de turno
    const gasolinaTimerDiv = document.getElementById("gasolinaTimer");
    if (gasolinaTimerDiv) {
        gasolinaTimerDiv.style.display = "block";
        gasolinaTimerDiv.style.opacity = "1";
        gasolinaTimerDiv.style.transform = "scale(1.1)";
        let nombre = turnoJugador === 1 ? "Tu turno" : "Turno enemigo";
        let color = turnoJugador === 1 ? "#ffe259" : "#ff5151";
        let timerText = `<span style='font-size:0.5em;vertical-align:top;'>⏳</span> <span style='font-size:1.2em; font-family:Impact,Arial,sans-serif; color:${color}; text-shadow:0 0 24px ${color}, 0 0 8px #000;'>${gasolinaTimer}</span><span style='font-size:0.7em;'>s</span><br><span style='font-size:0.5em;color:${color};'>${nombre}</span>`;
        gasolinaTimerDiv.innerHTML = timerText;
    }
}

// Añadir texto opaco en el centro de la barra de power
const powerBarContainer = document.getElementById('powerBarContainer');
if (powerBarContainer && !document.getElementById('powerBarLabel')) {
    const label = document.createElement('div');
    label.id = 'powerBarLabel';
    label.textContent = 'POWER BAR';
    label.style.position = 'absolute';
    label.style.top = '50%';
    label.style.left = '50%';
    label.style.transform = 'translate(-50%, -50%)';
    label.style.color = '#fff';
    label.style.opacity = '0.18';
    label.style.fontSize = '1.3em';
    label.style.fontWeight = 'bold';
    label.style.pointerEvents = 'none';
    label.style.letterSpacing = '2px';
    label.style.userSelect = 'none';
    powerBarContainer.appendChild(label);
}
// Añadir texto menos opaco y emoji en el centro de la barra de gasolina
const gasolinaBarContainer = document.getElementById('gasolinaBarContainer');
if (gasolinaBarContainer && !document.getElementById('gasolinaBarLabel')) {
    const label = document.createElement('div');
    label.id = 'gasolinaBarLabel';
    label.innerHTML = '⛽ GASOLINE';
    label.style.position = 'absolute';
    label.style.top = '50%';
    label.style.left = '50%';
    label.style.transform = 'translate(-50%, -50%)';
    label.style.color = '#222';
    label.style.opacity = '0.32';
    label.style.fontSize = '1.1em';
    label.style.fontWeight = 'bold';
    label.style.pointerEvents = 'none';
    label.style.letterSpacing = '2px';
    label.style.userSelect = 'none';
    gasolinaBarContainer.appendChild(label);
}

const teclasPresionadas = {};
let movimientoInterval = null;

function procesarTeclas() {
    if (!juegoIniciado) return;
    if (disparoRealizado) return;
    if (disparando || cargando) return;
    if (turnoJugador !== 1) return;
    let movio = false;
    // Movimiento solo si hay gasolina
    if (!gasolinaBloqueada) {
        if (teclasPresionadas['ArrowLeft']) {
            jugador.x = Math.max(0, jugador.x - 1);
            jugador.flip = true;
            movio = true;
        }
        if (teclasPresionadas['ArrowRight']) {
            jugador.x = Math.min(SEGMENTOS - 1, jugador.x + 1);
            jugador.flip = false;
            movio = true;
        }
        if (movio) {
            gasolina = Math.max(0, gasolina - 1.2);
            if (gasolina === 0 && !gasolinaBloqueada) {
                gasolinaBloqueada = true;
            }
        }
    } else {
        // Sin gasolina: solo cambiar dirección, NO mover
        if (teclasPresionadas['ArrowLeft'] || teclasPresionadas['ArrowRight']) {
            // Solo cambia flip, no mueve x
            if (teclasPresionadas['ArrowLeft']) jugador.flip = true;
            if (teclasPresionadas['ArrowRight']) jugador.flip = false;
        }
    }
    if (teclasPresionadas['ArrowUp']) {
        jugador.angulo = Math.min(90, jugador.angulo + 1);
    }
    if (teclasPresionadas['ArrowDown']) {
        jugador.angulo = Math.max(0, jugador.angulo - 1);
    }
    actualizarUI();
    dibujarEscena();
    // Si modoDios está activo, recalcula y muestra la línea dorada en cada tick
    if (modoDios && typeof enemigo !== 'undefined' && enemigo.vida > 0) {
        let potenciaIdeal = 50;
        let mejorDist = Infinity;
        for (let p = 10; p <= 100; p += 1) {
            const tray = simularTrayectoria(
                jugador.angulo,
                p,
                typeof viento !== 'undefined' ? viento : 0,
                jugador.x * scaleX,
                obtenerAltura(jugador.x * scaleX)
            );
            for (let punto of tray) {
                const dx = (punto.x * scaleX) - (enemigo.x * scaleX);
                const dy = (canvas.height - punto.y * scaleY) - obtenerAltura(enemigo.x * scaleX);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mejorDist) {
                    mejorDist = dist;
                    potenciaIdeal = p;
                }
            }
        }
        mostrarLineaDiosPowerBar(potenciaIdeal);
    }
}

document.addEventListener("keydown", (e) => {
    teclasPresionadas[e.key] = true;
    // Si es una flecha, procesa y dibuja inmediatamente
    if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) {
        procesarTeclas();
    }
    if (!movimientoInterval) {
        movimientoInterval = setInterval(procesarTeclas, 50);
    }
    // Solo activar carga con barra espaciadora si está en modo slice
    if (e.key === " " && modoCarga === 'slice' && !cargando && !disparando && !disparoRealizado && turnoJugador === 1) {
        cargando = true;
        cargaPotencia = 0;
        const bar = document.getElementById("powerBar");
        cargaInterval = setInterval(() => {
            cargaPotencia = Math.min(100, cargaPotencia + 0.5);
            bar.style.width = cargaPotencia + "%";
        }, 20);
    }
// --- Modo Drag para powerbar ---
document.addEventListener("mousedown", (e) => {
    // Si el modo drag está activado, pero el click es sobre un botón, no ejecutar drag
    if (modoCarga === 'drag') {
        // Verifica si el target es un botón o está dentro de un botón
        let el = e.target;
        while (el) {
            if (el.tagName === 'BUTTON') return;
            el = el.parentElement;
        }
    }
    if (modoCarga !== 'drag' || disparando || disparoRealizado || turnoJugador !== 1) return;
    const bar = document.getElementById("powerBar");
    const container = document.getElementById("powerBarContainer");
    if (!container || !bar) return;
    if (e.button !== 0) return; // Solo click izquierdo
    cargando = true;
    cargaPotencia = 0;
    bar.style.width = "0%";
    function onMouseMove(ev) {
        const rect = container.getBoundingClientRect();
        let x = Math.max(0, Math.min(ev.clientX - rect.left, rect.width));
        cargaPotencia = Math.round((x / rect.width) * 100);
        bar.style.width = cargaPotencia + "%";
    }
    function onMouseUp(ev) {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        cargando = false;
        jugador.potencia = cargaPotencia;
        bar.style.width = "0%";
        disparoRealizado = true;
        dispararPotencia(jugador.potencia);
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
});
});

document.addEventListener("keyup", (e) => {
    teclasPresionadas[e.key] = false;
    if (!Object.values(teclasPresionadas).some(v => v)) {
        clearInterval(movimientoInterval);
        movimientoInterval = null;
    }
    if (e.key === " " && cargando) {
        clearInterval(cargaInterval);
        cargando = false;
        jugador.potencia = cargaPotencia;
        document.getElementById("powerBar").style.width = "0%";
        disparoRealizado = true;
        dispararPotencia(jugador.potencia);
    }
});

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("bullet-button")) {
        tipoBala = e.target.dataset.tipo;
        document.querySelectorAll('.bullet-button').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');
    }
});



window.tipos = ['1', '2', 'SS'];
window.tipoBalaActual = '1';

window.actualizarBotones = function(tipoSeleccionado) {
    document.querySelectorAll('.bullet-button').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.tipo === tipoSeleccionado);
    });
};

document.querySelectorAll('.bullet-button').forEach(btn => {
    btn.addEventListener('click', () => {
        window.tipoBalaActual = btn.dataset.tipo;
        window.actualizarBotones(window.tipoBalaActual);
    });
});


actualizarUI();
dibujarEscena();

// --- Timer de turnos ---
function iniciarTimerTurno() {
    if (!juegoIniciado) return;
    if (gasolinaInterval) {
        clearInterval(gasolinaInterval);
        gasolinaInterval = null;
    }
    // Reiniciar timer de turno SIEMPRE al iniciar el turno
    gasolinaTimer = 20;
    // Control de audio clock-tick
    let clockAudio = document.getElementById('clockTickAudio');
    if (!clockAudio) {
        clockAudio = document.createElement('audio');
        clockAudio.id = 'clockTickAudio';
        clockAudio.src = 'clock-tick.mp3';
        clockAudio.preload = 'auto';
        clockAudio.loop = true;
        document.body.appendChild(clockAudio);
    }
    if (turnoJugador === 1) {
        gasolina = 100;
        gasolinaBloqueada = false;
        window.turnosJugador = (window.turnosJugador || 0) + 1;
        // Reproducir clock-tick en loop
        clockAudio.currentTime = 0;
        clockAudio.play();
    } else {
        window.turnosEnemigo = (window.turnosEnemigo || 0) + 1;
        // Pausar clock-tick
        clockAudio.pause();
        clockAudio.currentTime = 0;
    }
    actualizarUI();
    gasolinaInterval = setInterval(() => {
        gasolinaTimer--;
        actualizarUI();
        // Control estricto del audio en cada tick
        let clockAudio = document.getElementById('clockTickAudio');
        if (clockAudio) {
            if (turnoJugador === 1 && clockAudio.paused) {
                clockAudio.currentTime = 0;
                clockAudio.play();
            } else if (turnoJugador !== 1 && !clockAudio.paused) {
                clockAudio.pause();
                clockAudio.currentTime = 0;
            }
        }
        if (gasolinaTimer <= 0) {
            clearInterval(gasolinaInterval);
            gasolinaInterval = null;
            if (turnoJugador === 1) {
                // Fin de turno jugador, pasa a enemigo
                turnoJugador = 2;
                gasolina = 100;
                setTimeout(() => {
                    iniciarTimerTurno();
                    setTimeout(() => {
                        enemigoActua();
                    }, 100);
                }, 800);
                // Recalcular indicador dorado en powerbar si modoDios está activo
                if (modoDios && typeof enemigo !== 'undefined' && enemigo.vida > 0) {
                    let potenciaIdeal = 50;
                    let mejorDist = Infinity;
                    for (let p = 10; p <= 100; p += 1) {
                        const tray = simularTrayectoria(
                            jugador.angulo,
                            p,
                            typeof viento !== 'undefined' ? viento : 0,
                            jugador.x * scaleX,
                            obtenerAltura(jugador.x * scaleX)
                        );
                        for (let punto of tray) {
                            const dx = (punto.x * scaleX) - (enemigo.x * scaleX);
                            const dy = (canvas.height - punto.y * scaleY) - obtenerAltura(enemigo.x * scaleX);
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < mejorDist) {
                                mejorDist = dist;
                                potenciaIdeal = p;
                            }
                        }
                    }
                    mostrarLineaDiosPowerBar(potenciaIdeal);
                }
            } else {
                // Fin de turno enemigo, pasa a jugador
                turnoJugador = 1;
                gasolina = 100;
                gasolinaBloqueada = false;
                iniciarTimerTurno();
                // Recalcular indicador dorado en powerbar si modoDios está activo
                if (modoDios && typeof enemigo !== 'undefined' && enemigo.vida > 0) {
                    let potenciaIdeal = 50;
                    let mejorDist = Infinity;
                    for (let p = 10; p <= 100; p += 1) {
                        const tray = simularTrayectoria(
                            jugador.angulo,
                            p,
                            typeof viento !== 'undefined' ? viento : 0,
                            jugador.x * scaleX,
                            obtenerAltura(jugador.x * scaleX)
                        );
                        for (let punto of tray) {
                            const dx = (punto.x * scaleX) - (enemigo.x * scaleX);
                            const dy = (canvas.height - punto.y * scaleY) - obtenerAltura(enemigo.x * scaleX);
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < mejorDist) {
                                mejorDist = dist;
                                potenciaIdeal = p;
                            }
                        }
                    }
                    mostrarLineaDiosPowerBar(potenciaIdeal);
                }
            }
        }
    }, 1000);
}

function enemigoActua() {
    // El enemigo se mueve antes de disparar para buscar mejor ángulo
    let mejorX = enemigo.x;
    let mejorAngulo = 45;
    let mejorDistancia = Infinity;
    // Busca entre varias posiciones posibles
    for (let offset = -20; offset <= 20; offset += 4) {
        let posibleX = Math.max(0, Math.min(SEGMENTOS - 1, enemigo.x + offset));
        let dx = jugador.x - posibleX;
        let dy = obtenerAltura(jugador.x * scaleX) - obtenerAltura(posibleX * scaleX);
        let angulo = Math.atan2(-dy, dx) * 180 / Math.PI;
        angulo = Math.max(20, Math.min(80, angulo));
        let distancia = Math.abs(angulo - 45) + Math.abs(dx);
        if (distancia < mejorDistancia) {
            mejorDistancia = distancia;
            mejorX = posibleX;
            mejorAngulo = angulo;
        }
    }
    // Movimiento fluido del enemigo hacia la mejor posición
    function moverEnemigoFluido(destino, callback) {
        let pasos = Math.abs(destino - enemigo.x);
        let direccion = destino > enemigo.x ? 1 : -1;
        let intervalo = setInterval(() => {
            if (enemigo.x === destino || pasos <= 0) {
                clearInterval(intervalo);
                if (callback) callback();
                return;
            }
            enemigo.x += direccion;
            pasos--;
            dibujarEscena();
        }, 40);
    }
    moverEnemigoFluido(mejorX, () => {
        // El enemigo debe girar para dar la cara al jugador antes de disparar
        enemigo.flip = (jugador.x < enemigo.x) ? true : false;
        // El enemigo ajusta su ángulo paso a paso para apuntar al jugador
        let pasos = 0;
        function ajustarAnguloInteligente() {
            contadorTurnosEnemigo++;
            // Decide si este turno debe acertar o fallar según precisionEnemigo
            let debeAcertar = false;
            // Ejemplo: si precisionEnemigo = 0.65, acierta 65 de cada 100 turnos
            if ((contadorTurnosEnemigo * precisionEnemigo) > contadorAciertosEnemigo) {
                debeAcertar = true;
                contadorAciertosEnemigo++;
            }
            // Simula varios ángulos y elige el que más se acerca al jugador
            const dx = jugador.x - enemigo.x;
            const dy = obtenerAltura(jugador.x * scaleX) - obtenerAltura(enemigo.x * scaleX);
            enemigo.flip = dx < 0 ? true : false;
            let mejorAngulo = 45;
            let mejorPotencia = 80;
            let mejorDistancia = Infinity;
            let peorAngulo = 45;
            let peorPotencia = 80;
            let peorDistancia = -Infinity;
            // Prueba ángulos entre 25 y 80 grados
            for (let ang = 25; ang <= 80; ang += 2) {
                for (let pot = 60; pot <= 100; pot += 8) {
                    // Simula trayectoria
                    const dir = enemigo.flip ? -1 : 1;
                    const rad = ang * Math.PI / 180;
                    const px = enemigo.x * scaleX;
                    const py = obtenerAltura(px);
                    const tx = px + dir * Math.cos(rad) * 40;
                    const ty = py - Math.sin(rad) * 40;
                    const puntos = (function() {
                        const viento = 0;
                        const anguloRad = ang * Math.PI / 180;
                        const v0 = pot * FACTOR_POTENCIA;
                        const vx = dir * v0 * Math.cos(anguloRad) + viento;
                        const vy = v0 * Math.sin(anguloRad);
                        const startX = tx / scaleX;
                        const startY = (canvas.height - ty) / scaleY;
                        let puntos = [];
                        let t = 0;
                        const dt = 0.08;
                        let gravedadLocal = GRAVEDAD;
                        if (ang < 10 || ang > 80) gravedadLocal = GRAVEDAD * 0.3;
                        while (true) {
                            const x = startX + vx * t;
                            const y = startY + vy * t - 0.5 * gravedadLocal * t * t;
                            if (y < 0) break;
                            puntos.push({ x, y });
                            t += dt;
                        }
                        return puntos;
                    })();
                    // Busca el punto de la trayectoria más cercano al jugador
                    const jx = jugador.x * scaleX;
                    const jy = obtenerAltura(jx);
                    let mejorDistPunto = Infinity;
                    let peorDistPunto = -Infinity;
                    for (let p of puntos) {
                        const pxFinal = p.x * scaleX;
                        const pyFinal = canvas.height - p.y * scaleY;
                        const dist = Math.hypot(pxFinal - jx, pyFinal - jy);
                        if (dist < mejorDistPunto) mejorDistPunto = dist;
                        if (dist > peorDistPunto) peorDistPunto = dist;
                    }
                    // Usa el punto más cercano para elegir el mejor ángulo/potencia
                    if (mejorDistPunto < mejorDistancia) {
                        mejorDistancia = mejorDistPunto;
                        mejorAngulo = ang;
                        mejorPotencia = pot;
                    }
                    if (peorDistPunto > peorDistancia) {
                        peorDistancia = peorDistPunto;
                        peorAngulo = ang;
                        peorPotencia = pot;
                    }
                }
            }
            // Si debe acertar, usa el mejor ángulo/potencia; si no, usa el peor
            let anguloFinal, potenciaFinal;
            if (debeAcertar) {
                anguloFinal = mejorAngulo;
                potenciaFinal = mejorPotencia;
            } else {
                // Para fallar, elige un ángulo que pase cerca pero no impacte
                anguloFinal = peorAngulo;
                potenciaFinal = peorPotencia;
                // Aleja el ángulo un poco más para asegurar el fallo
                anguloFinal += (anguloFinal < 60 ? 10 : -10);
            }
            // Ajusta el ángulo gradualmente
            if (Math.abs(enemigo.angulo - anguloFinal) > 1 && pasos < 40) {
                enemigo.angulo += (anguloFinal - enemigo.angulo) * 0.2;
                pasos++;
                dibujarEscena();
                setTimeout(ajustarAnguloInteligente, 30);
            } else {
                enemigo.angulo = anguloFinal;
                enemigo.potencia = potenciaFinal;
                dibujarEscena();
                setTimeout(() => {
                    dispararEnemigo(enemigo.angulo, enemigo.potencia);
                }, 800);
            }
        }
        ajustarAnguloInteligente();
    });
}

function dispararEnemigo(angulo, potencia) {
    // Simula trayectorias como el jugador
    const viento = 0;
    const px = enemigo.x * scaleX;
    const py = obtenerAltura(px);
    // La dirección depende del flip del enemigo
    const dir = enemigo.flip ? -1 : 1;
    const rad = angulo * Math.PI / 180;
    // El punto de inicio y la simulación deben usar la dirección correcta
    const tx = px + dir * Math.cos(rad) * 40;
    const ty = py - Math.sin(rad) * 40;
    // Simular trayectorias usando la dirección del enemigo
    function simularTrayectoriaEnemigo(anguloDeg, potencia, viento, inicioX, inicioY, dir) {
        const anguloRad = anguloDeg * (Math.PI / 180);
        const v0 = potencia * FACTOR_POTENCIA;
        const vx = dir * v0 * Math.cos(anguloRad) + viento;
        const vy = v0 * Math.sin(anguloRad);
        const startX = inicioX / scaleX;
        const startY = (canvas.height - inicioY) / scaleY;
        let puntos = [];
        let t = 0;
        const dt = 0.08;
        let gravedadLocal = GRAVEDAD;
        if (anguloDeg < 10 || anguloDeg > 80) gravedadLocal = GRAVEDAD * 0.3;
        while (true) {
            const x = startX + vx * t;
            const y = startY + vy * t - 0.5 * gravedadLocal * t * t;
            if (y < 0) break;
            puntos.push({ x, y });
            t += dt;
        }
        return puntos;
    }
    const puntos = simularTrayectoriaEnemigo(angulo, potencia, viento, tx, ty, dir);
    let i = 0;
    function animar() {
        if (i >= puntos.length) {
            turnoJugador = 1;
            iniciarTimerTurno();
            return;
        }
        dibujarEscena();
        const p = puntos[i];
        const px2 = p.x * scaleX;
        const py2 = canvas.height - p.y * scaleY;
        // Colisión con el terreno
        const terrenoY = obtenerAltura(px2);
        if (py2 > terrenoY) {
            // Reproducir sonido de explosión
            let audio = document.getElementById('explosionAudio');
            if (!audio) {
                audio = document.createElement('audio');
                audio.id = 'explosionAudio';
                audio.src = 'explosion.mp3';
                audio.preload = 'auto';
                document.body.appendChild(audio);
            }
            audio.currentTime = 0;
            audio.play();
            // Rompe el terreno en el punto de impacto
            romperTerreno(px2, py2, 36);
            dibujarEscena();
            turnoJugador = 1;
            iniciarTimerTurno();
            return;
        }
        ctx.save();
        ctx.fillStyle = '#ff5151';
        ctx.beginPath();
        ctx.arc(px2, py2, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
        // Colisión con el jugador
        const jx = jugador.x * scaleX;
        const jy = obtenerAltura(jx);
        const bbox = { x: jx - 30, y: jy - 60, w: 60, h: 60 };
        if (px2 >= bbox.x && px2 <= bbox.x + bbox.w && py2 >= bbox.y && py2 <= bbox.y + bbox.h) {
            const vidaRestante = jugador.vida - 30;
            mostrarImpactoCentral(vidaRestante <= 0);
            jugador.vida = Math.max(0, vidaRestante);
            mostrarDaño(30, jx, jy);
            dibujarEscena();
            turnoJugador = 1;
            iniciarTimerTurno();
            return;
        }
        i++;
        requestAnimationFrame(animar);
    }
    animar();
}

iniciarTimerTurno();

// --- UI: barra de gasolina y timer ---
window.addEventListener('DOMContentLoaded', () => {
    const controls = document.querySelector('.controls');
    if (controls && !document.getElementById('gasolinaBarContainer')) {
        const gasolinaContainer = document.createElement('div');
        gasolinaContainer.id = 'gasolinaBarContainer';
        gasolinaContainer.style.width = '100%';
        gasolinaContainer.style.height = '24px';
        gasolinaContainer.style.background = '#222';
        gasolinaContainer.style.borderRadius = '12px';
        gasolinaContainer.style.margin = '8px 0';
        gasolinaContainer.style.position = 'relative';
        gasolinaContainer.style.boxShadow = '0 2px 8px #0006';

        const gasolinaBar = document.createElement('div');
        gasolinaBar.id = 'gasolinaBar';
        gasolinaBar.style.height = '100%';
        gasolinaBar.style.width = '100%';
        gasolinaBar.style.background = 'linear-gradient(90deg, #ffe259 0%, #ffa751 100%)';
        gasolinaBar.style.borderRadius = '12px';
        gasolinaBar.style.transition = 'width 0.2s';
        gasolinaBar.style.boxShadow = '0 0 8px #ffa751';

        gasolinaContainer.appendChild(gasolinaBar);
        controls.appendChild(gasolinaContainer);
    }

    // Timer grande arriba a la derecha, SIEMPRE con estilos y superposición
    if (!document.getElementById('gasolinaTimer')) {
        const timerDiv = document.createElement('div');
        timerDiv.id = 'gasolinaTimer';
        timerDiv.className = 'gasolina-timer-force';
        document.body.appendChild(timerDiv);
    }
    // Estilos forzados para el timer de gasolina
    const style = document.createElement('style');
    style.innerHTML = `
.gasolina-timer-force {
    position: fixed !important;
    top: 32px !important;
    right: 48px !important;
    z-index: 9999 !important;
    font-size: 48px !important;
    font-weight: 900 !important;
    letter-spacing: 2px !important;
    color: #ffe259 !important;
    text-shadow: 0 0 24px #ffa751, 0 0 6px #000, 2px 2px 16px #000 !important;
    padding: 12px 28px !important;
    border-radius: 28px !important;
    background: rgba(34,34,34,0.92) !important;
    box-shadow: 0 8px 32px #000a, 0 0 24px #ffa751a0 !important;
    display: none;
    transition: transform 0.3s cubic-bezier(.68,-0.55,.27,1.55), opacity 0.3s;
}
`;
    document.head.appendChild(style);
});
