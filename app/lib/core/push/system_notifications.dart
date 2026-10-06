import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Barra de notificaciones de Android: canal, permiso, avisos locales y toques.
///
/// El canal `wordhive_social` es el mismo que usa el backend al enviar por
/// FCM, así los avisos llegan con importancia alta (aparecen arriba como
/// burbuja) y el usuario puede silenciarlos desde Ajustes sin perder el resto.
class SystemNotifications {
  static const channelId = 'wordhive_social';
  static const _channel = AndroidNotificationChannel(
    channelId,
    'Amigos e invitaciones',
    description: 'Cuando un amigo te invita a jugar o te envía una solicitud',
    importance: Importance.high,
  );

  final _plugin = FlutterLocalNotificationsPlugin();
  final _taps = StreamController<Map<String, dynamic>>.broadcast();
  Map<String, dynamic>? _launchPayload;
  bool _ready = false;

  static bool get isSupported => !kIsWeb && defaultTargetPlatform == TargetPlatform.android;

  /// Datos del aviso tocado mientras la app ya estaba abierta o en segundo plano.
  Stream<Map<String, dynamic>> get onTap => _taps.stream;

  AndroidFlutterLocalNotificationsPlugin? get _android =>
      _plugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();

  Future<void> init() async {
    if (!isSupported || _ready) return;
    try {
      await _plugin.initialize(
        const InitializationSettings(android: AndroidInitializationSettings('ic_stat_wordhive')),
        onDidReceiveNotificationResponse: (r) => _emit(r.payload),
      );
      await _android?.createNotificationChannel(_channel);
      final launch = await _plugin.getNotificationAppLaunchDetails();
      if (launch?.didNotificationLaunchApp ?? false) _launchPayload = _decode(launch!.notificationResponse?.payload);
      _ready = true;
    } catch (e) {
      debugPrint('[SystemNotifications] No disponible: $e');
    }
  }

  /// Aviso local que abrió la app desde cero (se entrega una sola vez).
  Map<String, dynamic>? takeLaunchPayload() {
    final payload = _launchPayload;
    _launchPayload = null;
    return payload;
  }

  Future<bool> areEnabled() async => _ready && (await _android?.areNotificationsEnabled() ?? false);

  /// Muestra el diálogo del sistema (Android 13+). En versiones anteriores ya
  /// vienen activadas y devuelve el estado actual.
  Future<bool> requestPermission() async {
    if (!_ready) return false;
    final granted = await _android?.requestNotificationsPermission();
    return granted ?? await areEnabled();
  }

  /// Mismo `tag` que el push de FCM: si llegan ambos, el segundo reemplaza
  /// al primero en lugar de duplicarse.
  Future<void> show({required String title, required String body, required String tag, Map<String, dynamic>? data}) async {
    if (!_ready) return;
    await _plugin.show(
      0,
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          _channel.id,
          _channel.name,
          channelDescription: _channel.description,
          importance: Importance.high,
          priority: Priority.high,
          color: const Color(0xFF7C3AED),
          tag: tag,
          styleInformation: BigTextStyleInformation(body),
        ),
      ),
      payload: data == null ? null : jsonEncode(data),
    );
  }

  void _emit(String? payload) {
    final data = _decode(payload);
    if (data != null && !_taps.isClosed) _taps.add(data);
  }

  Map<String, dynamic>? _decode(String? payload) {
    if (payload == null || payload.isEmpty) return null;
    try {
      final decoded = jsonDecode(payload);
      return decoded is Map ? Map<String, dynamic>.from(decoded) : null;
    } catch (_) {
      return null;
    }
  }
}
