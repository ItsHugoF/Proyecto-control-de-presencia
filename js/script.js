const btnFichar = document.getElementById('btnFichar');
const btnSalir = document.getElementById('btnSalir');
const mensaje = document.getElementById('mensaje');

btnFichar.addEventListener('click', () => {
    if('geolocation' in navigator) 
    {
        navigator.geolocation.getCurrentPosition(
            (position) => 
            {
                const latitud = position.coords.latitude;
                const longitud = position.coords.longitude;
                const precision = position.coords.accuracy; 
                mensaje.textContent = `Estas fichando desde latitud: ${latitud}, longitud: ${longitud} (Precisión: ±${precision} metros)`;
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