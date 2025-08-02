// ...existing code...
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
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
// Elimina cualquier fondo CSS del canvas
canvas.style.background = 'transparent';
const GRAVEDAD = 9.8;
const FACTOR_POTENCIA = 1.2;
const scaleX = 5;
const scaleY = 5;
const UI_OFFSET = 300;
const GROUND_Y = canvas.height - UI_OFFSET;

let terreno = [];
let terrenoPattern = null;
const SEGMENTOS = Math.ceil(canvas.width / scaleX);
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
spriteSheet.src = 'https://i.pinimg.com/474x/c7/82/cb/c782cbef14da789f2151d05511bf40b2.jpg';

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
    const px = x * scaleX - 30;
    const py = obtenerAltura(x * scaleX) - 80;
    ctx.fillStyle = '#000';
    ctx.fillRect(px, py, 60, 8);
    ctx.fillStyle = vida > 30 ? '#0f0' : '#f00';
    ctx.fillRect(px, py, 60 * (vida / 100), 8);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(px, py, 60, 8);
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
        ctx.save();
        ctx.translate(px, py);
        if (!jugador.flip) {
            ctx.scale(-1, 1);
        }
        // Personaje más grande
        ctx.drawImage(spriteSheet, 0, 0, 60, 60, -45, -90, 90, 90);
        ctx.restore();
        dibujarBarraVida(jugador.x, jugador.vida);
    }

    if (enemigo.vida > 0 && spriteSheet.complete) {
        const ex = enemigo.x * scaleX;
        const ey = obtenerAltura(ex);
        // Personaje más grande
        ctx.drawImage(spriteSheet, 65, 0, 60, 60, ex - 45, ey - 90, 90, 90);
        dibujarBarraVida(enemigo.x, enemigo.vida);

        // Indicador de ángulo del enemigo
        const dirE = enemigo.x < jugador.x ? 1 : -1;
        const radE = enemigo.angulo * Math.PI / 180;
        const txE = ex + dirE * Math.cos(radE) * 100;
        const tyE = ey - Math.sin(radE) * 100;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(ex, ey - 45);
        ctx.lineTo(txE, tyE);
        ctx.strokeStyle = '#ff5151';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#ff5151';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
        // Círculo en la punta
        ctx.save();
        ctx.beginPath();
        ctx.arc(txE, tyE, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff5151';
        ctx.shadowColor = '#ff5151';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.restore();
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#ff5151';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillText(`${Math.round(enemigo.angulo)}°`, txE + 15, tyE - 10);
        ctx.shadowBlur = 0;
    }

    const dir = jugador.flip ? -1 : 1;
    const rad = jugador.angulo * Math.PI / 180;
    const tx = px + dir * Math.cos(rad) * 100; // Mucho más largo para el cañón
    const ty = py - Math.sin(rad) * 100;

    // Indicador de ángulo estilizado
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(px, py - 45); // Ajuste para el nuevo tamaño
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = '#00e6ff'; // Color cian brillante
    ctx.lineWidth = 5;
    ctx.shadowColor = '#00e6ff';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();

    // Indicador de ángulo con círculo en la punta
    ctx.save();
    ctx.beginPath();
    ctx.arc(tx, ty, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#00e6ff';
    ctx.shadowColor = '#00e6ff';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.restore();

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#00e6ff';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 8;
    ctx.fillText(`${jugador.angulo}°`, tx + 15, ty - 10);
    ctx.shadowBlur = 0;
}

function mostrarImpactoCentral() {
    const impacto = document.createElement('div');
    impacto.textContent = '🔥 ¡IMPACTO! 🔥';
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
    if (jugador.vida <= 0) {
        setTimeout(() => {
            jugador.x = Math.floor(Math.random() * 100) + 10;
            jugador.vida = 100;
            dibujarEscena();
            turnoJugador = 2;
            disparoRealizado = false;
            enemigoActua();
        }, 1200);
    }
    if (enemigo.vida <= 0) {
        setTimeout(() => {
            enemigo.x = Math.floor(Math.random() * 100) + 120;
            enemigo.vida = 100;
            dibujarEscena();
            turnoJugador = 1;
            disparoRealizado = false;
            iniciarTimerTurno();
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
            mostrarImpactoCentral();
            let daño = 20;
            if (tipo === '2') daño = 35;
            if (tipo === 'SS') daño = 60;
            enemigo.vida = Math.max(0, enemigo.vida - daño);
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
    document.getElementById("angleDisplay").textContent = jugador.angulo;
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

const teclasPresionadas = {};
let movimientoInterval = null;

function procesarTeclas() {
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
}

document.addEventListener("keydown", (e) => {
    teclasPresionadas[e.key] = true;
    if (!movimientoInterval) {
        movimientoInterval = setInterval(procesarTeclas, 50);
    }
    if (e.key === " " && !cargando && !disparando && !disparoRealizado && turnoJugador === 1) {
        cargando = true;
        cargaPotencia = 0;
        const bar = document.getElementById("powerBar");
        cargaInterval = setInterval(() => {
            cargaPotencia = Math.min(100, cargaPotencia + 0.5);
            bar.style.width = cargaPotencia + "%";
        }, 20);
    }
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

window.actualizarBotones = function (tipoSeleccionado) {
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

document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        let currentIndex = window.tipos.indexOf(window.tipoBalaActual);
        window.tipoBalaActual = window.tipos[(currentIndex + 1) % window.tipos.length];
        window.actualizarBotones(window.tipoBalaActual);
    }
});

actualizarUI();
dibujarEscena();

// --- Timer de turnos ---
function iniciarTimerTurno() {
    if (gasolinaInterval) clearInterval(gasolinaInterval);
    gasolinaTimer = 20;
    if (turnoJugador === 1) {
        gasolina = 100;
        gasolinaBloqueada = false;
    }
    actualizarUI();
    gasolinaInterval = setInterval(() => {
        gasolinaTimer--;
        actualizarUI();
        if (gasolinaTimer <= 0) {
            clearInterval(gasolinaInterval);
            gasolinaInterval = null;
            if (turnoJugador === 1) {
                // Fin de turno jugador, pasa a enemigo
                turnoJugador = 2;
                gasolina = 100;
                setTimeout(() => {
                    enemigoActua();
                }, 800);
            } else {
                // Fin de turno enemigo, pasa a jugador
                turnoJugador = 1;
                gasolina = 100;
                gasolinaBloqueada = false;
            }
            iniciarTimerTurno();
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
            mostrarImpactoCentral();
            jugador.vida = Math.max(0, jugador.vida - 30);
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
