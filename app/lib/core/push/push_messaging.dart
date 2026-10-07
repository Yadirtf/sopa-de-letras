import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'firebase_web_config.dart';

/// Envoltorio de Firebase Cloud Messaging, el único camino para avisar
/// cuando la app está cerrada del todo.
///
/// Firebase lee su configuración de `android/app/google-services.json` (en CI
/// llega desde el secreto `GOOGLE_SERVICES_JSON`). Si no existe, [init]
/// devuelve false y la app sigue funcionando: solo se pierden los avisos con
/// la app cerrada, los demás se muestran con el socket en tiempo real.
/// En el navegador la configuración llega con [FirebaseWebConfig].
class PushMessaging {
  bool _ready = false;

  bool get isReady => _ready;

  Future<bool> init() async {
    if (_ready) return true;
    if (kIsWeb ? !FirebaseWebConfig.isConfigured : defaultTargetPlatform != TargetPlatform.android) return false;
    try {
      if (Firebase.apps.isEmpty) await Firebase.initializeApp(options: kIsWeb ? FirebaseWebConfig.options : null);
      // En primer plano no pintamos el push: ya lo muestra el banner in-app.
      if (!kIsWeb) await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions();
      _ready = true;
    } catch (e) {
      debugPrint('[PushMessaging] Firebase no configurado, push desactivado: $e');
    }
    return _ready;
  }

  /// Token de este teléfono (o navegador) para que el backend le envíe avisos.
  /// En web pedir el token abre el diálogo de permiso, así que solo se pide
  /// cuando el usuario ya aceptó desde nuestra tarjeta.
  Future<String?> token() async {
    if (!_ready) return null;
    try {
      if (kIsWeb) {
        final settings = await FirebaseMessaging.instance.getNotificationSettings();
        if (settings.authorizationStatus != AuthorizationStatus.authorized) return null;
        return await FirebaseMessaging.instance.getToken(vapidKey: FirebaseWebConfig.vapidKey);
      }
      return await FirebaseMessaging.instance.getToken();
    } catch (e) {
      debugPrint('[PushMessaging] Sin token: $e');
      return null;
    }
  }

  Stream<String> get onTokenRefresh => _ready ? FirebaseMessaging.instance.onTokenRefresh : const Stream.empty();

  /// Datos del aviso tocado con la app en segundo plano.
  Stream<Map<String, dynamic>> get onOpened =>
      _ready ? FirebaseMessaging.onMessageOpenedApp.map((m) => m.data) : const Stream.empty();

  /// Datos del aviso que abrió la app estando cerrada.
  Future<Map<String, dynamic>?> takeLaunchData() async {
    if (!_ready) return null;
    try {
      return (await FirebaseMessaging.instance.getInitialMessage())?.data;
    } catch (_) {
      return null;
    }
  }
}
