// Funciones de autenticación con Firebase

// Registrar usuario
function registerUser(email, password, name) {
    return firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Actualizar nombre de usuario
            return userCredential.user.updateProfile({
                displayName: name
            }).then(() => {
                return userCredential;
            });
        });
}

// Iniciar sesión
function loginUser(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
}

// Cerrar sesión
function logoutUser() {
    return firebase.auth().signOut();
}

// Verificar estado de autenticación
function onAuthStateChanged(callback) {
    firebase.auth().onAuthStateChanged(callback);
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerUser,
        loginUser,
        logoutUser,
        onAuthStateChanged
    };
}
