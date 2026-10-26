
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

let bloqueado =
    localStorage.getItem(CLAVE_BLOQUEADO) === "true";

let intentos = Number(
    localStorage.getItem(CLAVE_INTENTOS) || "0"
);

// Mostrar u ocultar contraseña
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

// Mostrar mensajes
function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
}

// Actualizar contador visual
function actualizarIntentos() {
    const disponibles = Math.max(0, MAX_INTENTOS - intentos);

    barras.forEach((barra, indice) => {
        barra.classList.toggle("used", indice < intentos);
    });

    if (bloqueado) {
        intentosTexto.textContent = "Acceso bloqueado";
    } else {
        intentosTexto.textContent =
            `${disponibles} de ${MAX_INTENTOS} intentos disponibles`;
    }
}

// Bloquear el formulario
function bloquearAcceso() {
    bloqueado = true;

    localStorage.setItem(CLAVE_BLOQUEADO, "true");
    localStorage.setItem(CLAVE_INTENTOS, String(MAX_INTENTOS));

    usuario.disabled = true;
    password.disabled = true;
    mostrarPassword.disabled = true;
    btnLogin.disabled = true;

    btnLogin.innerHTML = "<span>Acceso bloqueado</span> <span>🔒</span>";

    actualizarIntentos();

    mostrarMensaje(
        "Has agotado los 3 intentos permitidos. El acceso está bloqueado.",
        "error"
    );
}

// Registrar intento fallido
function registrarError() {
    intentos++;

    localStorage.setItem(CLAVE_INTENTOS, String(intentos));

    if (intentos >= MAX_INTENTOS) {
        bloquearAcceso();
        return;
    }

    actualizarIntentos();

    const restantes = MAX_INTENTOS - intentos;

    mostrarMensaje(
        `Usuario o contraseña incorrectos. Intento ${intentos} de ${MAX_INTENTOS}. Te quedan ${restantes}.`,
        "error"
    );

    password.value = "";
    password.focus();
}

// Comprobar si ya estaba bloqueado
if (bloqueado || intentos >= MAX_INTENTOS) {
    bloquearAcceso();
} else {
    actualizarIntentos();
}

// Validar inicio de sesión
formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    if (bloqueado) {
        bloquearAcceso();
        return;
    }

    const usuarioIngresado = usuario.value.trim();
    const passwordIngresada = password.value;

    if (!usuarioIngresado || !passwordIngresada.trim()) {
        mostrarMensaje(
            "Completa el usuario y la contraseña.",
            "error"
        );
        return;
    }

    // Credenciales de demostración.
    // En producción, deben validarse en el backend Java.
    if (
        usuarioIngresado === "admin" &&
        passwordIngresada === "123456"
    ) {
        // Restablecer los intentos tras el acceso correcto
        localStorage.removeItem(CLAVE_INTENTOS);
        localStorage.removeItem(CLAVE_BLOQUEADO);

        mostrarMensaje(
            "Inicio de sesión correcto. Redirigiendo...",
            "success"
        );

        btnLogin.disabled = true;
        btnLogin.innerHTML = "<span>Acceso correcto ✓</span>";

        setTimeout(() => {
            window.location.href = "panel.html";
        }, 800);

    } else {
        registrarError();
    }
});
