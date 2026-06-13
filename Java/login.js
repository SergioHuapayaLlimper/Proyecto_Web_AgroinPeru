/* ══════════════════════════════════════════════════════════════
   login.js — AgroinPeru S.A.C.
   RF2: Validación de campos antes de procesar el login
   RF3: Mensaje de error cuando las credenciales sean incorrectas
   RF4: Bloqueo temporal tras 5 intentos fallidos
   Se conecta al form existente: action="/auth" method="post"
══════════════════════════════════════════════════════════════ */

/* ─── CONSTANTES ─────────────────────────────────────────── */
const MAX_ATTEMPTS = 5;
const LOCK_SECS    = 30;
const RE_EMAIL     = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ─── ESTADO ─────────────────────────────────────────────── */
let failedAttempts = 0;
let isLocked       = false;
let lockInterval   = null;

/* ══════════════════════════════════════════════════════════
   INYECTAR ESTILOS DE TOASTS EN EL <head>
   (Para no modificar el HTML ni el CSS existente)
══════════════════════════════════════════════════════════ */
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    #toastContainer {
        position: fixed;
        top: 1.25rem;
        right: 1.25rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: .6rem;
        max-width: 330px;
        width: calc(100% - 2.5rem);
    }
    .ag-toast {
        display: flex;
        align-items: flex-start;
        gap: .75rem;
        padding: .85rem 1rem;
        border-radius: 12px;
        border-left: 4px solid transparent;
        box-shadow: 0 8px 28px rgba(0,0,0,.18);
        font-size: .84rem;
        line-height: 1.45;
        animation: agToastIn .35s cubic-bezier(.34,1.56,.64,1) both;
        position: relative;
        overflow: hidden;
        cursor: pointer;
    }
    .ag-toast::after {
        content: '';
        position: absolute;
        bottom: 0; left: 0;
        height: 3px;
        animation: agToastBar 4s linear forwards;
    }
    .ag-toast.removing {
        animation: agToastOut .3s ease forwards;
    }

    /* Variantes */
    .ag-toast-error   { background:#fff5f5; border-color:#ef4444; color:#991b1b; }
    .ag-toast-error   .ag-toast-icon { color:#ef4444; }
    .ag-toast-error::after   { background:#ef4444; width:100%; }

    .ag-toast-warning { background:#fffbeb; border-color:#f59e0b; color:#92400e; }
    .ag-toast-warning .ag-toast-icon { color:#f59e0b; }
    .ag-toast-warning::after { background:#f59e0b; width:100%; }

    .ag-toast-success { background:#f0fdf4; border-color:#22c55e; color:#14532d; }
    .ag-toast-success .ag-toast-icon { color:#22c55e; }
    .ag-toast-success::after { background:#22c55e; width:100%; }

    .ag-toast-icon  { font-size:1.1rem; flex-shrink:0; margin-top:1px; }
    .ag-toast-body  { flex:1; }
    .ag-toast-body strong { display:block; margin-bottom:.15rem; font-size:.86rem; }
    .ag-toast-body span   { opacity:.85; }
    .ag-toast-close {
        background:none; border:none; cursor:pointer;
        color:inherit; opacity:.45; font-size:.8rem;
        padding:0; flex-shrink:0; margin-top:1px;
        transition:opacity .2s;
    }
    .ag-toast-close:hover { opacity:1; }

    /* Puntos de intentos fallidos */
    #attemptDots {
        display: none;
        justify-content: center;
        gap: 7px;
        margin-top: .75rem;
    }
    #attemptDots.visible { display: flex; }
    .ag-dot {
        width: 10px; height: 10px;
        border-radius: 50%;
        background: #dee2e6;
        transition: background .3s, transform .3s;
    }
    .ag-dot.used { background: #ef4444; transform: scale(1.2); }

    @keyframes agToastIn {
        from { opacity:0; transform:translateX(60px) scale(.95); }
        to   { opacity:1; transform:translateX(0) scale(1); }
    }
    @keyframes agToastOut {
        to { opacity:0; transform:translateX(60px) scale(.9);
             max-height:0; padding:0; margin:0; border:none; }
    }
    @keyframes agToastBar {
        from { width:100%; }
        to   { width:0%; }
    }
`;
document.head.appendChild(toastStyles);

/* ══════════════════════════════════════════════════════════
   INYECTAR CONTENEDOR DE TOASTS Y DOTS EN EL <body>
══════════════════════════════════════════════════════════ */
const toastContainer = document.createElement('div');
toastContainer.id = 'toastContainer';
document.body.appendChild(toastContainer);

// Dots: se insertan debajo del botón submit dentro del form
window.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.querySelector('input[type="submit"]');
    if (submitBtn) {
        const dots = document.createElement('div');
        dots.id = 'attemptDots';
        dots.innerHTML = `
            <div class="ag-dot" id="d1"></div>
            <div class="ag-dot" id="d2"></div>
            <div class="ag-dot" id="d3"></div>
            <div class="ag-dot" id="d4"></div>
            <div class="ag-dot" id="d5"></div>
        `;
        submitBtn.insertAdjacentElement('afterend', dots);
    }
});

/* ══════════════════════════════════════════════════════════
   SISTEMA DE TOASTS
══════════════════════════════════════════════════════════ */
const ICONS = {
    error:   'fa-solid fa-circle-xmark',
    warning: 'fa-solid fa-triangle-exclamation',
    success: 'fa-solid fa-circle-check'
};
const TITLES = {
    error:   'Error',
    warning: 'Advertencia',
    success: '¡Éxito!'
};

function showToast(type, title, message, duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `ag-toast ag-toast-${type}`;
    toast.innerHTML = `
        <i class="ag-toast-icon ${ICONS[type]}"></i>
        <div class="ag-toast-body">
            <strong>${title || TITLES[type]}</strong>
            <span>${message}</span>
        </div>
        <button class="ag-toast-close" title="Cerrar">&#x2715;</button>
    `;
    toastContainer.appendChild(toast);

    toast.querySelector('.ag-toast-close')
         .addEventListener('click', () => removeToast(toast));
    toast.addEventListener('click', e => {
        if (!e.target.closest('.ag-toast-close')) removeToast(toast);
    });

    if (duration > 0) setTimeout(() => removeToast(toast), duration);
    return toast;
}

function removeToast(toast) {
    if (toast.classList.contains('removing')) return;
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
function updateDots() {
    const dotsWrap = document.getElementById('attemptDots');
    if (!dotsWrap) return;
    dotsWrap.classList.toggle('visible', failedAttempts > 0);
    ['d1','d2','d3','d4','d5'].forEach((id, i) => {
        const d = document.getElementById(id);
        if (d) d.classList.toggle('used', i < failedAttempts);
    });
}

/* ══════════════════════════════════════════════════════════
   RF4 — BLOQUEO TEMPORAL
══════════════════════════════════════════════════════════ */
function lockForm() {
    isLocked = true;
    const btn = document.querySelector('input[type="submit"]');
    if (btn) btn.disabled = true;

    let secs = LOCK_SECS;
    const lockToast = showToast(
        'warning',
        'Cuenta bloqueada temporalmente',
        `Demasiados intentos fallidos. Espera <strong id="cdSecs">${secs}s</strong> para continuar.`,
        0   // no se cierra solo
    );

    lockInterval = setInterval(() => {
        secs--;
        const el = document.getElementById('cdSecs');
        if (el) el.textContent = `${secs}s`;

        if (secs <= 0) {
            clearInterval(lockInterval);
            isLocked       = false;
            failedAttempts = 0;
            updateDots();
            if (btn) btn.disabled = false;
            removeToast(lockToast);
            showToast('success', 'Desbloqueado', 'Ya puedes intentar iniciar sesión nuevamente.');
        }
    }, 1000);
}

/* ══════════════════════════════════════════════════════════
   RF2 — VALIDACIÓN + RF3 — ERRORES: interceptar el submit
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    const form     = document.querySelector('form[action="/auth"]');
    const emailEl  = document.querySelector('input[name="email"]');
    const passEl   = document.querySelector('input[name="password"]');

    if (!form || !emailEl || !passEl) return;

    /* Validación en tiempo real mientras escribe */
    emailEl.addEventListener('input', () => {
        const v = emailEl.value.trim();
        if (v && !RE_EMAIL.test(v)) {
            emailEl.style.borderColor = '#ef4444';
        } else {
            emailEl.style.borderColor = '';
        }
    });

    passEl.addEventListener('input', () => {
        if (passEl.value.length > 0 && passEl.value.length < 6) {
            passEl.style.borderColor = '#ef4444';
        } else {
            passEl.style.borderColor = '';
        }
    });

    /* Interceptar submit */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        /* Bloqueado */
        if (isLocked) {
            showToast('warning', 'Cuenta bloqueada', 'Espera a que termine el tiempo de bloqueo.');
            return;
        }

        const email    = emailEl.value.trim();
        const password = passEl.value;

        /* ── RF2: Validación de campos ── */
        let valid = true;

        if (!email) {
            emailEl.style.borderColor = '#ef4444';
            showToast('error', 'Campo requerido', 'Debes ingresar tu correo electrónico.');
            valid = false;
        } else if (!RE_EMAIL.test(email)) {
            emailEl.style.borderColor = '#ef4444';
            showToast('error', 'Correo inválido', 'Ingresa un correo con formato correcto: <strong>nombre@dominio.com</strong>');
            valid = false;
        }

        if (!password) {
            passEl.style.borderColor = '#ef4444';
            showToast('error', 'Campo requerido', 'Debes ingresar tu contraseña.');
            valid = false;
        } else if (password.length < 6) {
            passEl.style.borderColor = '#ef4444';
            showToast('error', 'Contraseña muy corta',
                `Tu contraseña tiene <strong>${password.length}</strong> caracteres. Mínimo <strong>6</strong>.`);
            valid = false;
        }

        if (!valid) return;

        /* ── Enviar al backend (app.js) ── */
        emailEl.style.borderColor = '';
        passEl.style.borderColor  = '';

        try {
            const resp = await fetch('/auth', {
                method:   'POST',
                headers:  { 'Content-Type': 'application/x-www-form-urlencoded' },
                body:     `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
                redirect: 'manual'
            });

            /* RF5: Login exitoso → Express redirige según el rol */
            if (resp.type === 'opaqueredirect' || resp.status === 302) {
                showToast('success', '¡Bienvenido!', 'Redirigiendo a tu panel…', 2000);
                failedAttempts = 0;
                updateDots();
                setTimeout(() => window.location.href = resp.url || '/', 800);
                return;
            }

            /* ── RF3: Credenciales incorrectas ── */
            const text = await resp.text();
            failedAttempts++;
            updateDots();

            const remaining = MAX_ATTEMPTS - failedAttempts;

            emailEl.style.borderColor = '#ef4444';
            passEl.style.borderColor  = '#ef4444';

            let msg = 'El correo o la contraseña no son correctos.';
            if (remaining > 0) {
                msg += ` Te ${remaining === 1 ? 'queda' : 'quedan'} <strong>${remaining}</strong> intento${remaining !== 1 ? 's' : ''}.`;
            }

            if (text.toLowerCase().includes('inactiv')) {
                showToast('warning', 'Cuenta inactiva',
                    'Tu cuenta está deshabilitada. Contacta al administrador.', 6000);
            } else {
                showToast('error', 'Credenciales incorrectas', msg, 5000);
            }

            /* RF4: Bloquear si llegó al límite */
            if (failedAttempts >= MAX_ATTEMPTS) lockForm();

        } catch (_) {
            /* Express redirigió automáticamente → el fetch lanza TypeError, dejamos pasar */
        }
    });
});
