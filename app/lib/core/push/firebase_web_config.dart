import 'dart:convert';
import 'package:firebase_core/firebase_core.dart';

/// Configuración de Firebase para los avisos push en el navegador.
///
/// Llega al compilar (`--dart-define`), igual que en el servidor de Render:
/// - `FIREBASE_WEB_CONFIG`: el objeto `firebaseConfig` de la consola de
///   Firebase (Configuración del proyecto › Tus apps › Web), como JSON o en
///   base64 (así lo pasa `tool/web/build_web.sh`, porque las comas del JSON
///   se llevan mal con `--dart-define`).
/// - `FIREBASE_VAPID_KEY`: Cloud Messaging › Certificados push web.
///
/// Sin ellas la web sigue avisando mientras esté abierta en una pestaña; solo
/// se pierden los avisos con el navegador cerrado.
abstract class FirebaseWebConfig {
  static const _rawConfig = String.fromEnvironment('FIREBASE_WEB_CONFIG');
  static const vapidKey = String.fromEnvironment('FIREBASE_VAPID_KEY');

  static bool get isConfigured => _rawConfig.isNotEmpty && vapidKey.isNotEmpty;

  static FirebaseOptions? get options {
    if (!isConfigured) return null;
    final raw = _rawConfig.trim();
    final text = raw.startsWith('{') ? raw : utf8.decode(base64.decode(raw));
    final json = Map<String, dynamic>.from(jsonDecode(text) as Map);
    return FirebaseOptions(
      apiKey: json['apiKey'] as String,
      appId: json['appId'] as String,
      messagingSenderId: json['messagingSenderId'] as String,
      projectId: json['projectId'] as String,
      authDomain: json['authDomain'] as String?,
      storageBucket: json['storageBucket'] as String?,
    );
  }
}
