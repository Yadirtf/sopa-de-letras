import 'package:hive_flutter/hive_flutter.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../models/user_model.dart';

class AuthLocalDataSource {
  static const _userBoxName = 'wh_user_cache_box';
  static const _currentUserKey = 'current_user';

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
  }

  Future<UserModel?> getCachedUser() async {
    final box = await Hive.openBox(_userBoxName);
    final data = box.get(_currentUserKey);
    if (data == null) return null;
    return UserModel.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<void> clearAuthData() async {
    await _storageService.clearAll();
    final box = await Hive.openBox(_userBoxName);
    await box.delete(_currentUserKey);
  }
}
