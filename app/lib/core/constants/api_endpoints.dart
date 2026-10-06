abstract class ApiEndpoints {
  // Base URL configurable con fallback por defecto al backend en Render.com
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'https://wordhive-api.onrender.com/api/v1',
  );

  // WebSocket Server URL para tiempo real
  static const String socketUrl = String.fromEnvironment(
    'SOCKET_URL',
    defaultValue: 'https://wordhive-api.onrender.com',
  );

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
}

