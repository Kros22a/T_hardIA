// Funciones principales de la aplicación

// Cambiar tema
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    
    // Actualizar icono
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

// Cargar tema guardado
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
}

// Mostrar mensaje
function showMessage(type, message, elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `alert alert-${type}`;
        element.style.display = 'block';
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleTheme,
        loadSavedTheme,
        showMessage
    };
}
