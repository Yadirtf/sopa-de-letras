import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _keyAccessToken = 'wh_access_token';
  static const _keyRefreshToken = 'wh_refresh_token';
  static const _keyUserId = 'wh_user_id';

  final FlutterSecureStorage _storage;

  SecureStorageService([FlutterSecureStorage? storage])
      : _storage = storage ?? const FlutterSecureStorage();

  Future<void> saveAuthTokens({
    required String accessToken,
    required String refreshToken,
    required String userId,
  }) async {
    await Future.wait([
      _storage.write(key: _keyAccessToken, value: accessToken),
      _storage.write(key: _keyRefreshToken, value: refreshToken),
      _storage.write(key: _keyUserId, value: userId),
    ]);
  }

  Future<String?> getAccessToken() async =>
      await _storage.read(key: _keyAccessToken);

  Future<String?> getRefreshToken() async =>
      await _storage.read(key: _keyRefreshToken);

  Future<String?> getUserId() async =>
      await _storage.read(key: _keyUserId);

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
