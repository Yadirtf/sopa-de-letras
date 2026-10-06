import 'package:dio/dio.dart';

/// Convierte cualquier error de red en una frase que un niño o un abuelo
/// puedan entender. El backend ya envía `message` amable en español; si no
/// hay respuesta (sin internet, servidor dormido en Render) damos una propia.
String friendlyApiError(Object error) {
  if (error is DioException) {
    final data = error.response?.data;
    if (data is Map && data['message'] is String) return data['message'] as String;
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError) {
      return 'No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo.';
    }
  }
  return 'Algo salió mal. Inténtalo de nuevo.';
}
