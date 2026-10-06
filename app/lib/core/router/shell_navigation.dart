import 'app_router.dart';

/// Rutas que viven dentro del marco con barras (arriba y abajo).
const shellLocations = {
  '/join-room',
  '/my-creations',
  '/home',
  '/create-word-search',
  '/profile',
  '/friends',
  '/notifications',
};

/// Abre una pantalla del marco desde cualquier sitio.
///
/// Dentro del marco se cambia de pestaña con `go` (un `push` entre pestañas
/// deja la barra marcando la pestaña equivocada). Desde la sala o la partida
/// se hace `push`, para que "atrás" devuelva al jugador a su juego.
void openShellLocation(String location, {Object? extra}) {
  final current = appRouter.routerDelegate.currentConfiguration.uri.path;
  if (shellLocations.contains(current)) {
    appRouter.go(location, extra: extra);
  } else {
    appRouter.push(location, extra: extra);
  }
}
