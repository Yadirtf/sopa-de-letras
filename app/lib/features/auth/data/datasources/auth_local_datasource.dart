import 'package:hive_flutter/hive_flutter.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../models/user_model.dart';

class AuthLocalDataSource {
  static const _userBoxName = 'wh_user_cache_box';
  static const _currentUserKey = 'current_user';
  static const _tokenKey = 'cached_token';
  static const _authTimestampKey = 'auth_timestamp';
  static const _sessionDurationHours = 24;

  final SecureStorageService _storageService;

  AuthLocalDataSource([SecureStorageService? storageService])
      : _storageService = storageService ?? SecureStorageService();

  Future<void> saveAuthData({
    required UserModel user,
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storageService.saveAuthTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
      userId: user.id,
    );

    final box = await Hive.openBox(_userBoxName);
    await box.put(_currentUserKey, user.toJson());
    await box.put(_tokenKey, accessToken);
    await box.put(_authTimestampKey, DateTime.now().millisecondsSinceEpoch);
  }

  /// Reemplaza el usuario guardado (tras editar el perfil) sin tocar los
  /// tokens ni reiniciar el reloj de la sesión.
  Future<void> updateCachedUser(UserModel user) async {
    final box = await Hive.openBox(_userBoxName);
    await box.put(_currentUserKey, user.toJson());
  }

  Future<UserModel?> getCachedUser() async {
    final box = await Hive.openBox(_userBoxName);
    final data = box.get(_currentUserKey);
    if (data == null) return null;

    final timestamp = box.get(_authTimestampKey) as int?;
    if (timestamp != null) {
      final loginTime = DateTime.fromMillisecondsSinceEpoch(timestamp);
      final difference = DateTime.now().difference(loginTime);
      if (difference.inHours >= _sessionDurationHours) {
        await clearAuthData();
        return null;
      }
    }

    final secureToken = await _storageService.getAccessToken();
    final hiveToken = box.get(_tokenKey) as String?;
    final hasSecureToken = secureToken != null && secureToken.isNotEmpty;
    if (!hasSecureToken && (hiveToken == null || hiveToken.isEmpty)) {
      await clearAuthData();
      return null;
    }
    final user = UserModel.fromJson(Map<String, dynamic>.from(data as Map));
    // Sesiones web guardadas con la versión anterior: el token cifrado quedó
    // ilegible. Se repara con la copia local para no pedir login de nuevo.
    if (!hasSecureToken) {
      await _storageService.clearAll();
      await _storageService.saveAuthTokens(accessToken: hiveToken!, refreshToken: '', userId: user.id);
    }
    return user;
  }

  Future<void> clearAuthData() async {
    await _storageService.clearAll();
    final box = await Hive.openBox(_userBoxName);
    await box.delete(_currentUserKey);
    await box.delete(_tokenKey);
    await box.delete(_authTimestampKey);
  }
}
