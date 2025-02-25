const loginForm        = document.getElementById('loginForm');
const empresaInput     = document.getElementById('empresaInput');
const usuarioInput     = document.getElementById('usuarioInput');
const contraseñaInput  = document.getElementById('contraseñaInput');
const loginError       = document.getElementById('loginError');

let usuarios = [];

document.addEventListener('DOMContentLoaded', async () => {
    try
    {
        const response = await fetch('data/users.json');
        if(!response.ok) throw new Error('No se pudo cargar users.json');

        usuarios = await response.json();
        console.log("Usuarios cargados:", usuarios);        
    }catch (err)
    {
        console.log('Error al cargar el JSON:', err);
        loginError.textContent = "Error cargando los datos de los usuarios";
    }
})

function iniciarSesion(empresa, usuario, contraseña)
{
    const encontrado = usuarios.find(u => 
        u.empresa === empresa &&
        u.usuario === usuario &&
        u.contraseña === contraseña
    );
    if(encontrado)
    {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('empresa', empresa);
        localStorage.setItem('usuario', usuario);
        return true;
    }
    return false;
}

loginForm.addEventListener('submit', (e) =>{
    e.preventDefault();
    loginError.textContent = "";

    const empresa     = empresaInput.value.trim();
    const usuario     = usuarioInput.value.trim();
    const contraseña  = contraseñaInput.value.trim();

    if(iniciarSesion(empresa, usuario, contraseña))
    {
        window.location.href = 'index.html';
    }
    else
    {
        loginError.textContent = "Datos incorrectos";
    }
});