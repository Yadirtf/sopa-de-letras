// Service worker de avisos push de WordHive en el navegador (lo genera
// tool/web/build_web.sh con FIREBASE_WEB_CONFIG). Con la pestaña cerrada,
// Firebase muestra el aviso y al hacer clic abre el enlace que manda el
// backend (la sala de la invitación, Amigos o la bandeja de avisos).
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp(__FIREBASE_WEB_CONFIG__);
firebase.messaging();
