const btnFichar = document.getElementById('btnFichar');
const btnSalir = document.getElementById('btnSalir');
const mensaje = document.getElementById('mensaje');
const statusIcon = document.getElementById('statusIcon');

function setSatelliteIcon(color) {
  statusIcon.src = `3_${color}.webp.jpg`;
}

btnFichar.addEventListener('click', () => {
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
                if (precision < 50) {
                  setSatelliteIcon('verde');
                } else if (precision < 500) {
                  setSatelliteIcon('amarillo');
                } else {
                  setSatelliteIcon('rojo');
                }
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
    }
});


btnSalir.addEventListener('click', () => {
    mensaje.textContent = "Has salido";
})