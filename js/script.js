// ==========================
// 1. Referencias al DOM
// ==========================
const btnFichar         = document.getElementById('btnFichar');
const btnSalir          = document.getElementById('btnSalir');
const mensaje           = document.getElementById('mensaje');
const statusIcon        = document.getElementById('statusIcon');
const fechaHoraElemento = document.getElementById('fechaHora');
const cronometro        = document.getElementById('cronometro');

// Barra inferior
const btnIzquierda    = document.getElementById('btnIzquierda');
const btnLoginForm    = document.getElementById('btnLoginForm');
const btnDerecha      = document.getElementById('btnDerecha');

// Login
const loginSection       = document.getElementById('loginSection');
const loginForm          = document.getElementById('loginForm');
const btnCancelarLogin   = document.getElementById('btnCancelarLogin');

const empresaInput       = document.getElementById('empresaInput');
const usuarioInput       = document.getElementById('usuarioInput');
const contraseñaInput    = document.getElementById('contraseñaInput');
const loginError         = document.getElementById('loginError');

// Array donde cargaremos usuarios desde JSON
let usuarios = [];

// Variables del cronómetro
let tiempoInicioFichado  = null;
let intervaloCronometro  = null;


// =============================
// 2. Carga de JSON y setup inicial
// =============================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Carga de users.json (asegúrate de que la ruta sea correcta)
    const response = await fetch('data/users.json');
    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo JSON');
    }

    usuarios = await response.json();
    console.log('Usuarios cargados:', usuarios);

    // Verificamos sesión (habilitar o no el botón Fichar)
    verificarSesion();

  } catch (error) {
    console.error('Error al cargar el archivo JSON:', error);
  }

  // Reloj en tiempo real
  actualizarReloj();
  setInterval(actualizarReloj, 1000);

  // Icono de conexión
  actualizarIconoConexion();

  reanudarCronometroSiFichado();
});


function reanudarCronometroSiFichado()
{
  const isFichado = localStorage.getItem('isFichado') === 'true';
  if(isFichado)
  {
    const fichadoStart = localStorage.getItem('fichadoStart');
    if(fichadoStart)
    {
      tiempoInicioFichado = parseInt(fichadoStart,10);
      iniciarCronometroContinuo();
    }
  }
}


// =============================
// 3. Funciones de sesión
// =============================
function estaLogueado() {
  return localStorage.getItem('loggedIn') === 'true';
}

function iniciarSesion(empresa, usuario, contraseña) {
  // Buscamos en el array usuarios
  const encontrado = usuarios.find(u =>
    u.empresa === empresa &&
    u.usuario === usuario &&
    u.contraseña === contraseña
  );
  if (encontrado) {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('empresa', empresa);
    localStorage.setItem('usuario', usuario);
    return true;
  }
  return false;
}

function cerrarSesion() {
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('empresa');
  localStorage.removeItem('usuario');
}

function verificarSesion() {
  // habilitar/deshabilitar Fichar
  if (estaLogueado()) {
    btnFichar.disabled = false;
  } else {
    btnFichar.disabled = true;
  }
}


// =============================
// 4. Reloj en tiempo real
// =============================
function actualizarReloj() {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString('es-ES');
  const hora = ahora.toLocaleTimeString('es-ES');
  fechaHoraElemento.textContent = `Hoy es ${fecha}, hora: ${hora}`;
}


// =============================
// 5. Cronómetro
// =============================
function iniciarCronometro() {
  tiempoInicioFichado = Date.now();
  clearInterval(intervaloCronometro);

  intervaloCronometro = setInterval(() => {
    const ahora = Date.now();
    const transcurrido = ahora - tiempoInicioFichado;
    cronometro.textContent = formatearTiempo(transcurrido);
  }, 1000);
}

function iniciarCronometroContinuo()
{
  arrancarIntervaloCronometro(); 
}

function arrancarIntervaloCronometro()
{
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
}

function formatearTiempo(ms) {
  let totalSegundos = Math.floor(ms / 1000);
  let horas = Math.floor(totalSegundos / 3600);
  totalSegundos %= 3600;
  let minutos = Math.floor(totalSegundos / 60);
  let segundos = totalSegundos % 60;

  let horasStr = horas.toString().padStart(2, '0');
  let minutosStr = minutos.toString().padStart(2, '0');
  let segundosStr = segundos.toString().padStart(2, '0');

  return `${horasStr}:${minutosStr}:${segundosStr}`;
}

function cerrarSesion(){
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('empresa');
  localStorage.removeItem('usuario');
  //Ahora quitamos el estado de fichado
  localStorage.removeItem('isFichado');
  localStorage.removeItem('fichadoStart');

  verificarSesion();
  detenerCronometro();

  mensaje.textContent = "Has cerrado sesión.";
}


// =============================
// 6. Conexión (icono de satélite)
// =============================
function setIconoColor(color) {
  statusIcon.classList.remove('icono-verde','icono-amarillo','icono-rojo');
  statusIcon.classList.add(`icono-${color}`);
}

function actualizarIconoConexion() {
  if (!navigator.onLine) {
    setIconoColor('rojo');
    return;
  }
  if (!navigator.connection || !navigator.connection.effectiveType) {
    setIconoColor('verde');
    return;
  }
  const tipo = navigator.connection.effectiveType;
  switch (tipo) {
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
if (navigator.connection) {
  navigator.connection.addEventListener('change', actualizarIconoConexion);
}


// =============================
// 7. Eventos de Botones Principales
// =============================
btnFichar.addEventListener('click', () => {
  iniciarCronometro();
  // Geolocalización
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy;
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
        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensaje.textContent = "Has denegado el permiso de ubicación.";
            break;
          case error.POSITION_UNAVAILABLE:
            mensaje.textContent = "Información de ubicación no disponible.";
            break;
          case error.TIMEOUT:
            mensaje.textContent = "La solicitud de ubicación ha caducado.";
            break;
          default:
            mensaje.textContent = "Ha ocurrido un error desconocido al obtener la ubicación.";
            break;
        }
      }
    );
  } else {
    mensaje.textContent = "La geolocalización no está soportada en este navegador.";
    setIconoColor('rojo');
  }
});

btnSalir.addEventListener('click', () => {
  detenerCronometro();
  mensaje.textContent = "Has salido";
});

// =============================
// 8. Barra Inferior
// =============================
btnIzquierda.addEventListener('click', () => {
  alert("Botón Izquierda (Opción 1) - Sin Funcionalidad");
});
btnDerecha.addEventListener('click', () => {
  cerrarSesion();
});

// Botón que muestra/oculta el login
btnLoginForm.addEventListener('click', () => {
  loginSection.classList.toggle('oculto');
});

btnCancelarLogin.addEventListener('click', () => {
  loginSection.classList.add('oculto');
});

// =============================
// 9. Evento Submit de Login
// =============================
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loginError.textContent = "";

  const empresa     = empresaInput.value.trim();
  const usuario     = usuarioInput.value.trim();
  const contraseña  = contraseñaInput.value.trim();

  if (iniciarSesion(empresa, usuario, contraseña)) {
    loginError.textContent = "Inicio de sesión correcto.";
    loginSection.classList.add('oculto');
    verificarSesion();
  } else {
    loginError.textContent = "Datos incorrectos.";
  }
});
