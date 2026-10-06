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
    if ((secureToken == null || secureToken.isEmpty) &&
        (hiveToken == null || hiveToken.isEmpty)) {
      await clearAuthData();
      return null;
    }

    return UserModel.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<void> clearAuthData() async {
    await _storageService.clearAll();
    final box = await Hive.openBox(_userBoxName);
    await box.delete(_currentUserKey);
    await box.delete(_tokenKey);
    await box.delete(_authTimestampKey);
  }
}
