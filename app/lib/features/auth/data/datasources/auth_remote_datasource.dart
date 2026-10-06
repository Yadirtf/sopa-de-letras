import 'package:dio/dio.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
import '../models/user_model.dart';

class AuthRemoteDataSource {
  final ApiClient _client;

  AuthRemoteDataSource(this._client);

  Future<Map<String, dynamic>> register({
    required String name,
    required int age,
    required String email,
    required String pin,
    String? avatarUrl,
  }) async {
    final response = await _client.dio.post(
      ApiEndpoints.register,
      data: {
        'name': name,
        'age': age,
        'email': email,
        'pin': pin,
        if (avatarUrl != null) 'avatarUrl': avatarUrl,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String pin,
  }) async {
    final response = await _client.dio.post(
      ApiEndpoints.login,
      data: {'email': email, 'pin': pin},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> guestLogin({
    String? name,
    String? avatarUrl,
  }) async {
    final response = await _client.dio.post(
      ApiEndpoints.guest,
      data: {
        if (name != null) 'name': name,
        if (avatarUrl != null) 'avatarUrl': avatarUrl,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  Future<String> requestPinReset(String email) async {
    final response = await _client.dio.post(
      ApiEndpoints.forgotPin,
      data: {'email': email},
    );
    return response.data['message'] as String;
  }

  Future<String> resetPin({
    required String email,
    required String otpCode,
    required String newPin,
  }) async {
    final response = await _client.dio.post(
      ApiEndpoints.resetPin,
      data: {'email': email, 'otpCode': otpCode, 'newPin': newPin},
    );
    return response.data['message'] as String;
  }

  Future<String> updatePin({
    required String currentPin,
    required String newPin,
  }) async {
    final response = await _client.dio.put(
      ApiEndpoints.updatePin,
      data: {'currentPin': currentPin, 'newPin': newPin},
    );
    return response.data['message'] as String;
  }

  Future<UserModel> updateProfile({String? name, String? avatarUrl}) async {
    final response = await _client.dio.patch(
      ApiEndpoints.me,
      data: {
        if (name != null) 'name': name,
        if (avatarUrl != null) 'avatarUrl': avatarUrl,
      },
    );
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<UserModel> getProfile() async {
    final response = await _client.dio.get(ApiEndpoints.me);
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }
}
