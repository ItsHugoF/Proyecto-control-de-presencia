/********************************************
 * 1. REFERENCIAS AL DOM
 ********************************************/
const btnFichar   = document.getElementById('btnFichar');
const btnSalir    = document.getElementById('btnSalir');
const mensaje     = document.getElementById('mensaje');
const statusIcon  = document.getElementById('statusIcon');
const fechaHora   = document.getElementById('fechaHora');
const cronometro  = document.getElementById('cronometro');

// Barra inferior
const btnIzquierda = document.getElementById('btnIzquierda');
const btnLoginForm = document.getElementById('btnLoginForm'); 
const btnDerecha   = document.getElementById('btnDerecha');

// Variables cronómetro
let tiempoInicioFichado = null;
let intervaloCronometro = null;

/********************************************
 * 2. Cuando Carga la Página
 ********************************************/
document.addEventListener('DOMContentLoaded', () => {
  //Si NO estás logueado, te redirje al login
  if (!estaLogueado()) {
    window.location.href = 'login.html';
    return;
  }

  actualizarReloj();
  setInterval(actualizarReloj, 1000);

  actualizarIconoConexion();

  reanudarCronometroSiFichado();
});

/********************************************
 * 3. COMPROBAR SESIÓN
 ********************************************/
function estaLogueado() {
  return localStorage.getItem('loggedIn') === 'true';
}

/********************************************
 * 4. CERRAR SESIÓN
 ********************************************/
function cerrarSesion() {
  // Borrar login
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('empresa');
  localStorage.removeItem('usuario');

  // Borrar estado de fichado
  localStorage.removeItem('isFichado');
  localStorage.removeItem('fichadoStart');

  // Redirige a login.html
  window.location.href = 'login.html';
}

/********************************************
 * 5. CRONÓMETRO
 ********************************************/
function reanudarCronometroSiFichado() {
  const isFichado = localStorage.getItem('isFichado') === 'true';
  if (isFichado) {
    const fichadoStart = localStorage.getItem('fichadoStart');
    if (fichadoStart) {
      tiempoInicioFichado = parseInt(fichadoStart, 10);
      iniciarCronometroContinuo();
    }
  }
}

function iniciarCronometro() {
  localStorage.setItem('isFichado', 'true');
  localStorage.setItem('fichadoStart', Date.now().toString());

  tiempoInicioFichado = Date.now();
  arrancarIntervaloCronometro();
}

function iniciarCronometroContinuo() {
  arrancarIntervaloCronometro();
}

function arrancarIntervaloCronometro() {
  clearInterval(intervaloCronometro);
  intervaloCronometro = setInterval(() => {
    const ahora = Date.now();
    const transcurrido = ahora - tiempoInicioFichado;
    cronometro.textContent = formatearTiempo(transcurrido);
  }, 1000);
}

function detenerCronometro() {
  clearInterval(intervaloCronometro);
  cronometro.textContent = '';

  localStorage.setItem('isFichado', 'false');
  localStorage.removeItem('fichadoStart');
}

function formatearTiempo(ms) {
  let totalSegundos = Math.floor(ms / 1000);
  let horas = Math.floor(totalSegundos / 3600);
  totalSegundos %= 3600;
  let minutos = Math.floor(totalSegundos / 60);
  let segundos = totalSegundos % 60;

  let hStr = horas.toString().padStart(2,'0');
  let mStr = minutos.toString().padStart(2,'0');
  let sStr = segundos.toString().padStart(2,'0');

  return `${hStr}:${mStr}:${sStr}`;
}

/********************************************
 * 6. RELOJ
 ********************************************/
function actualizarReloj() {
  const ahora = new Date();
  fechaHora.textContent = `Hoy es ${ahora.toLocaleDateString('es-ES')}, hora: ${ahora.toLocaleTimeString('es-ES')}`;
}

/********************************************
 * 7. CONEXIÓN (ICONO SATÉLITE)
 ********************************************/
function setIconoColor(color) {
  statusIcon.classList.remove('icono-verde','icono-amarillo','icono-rojo');
  statusIcon.classList.add(`icono-${color}`);
}

function actualizarIconoConexion() 
{
  if (!navigator.onLine) 
  {
    setIconoColor('rojo');
    return;
  }
  if (!navigator.connection || !navigator.connection.effectiveType) 
  {
    setIconoColor('verde');
    return;
  }
  const tipo = navigator.connection.effectiveType;
  switch (tipo) 
  {
    case '4g':
    case 'wifi':
      setIconoColor('verde');
      break;
    case '3g':
      setIconoColor('amarillo');
      break;
    case '2g':
    case 'slow-2g':
      setIconoColor('rojo');
      break;
    default:
      setIconoColor('amarillo');
      break;
  }
}
window.addEventListener('online', actualizarIconoConexion);
window.addEventListener('offline', actualizarIconoConexion);
if (navigator.connection) 
{
  navigator.connection.addEventListener('change', actualizarIconoConexion);
}

/********************************************
 * 8. EVENTOS BOTONES
 ********************************************/
btnFichar.addEventListener('click', () => {
  // Inicia cronómetro + geolocalización
  iniciarCronometro();

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
        mensaje.innerHTML = `
          <p>Estás fichando en:</p>
          <ul>
            <li>Latitud: <strong>${lat.toFixed(6)}</strong></li>
            <li>Longitud: <strong>${lon.toFixed(6)}</strong></li>
            <li>Precisión: ±${Math.round(accuracy)} metros</li>
          </ul>
          <a href="${mapsLink}" target="_blank">Ver ubicación en Google Maps</a>
        `;
      },
      (error) => {
        setIconoColor('rojo');
        mensaje.textContent = "Error al obtener ubicación: " + error.message;
      }
    );
  } else {
    mensaje.textContent = "La geolocalización no está soportada.";
    setIconoColor('rojo');
  }
});

btnSalir.addEventListener('click', () => {
  detenerCronometro();
  mensaje.textContent = "Has salido (pero sigues logueado).";
});

btnIzquierda.addEventListener('click', () => {
  alert("Opción 1 - Sin funcionalidad");
});

btnDerecha.addEventListener('click', () => {
  cerrarSesion();
});
