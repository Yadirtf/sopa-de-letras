import 'system_notifications_platform.dart' if (dart.library.js_interop) 'web_system_notifications.dart' as platform;

/// Avisos del sistema para invitaciones y solicitudes de amistad.
///
/// - Android: barra de notificaciones ([AndroidSystemNotifications]).
/// - Web: notificaciones del navegador ([WebSystemNotifications]), que salen
///   aunque WordHive esté en otra pestaña o la ventana minimizada.
abstract class SystemNotifications {
  /// Elige la implementación de la plataforma en la que corre la app.
  factory SystemNotifications() => platform.createSystemNotifications();

  /// ¿Esta plataforma puede mostrar avisos fuera de la app?
  bool get isSupported;

  /// Cómo reactivar los avisos si el usuario los bloqueó.
  String get deniedHint;

  /// Datos del aviso tocado mientras la app ya estaba abierta o en segundo plano.
  Stream<Map<String, dynamic>> get onTap;

  Future<void> init();

  /// Aviso que abrió la app desde cero (se entrega una sola vez).
  Map<String, dynamic>? takeLaunchPayload();

  Future<bool> areEnabled();

  /// Muestra el diálogo del sistema y devuelve si quedaron activados.
  Future<bool> requestPermission();

  /// Mismo `tag` que el push: si llegan ambos, el segundo reemplaza al primero.
  Future<void> show({required String title, required String body, required String tag, Map<String, dynamic>? data});
}
