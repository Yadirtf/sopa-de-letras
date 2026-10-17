/// Enlaces públicos de WordHive: la versión web vive en `/jugar` de la landing.
abstract class AppLinks {
  static const String playUrl = String.fromEnvironment(
    'PLAY_URL',
    defaultValue: 'https://wordhive-landing.onrender.com/jugar',
  );

  /// Enlace de invitación a una sala: abre la web y entra directo al lobby.
  static String room(String code) => '$playUrl/room/${code.toUpperCase()}';

  /// Texto listo para pegar en WhatsApp o en un correo.
  static String roomInvite(String code) =>
      '¡Juega conmigo en WordHive! Entra con el código ${code.toUpperCase()} o en ${room(code)}';

  /// Enlace a una sala de La Batalla Más Temida.
  static String battle(String code) => '$playUrl/batalla/${code.toUpperCase()}';

  static String battleInvite(String code) =>
      '¡Te reto a La Batalla Más Temida en WordHive! Entra con el código ${code.toUpperCase()} o en ${battle(code)}';
}
