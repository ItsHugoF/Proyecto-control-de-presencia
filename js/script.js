/********************************************
 * 1. REFERENCIAS AL DOM
 ********************************************/
const btnFichar         = document.getElementById('btnFichar');
const btnSalir          = document.getElementById('btnSalir');
const mensaje           = document.getElementById('mensaje');
const statusIcon        = document.getElementById('statusIcon');
const fechaHoraElemento = document.getElementById('fechaHora');
const cronometro        = document.getElementById('cronometro');

// Barra inferior
const btnIzquierda = document.getElementById('btnIzquierda');
const btnLoginForm = document.getElementById('btnLoginForm');
// Aquí usamos este botón como "Cerrar Sesión"
const btnDerecha   = document.getElementById('btnDerecha');

// Login
const loginSection     = document.getElementById('loginSection');
const loginForm        = document.getElementById('loginForm');
const btnCancelarLogin = document.getElementById('btnCancelarLogin');
const empresaInput     = document.getElementById('empresaInput');
const usuarioInput     = document.getElementById('usuarioInput');
const contraseñaInput  = document.getElementById('contraseñaInput');
const loginError       = document.getElementById('loginError');

// Array donde cargaremos usuarios desde JSON
let usuarios = [];

// Variables del cronómetro
let tiempoInicioFichado = null;
let intervaloCronometro = null;

/********************************************
 * 2. AL CARGAR LA PÁGINA
 ********************************************/
document.addEventListener('DOMContentLoaded', async () => {
  // 1) Cargar usuarios de JSON
  try {
    const response = await fetch('data/users.json');
    if (!response.ok) throw new Error('No se pudo cargar el archivo JSON');

    usuarios = await response.json();
    console.log('Usuarios cargados:', usuarios);
  } catch (error) {
    console.error('Error al cargar el archivo JSON:', error);
  }

  // 2) Verificar si hay sesión para habilitar "Fichar"
  verificarSesion();

  // 3) Reloj en tiempo real
  actualizarReloj();
  setInterval(actualizarReloj, 1000);

  // 4) Conexión -> color satélite
  actualizarIconoConexion();

  // 5) Si ya estabas fichado, reanuda el cronómetro
  reanudarCronometroSiFichado();
});

/********************************************
 * 3. SESIÓN
 ********************************************/
function estaLogueado() {
  return localStorage.getItem('loggedIn') === 'true';
}

function iniciarSesion(empresa, usuario, contraseña) {
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
  // Borra login
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('empresa');
  localStorage.removeItem('usuario');
  // Borra estado fichado
  localStorage.removeItem('isFichado');
  localStorage.removeItem('fichadoStart');

  // Llama a verificarSesion para deshabilitar "Fichar"
  verificarSesion();

  // Además, detenemos cronómetro si estuviera corriendo
  detenerCronometro();

  mensaje.textContent = "Has cerrado sesión.";
}

function verificarSesion() {
  // Si no hay sesión, deshabilitamos el botón "Fichar"
  if (estaLogueado()) {
    btnFichar.disabled = false;
  } else {
    btnFichar.disabled = true;
  }
}

/********************************************
 * 4. FICHADO (CRONÓMETRO PERSISTENTE)
 ********************************************/
function reanudarCronometroSiFichado() {
  const isFichado = localStorage.getItem('isFichado') === 'true';
  if (isFichado) {
    const fichadoStart = localStorage.getItem('fichadoStart');
    if (fichadoStart) {
      tiempoInicioFichado = parseInt(fichadoStart, 10);
      iniciarCronometroContinuo(); // Reanuda
    }
  }
}

function iniciarCronometro() {
  // Marcar isFichado en localStorage
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

  // Dejar de estar fichado
  localStorage.setItem('isFichado', 'false');
  localStorage.removeItem('fichadoStart');
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

/********************************************
 * 5. EVENTOS PRINCIPALES (FICHAR, SALIR)
 ********************************************/
btnFichar.addEventListener('click', () => {
  // 1) Verifica si estás logueado
  if (!estaLogueado()) {
    alert("Debes iniciar sesión antes de fichar.");
    return;
  }

  // 2) Inicia cronómetro (marca isFichado=true)
  iniciarCronometro();

  // 3) Geolocalización
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
  // Detiene el cronómetro pero NO cierra sesión
  detenerCronometro();
  mensaje.textContent = "Has salido (pero sigues logueado).";
});

/********************************************
 * 6. BARRA INFERIOR
 ********************************************/
// Botón izquierda sin funcionalidad real
btnIzquierda.addEventListener('click', () => {
  alert("Botón Izquierda (Opción 1) - Sin Funcionalidad");
});

// Botón derecha -> Cerrar sesión
btnDerecha.addEventListener('click', () => {
  // Llamamos a cerrarSesion()
  cerrarSesion();
});

// Mostrar/ocultar la sección de login
btnLoginForm.addEventListener('click', () => {
  loginSection.classList.toggle('oculto');
});

btnCancelarLogin.addEventListener('click', () => {
  loginSection.classList.add('oculto');
});

/********************************************
 * 7. LOGIN SUBMIT
 ********************************************/
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loginError.textContent = "";

  const empresa     = empresaInput.value.trim();
  const usuario     = usuarioInput.value.trim();
  const contraseña  = contraseñaInput.value.trim();

  if (iniciarSesion(empresa, usuario, contraseña)) {
    loginError.textContent = "Inicio de sesión correcto.";
    loginSection.classList.add('oculto');
    // Tras loguearse, habilitamos "Fichar"
    verificarSesion();
  } else {
    loginError.textContent = "Datos incorrectos.";
  }
});

/********************************************
 * 8. SATÉLITE (CONEXIÓN)
 ********************************************/
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
