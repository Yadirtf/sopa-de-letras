import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';

/// Alta y baja del teléfono en el backend para recibir avisos push.
class PushDeviceRemoteDataSource {
  final ApiClient _client;

  PushDeviceRemoteDataSource(this._client);

  Future<void> register(String token) =>
      _client.dio.post(ApiEndpoints.pushDevices, data: {'token': token, 'platform': kIsWeb ? 'web' : 'android'});

  /// Al cerrar sesión el token local ya se borró, por eso se pasa el JWT
  /// que tenía el usuario para que el backend sepa de quién es el teléfono.
  Future<void> unregister(String token, {required String accessToken}) => _client.dio.delete(
        ApiEndpoints.pushDevices,
        data: {'token': token},
        options: Options(headers: {'Authorization': 'Bearer $accessToken'}),
      );
}
