import 'dart:async';
import 'dart:js_interop';
import 'dart:js_interop_unsafe';
import 'package:flutter/foundation.dart';
import 'package:web/web.dart' as web;
import 'system_notifications.dart';

SystemNotifications createSystemNotifications() => WebSystemNotifications();

/// Notificaciones del navegador (API `Notification`).
///
/// Mientras WordHive está abierta en alguna pestaña, el socket recibe las
/// invitaciones y aquí se convierten en un aviso del escritorio. Al hacer
/// clic, la pestaña vuelve al frente y se abre la pantalla del aviso.
/// Solo existen en sitios seguros (https o localhost).
class WebSystemNotifications implements SystemNotifications {
  final _taps = StreamController<Map<String, dynamic>>.broadcast();

  @override
  bool get isSupported => web.window.isSecureContext && globalContext.has('Notification');

  @override
  String get deniedHint => 'Actívalos desde el candado junto a la dirección de la página';

  @override
  Stream<Map<String, dynamic>> get onTap => _taps.stream;

  @override
  Future<void> init() async {}

  @override
  Map<String, dynamic>? takeLaunchPayload() => null;

  @override
  Future<bool> areEnabled() async => isSupported && web.Notification.permission == 'granted';

  @override
  Future<bool> requestPermission() async {
    if (!isSupported) return false;
    try {
      final result = await web.Notification.requestPermission().toDart;
      return result.toDart == 'granted';
    } catch (e) {
      debugPrint('[WebSystemNotifications] Permiso no disponible: $e');
      return false;
    }
  }

  @override
  Future<void> show(
      {required String title, required String body, required String tag, Map<String, dynamic>? data}) async {
    if (!await areEnabled()) return;
    final note = web.Notification(
      title,
      web.NotificationOptions(body: body, tag: tag, icon: 'icons/Icon-192.png', badge: 'favicon.png'),
    );
    note.onclick = (web.Event _) {
      web.window.focus();
      note.close();
      if (data != null && !_taps.isClosed) _taps.add(data);
    }.toJS;
  }
}
