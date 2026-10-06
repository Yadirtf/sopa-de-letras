abstract class ApiEndpoints {
  // Base URL configurable (Local dev vs Render staging/prod)
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:3000/api/v1', // Android emulator default o http://localhost:3000/api/v1
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
}
