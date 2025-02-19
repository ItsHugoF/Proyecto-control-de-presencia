const btnFichar = document.getElementById('btnFichar');
const btnSalir = document.getElementById('btnSalir');
const mensaje = document.getElementById('mensaje');
const statusIcon = document.getElementById('statusIcon');
const fechaHoraElemento = document.getElementById('fechaHora');
const cronometro = document.getElementById('cronometro');


//Función para cambiar el color
function setIconoColor(color) {
  statusIcon.classList.remove('icono-verde','icono-amarillo', 'icono-rojo');
  statusIcon.classList.add(`icono-${color}`);
}

//Reloj en tiempo real (fecha/hora)
function actualizarReloj(){
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString('es-ES');
  const hora = ahora.toLocaleTimeString('es-ES');
  fechaHoraElemento.textContent = `Hoy es ${fecha}, hora: ${hora}`;
}

actualizarReloj();
setInterval(actualizarReloj, 1000);

//Cronómetro al fichar
let tiempoInicioFichado = null;
let intervaloCronometro = null;

function iniciarCronometro(){
  tiempoInicioFichado = Date.now();
  clearInterval(intervaloCronometro);

  intervaloCronometro = setInterval(() => {
    const ahora = Date.now();
    const transcurrido = ahora- tiempoInicioFichado;
    cronometro.textContent = formatearTiempo(transcurrido);
  }, 1000);
}

function detenerCronometro(){
  clearInterval(intervaloCronometro);
  cronometro.textContent = '';
}

function formatearTiempo(ms){
  let totalSegundos = Math.floor(ms / 1000);
  let horas = Math.floor(totalSegundos / 3600);
  totalSegundos %= 3600;
  let minutos = Math.floor(totalSegundos / 60);
  let segundos = totalSegundos % 60;


  let horasStr = horas.toString().padStart(2,'0');
  let minutosStr = minutos.toString().padStart(2,'0');
  let segundosStr = horas.toString().padStart(2,'0');

  return `${horasStr}:${minutosStr}:${segundosStr}`
}



function actualizarIconoConexion(){
  if(!navigator.onLine){
    setIconoColor('rojo');
    return;
  }

  if(!navigator.connection || !navigator.connection.effectiveType){
    setIconoColor('verde');
    return;
  }

  const tipo = navigator.connection.effectiveType;
  switch(tipo){
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
if(navigator.connection){
  navigator.connection.addEventListener('change', actualizarIconoConexion);
}
document.addEventListener('DOMContentLoaded', actualizarIconoConexion);


btnFichar.addEventListener('click', () => {
  iniciarCronometro();
    if('geolocation' in navigator) 
    {
        navigator.geolocation.getCurrentPosition(
            (position) => 
            {
                const latitud = position.coords.latitude;
                const longitud = position.coords.longitude;
                const precision = position.coords.accuracy; 
                const mapsLink = `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`
                mensaje.innerHTML = `
                  <p>Estás fichando en:</p>
                  <ul>
                    <li>Latitud: <strong>${latitud.toFixed(6)}</strong></li>
                    <li>Longitud: <strong>${longitud.toFixed(6)}</strong></li>
                    <li>Precisión: +${Math.round(precision)} metros</li>
                  </ul>
                  <a href="${mapsLink}" target="_blank">Ver ubicación en Google Maps</a>
                `;
            },
            (error) => 
            {
                switch (error.code) 
                {
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
    } else 
    {
        mensaje.textContent = "La geolocalización no está soportada en este navegador.";
        setIconoColor('rojo');
    }
});


btnSalir.addEventListener('click', () => {
  detenerCronometro();
    mensaje.textContent = "Has salido";
})