import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _keyAccessToken = 'wh_access_token';
  static const _keyRefreshToken = 'wh_refresh_token';
  static const _keyUserId = 'wh_user_id';

  final FlutterSecureStorage _storage;

  SecureStorageService([FlutterSecureStorage? storage]) : _storage = storage ?? const FlutterSecureStorage();

  Future<void> saveAuthTokens({
    required String accessToken,
    required String refreshToken,
    required String userId,
  }) async {
    // Una tras otra, nunca en paralelo: en el navegador la primera escritura
    // crea la clave de cifrado, y tres escrituras a la vez creaban tres claves
    // distintas. Solo sobrevivía la última y el token ya no se podía leer, así
    // que el servidor respondía 401 al crear una sala o jugar en solitario.
    try {
      await _storage.write(key: _keyAccessToken, value: accessToken);
      await _storage.write(key: _keyRefreshToken, value: refreshToken);
      await _storage.write(key: _keyUserId, value: userId);
    } catch (_) {}
  }

  Future<String?> getAccessToken() async {
    try {
      return await _storage.read(key: _keyAccessToken);
    } catch (_) {
      return null;
    }
  }

  Future<String?> getRefreshToken() async {
    try {
      return await _storage.read(key: _keyRefreshToken);
    } catch (_) {
      return null;
    }
  }

  Future<String?> getUserId() async {
    try {
      return await _storage.read(key: _keyUserId);
    } catch (_) {
      return null;
    }
  }

  Future<void> clearAll() async {
    try {
      await _storage.deleteAll();
    } catch (_) {}
  }
}
