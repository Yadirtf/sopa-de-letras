import 'package:dartz/dartz.dart';
import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<Either<String, UserEntity>> register({
    required String name,
    required int age,
    required String email,
    required String pin,
    String? avatarUrl,
  });

  Future<Either<String, UserEntity>> login({
    required String email,
    required String pin,
  });

  Future<Either<String, UserEntity>> guestLogin({
    String? name,
    String? avatarUrl,
  });

  Future<Either<String, String>> requestPinReset({required String email});

  Future<Either<String, String>> resetPin({
    required String email,
    required String otpCode,
    required String newPin,
  });

  Future<Either<String, String>> updatePin({
    required String currentPin,
    required String newPin,
  });

  Future<Either<String, UserEntity>> updateProfile({
    String? name,
    String? avatarUrl,
  });

  Future<Either<String, UserEntity?>> getCurrentUser();

  Future<void> logout();
}
