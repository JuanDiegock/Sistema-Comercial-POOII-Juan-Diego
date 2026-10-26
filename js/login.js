
const formulario = document.getElementById("loginForm");
const usuario = document.getElementById("usuario");
const password = document.getElementById("password");
const mensaje = document.getElementById("mensaje");
const mostrarPassword = document.getElementById("mostrarPassword");
const btnLogin = document.getElementById("btnLogin");
const intentosTexto = document.getElementById("intentosTexto");
const barras = document.querySelectorAll(".attempt-bar");

const MAX_INTENTOS = 3;
const CLAVE_INTENTOS = "acceso_intentos";
const CLAVE_BLOQUEADO = "acceso_bloqueado";
const CLAVE_USUARIOS = "sistema_comercial_usuarios_demo";

let intentos = Number(localStorage.getItem(CLAVE_INTENTOS) || "0");
let bloqueado =
    localStorage.getItem(CLAVE_BLOQUEADO) === "true" ||
    intentos >= MAX_INTENTOS;

mostrarPassword.addEventListener("click", () => {
    const mostrar = password.type === "password";

    password.type = mostrar ? "text" : "password";
    mostrarPassword.textContent = mostrar ? "🙈" : "👁";
    mostrarPassword.setAttribute("aria-pressed", String(mostrar));
    mostrarPassword.setAttribute(
        "aria-label",
        mostrar ? "Ocultar contraseña" : "Mostrar contraseña"
    );
});

function mostrarMensaje(texto, tipo = "error") {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
}

function actualizarIntentos() {
    const disponibles = Math.max(0, MAX_INTENTOS - intentos);

    barras.forEach((barra, indice) => {
        barra.classList.toggle("used", indice < intentos);
    });

    intentosTexto.textContent = bloqueado
        ? "Acceso bloqueado"
        : `${disponibles} de ${MAX_INTENTOS} intentos disponibles`;
}

function bloquearAcceso() {
    bloqueado = true;
    localStorage.setItem(CLAVE_BLOQUEADO, "true");
    localStorage.setItem(CLAVE_INTENTOS, String(MAX_INTENTOS));

    usuario.disabled = true;
    password.disabled = true;
    mostrarPassword.disabled = true;
    btnLogin.disabled = true;

    btnLogin.innerHTML = "<span>Acceso bloqueado</span><span>🔒</span>";
    actualizarIntentos();

    mostrarMensaje(
        "Has agotado los 3 intentos permitidos. El acceso está bloqueado.",
        "error"
    );
}

function registrarError() {
    intentos++;
    localStorage.setItem(CLAVE_INTENTOS, String(intentos));

    if (intentos >= MAX_INTENTOS) {
        bloquearAcceso();
        return;
    }

    actualizarIntentos();

    mostrarMensaje(
        `Usuario o contraseña incorrectos. Te quedan ${MAX_INTENTOS - intentos} intentos.`,
        "error"
    );

    password.value = "";
    password.focus();
}

function obtenerUsuarios() {
    try {
        const datos = JSON.parse(
            localStorage.getItem(CLAVE_USUARIOS) || "[]"
        );
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function validarCredenciales(usuarioIngresado, passwordIngresada) {
    // Cuenta de demostración inicial
    if (
        usuarioIngresado.toLowerCase() === "admin" &&
        passwordIngresada === "123456"
    ) {
        return {
            usuario: "admin",
            nombre: "Administrador",
            rol: "Administrador"
        };
    }

    // Usuarios creados desde Gestión de usuarios
    const usuariosRegistrados = obtenerUsuarios();

    const encontrado = usuariosRegistrados.find(u =>
        String(u.usuario).toLowerCase() === usuarioIngresado.toLowerCase() &&
        u.password === passwordIngresada
    );

    return encontrado || null;
}

if (bloqueado) {
    bloquearAcceso();
} else {
    actualizarIntentos();
}

formulario.addEventListener("submit", event => {
    event.preventDefault();

    if (bloqueado) {
        bloquearAcceso();
        return;
    }

    const usuarioIngresado = usuario.value.trim();
    const passwordIngresada = password.value;

    if (!usuarioIngresado || !passwordIngresada) {
        mostrarMensaje("Completa el usuario y la contraseña.", "error");
        return;
    }

    const usuarioValidado = validarCredenciales(
        usuarioIngresado,
        passwordIngresada
    );

    if (!usuarioValidado) {
        registrarError();
        return;
    }

    // Reiniciar los intentos cuando el acceso es correcto
    localStorage.removeItem(CLAVE_INTENTOS);
    localStorage.removeItem(CLAVE_BLOQUEADO);

    mostrarMensaje("Inicio de sesión correcto. Redirigiendo...", "success");

    btnLogin.disabled = true;
    btnLogin.innerHTML = "<span>Acceso correcto ✓</span>";

    // Guardar solo información de la sesión, no la contraseña
    sessionStorage.setItem(
        "sesion_usuario",
        JSON.stringify({
            usuario: usuarioValidado.usuario,
            nombre: usuarioValidado.nombre,
            rol: usuarioValidado.rol
        })
    );

    setTimeout(() => {
        window.location.href = "panel.html";
    }, 800);
});
