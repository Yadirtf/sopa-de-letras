# web/

Landing page de WordHive y puerta de entrada a la **versión web del juego**.

- La landing (React + Vite) presenta el juego y enseña las sopas reales del catálogo.
- El juego completo es la app Flutter compilada para web y publicada en `/jugar/`
  del mismo sitio: cuenta, salas, amigos, avisos y partidas, igual que en Android.

## Comandos
- `npm run dev` — landing en http://localhost:5173 (el juego se puede apuntar con `VITE_PLAY_URL`).
- `npm run build` — solo la landing en `dist/`.
- `npm run build:site` — landing + juego (`dist/jugar/`), lo mismo que hace Render.
  Usa `app/tool/web/build_web.sh`, que descarga Flutter si no está instalado.

## Variables
- `VITE_API_URL` — API para el catálogo de la landing.
- `VITE_PLAY_URL` — dónde está el juego (por defecto `/jugar/`).
- `PLAY_URL`, `API_URL`, `SOCKET_URL`, `FIREBASE_WEB_CONFIG`, `FIREBASE_VAPID_KEY` — se pasan
  al compilar el juego (ver `app/tool/web/build_web.sh`).

## Arquitectura
- `src/components/` — una sección de la landing por archivo.
- `src/config/links.js` — enlaces hacia el juego.
- `src/services/` — lectura pública del API y sonidos de la sopa de prueba.
- `src/styles/` — variables, base y un CSS por sección.
