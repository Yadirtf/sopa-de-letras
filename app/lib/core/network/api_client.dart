import 'package:dio/dio.dart';
import '../constants/api_endpoints.dart';
import '../storage/secure_storage_service.dart';

class ApiClient {
  late final Dio dio;
  final SecureStorageService _storageService;

  ApiClient({SecureStorageService? storageService})
      : _storageService = storageService ?? SecureStorageService() {
    dio = Dio(
      BaseOptions(
        baseUrl: ApiEndpoints.baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storageService.getAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          // ignore: avoid_print
          print('[ApiClient] --> ${options.method} ${options.uri}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          // ignore: avoid_print
          print('[ApiClient] <-- ${response.statusCode} ${response.requestOptions.uri}');
          return handler.next(response);
        },
        onError: (DioException error, handler) async {
          // ignore: avoid_print
          print('[ApiClient] ERROR: ${error.type} (${error.response?.statusCode}) on ${error.requestOptions.uri}');
          if (error.response?.data != null) {
            // ignore: avoid_print
            print('[ApiClient] Response: ${error.response?.data}');
          }
          return handler.next(error);
        },
      ),
    );
  }
}
