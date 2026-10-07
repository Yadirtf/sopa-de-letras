import 'android_system_notifications.dart';
import 'system_notifications.dart';

/// Fuera del navegador: Android (en otras plataformas queda desactivado solo).
SystemNotifications createSystemNotifications() => AndroidSystemNotifications();
