import 'package:dio/dio.dart';

/// Mensaje para el jugador a partir de un error de red: el del servidor si
/// lo trae, un aviso de conexión si ni siquiera hubo respuesta, o el genérico.
String authErrorMessage(DioException e, String fallback) {
  final data = e.response?.data;
  if (data is Map && data['message'] is String) return data['message'] as String;
  if (e.response == null) return 'No pudimos conectar. Revisa tu internet e inténtalo de nuevo';
  return fallback;
}
