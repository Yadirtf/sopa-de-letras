import 'package:flutter/foundation.dart';

abstract class ApiEndpoints {
  static const String _envApiUrl = String.fromEnvironment('API_URL');
  static const String _envSocketUrl = String.fromEnvironment('SOCKET_URL');

  // Base URL configurable: prioridad a variable de entorno, luego localhost/10.0.2.2 en debug, y Render en prod
  static String get baseUrl {
    if (_envApiUrl.isNotEmpty) return _envApiUrl;
    if (kDebugMode) {
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
        return 'http://10.0.2.2:3000/api/v1';
      }
      return 'http://localhost:3000/api/v1';
    }
    return 'https://wordhive-api.onrender.com/api/v1';
  }

  // WebSocket Server URL para tiempo real
  static String get socketUrl {
    if (_envSocketUrl.isNotEmpty) return _envSocketUrl;
    if (kDebugMode) {
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
        return 'http://10.0.2.2:3000';
      }
      return 'http://localhost:3000';
    }
    return 'https://wordhive-api.onrender.com';
  }

  // Autenticación
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String guest = '/auth/guest';
  static const String forgotPin = '/auth/forgot-pin';
  static const String resetPin = '/auth/reset-pin';

  // Perfil de Usuario
  static const String me = '/users/me';
  static const String updatePin = '/users/me/pin';

  // Catálogo de Sopas (Épica 2)
  static const String wordSearches = '/word-searches';

  // Salas Multijugador (Épica 4)
  static const String rooms = '/rooms';

  // Ecosistema Social y Notificaciones (Épica 5)
  static const String friends = '/friends';
  static const String friendsSearch = '/friends/search';
  static const String friendRequests = '/friends/requests';
  static String friendRequest(String requestId) => '/friends/requests/$requestId';
  static String friend(String userId) => '/friends/$userId';
  static String inviteFriend(String userId) => '/friends/$userId/invite';
  static const String notifications = '/notifications';
  static const String notificationsReadAll = '/notifications/read-all';
  static String notificationRead(String id) => '/notifications/$id/read';
  static const String pushDevices = '/notifications/devices';
}
