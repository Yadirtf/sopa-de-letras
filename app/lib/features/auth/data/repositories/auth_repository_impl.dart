import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';
import '../datasources/auth_local_datasource.dart';
import '../models/user_model.dart';
import 'auth_error_message.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;
  final AuthLocalDataSource _localDataSource;

  AuthRepositoryImpl(this._remoteDataSource, this._localDataSource);

  @override
  Future<Either<String, UserEntity>> register({
    required String name,
    required int age,
    required String email,
    required String pin,
    String? avatarUrl,
  }) async {
    try {
      final res = await _remoteDataSource.register(
        name: name,
        age: age,
        email: email,
        pin: pin,
        avatarUrl: avatarUrl,
      );
      return Right(await _persistSession(res));
    } on DioException catch (e) {
      return Left(authErrorMessage(e, 'Error de conexión'));
    } catch (e) {
      return Left(e.toString());
    }
  }

  @override
  Future<Either<String, UserEntity>> login({
    required String email,
    required String pin,
  }) async {
    try {
      final res = await _remoteDataSource.login(email: email, pin: pin);
      return Right(await _persistSession(res));
    } on DioException catch (e) {
      return Left(authErrorMessage(e, 'Credenciales inválidas'));
    } catch (e) {
      return Left(e.toString());
    }
  }

  @override
  Future<Either<String, UserEntity>> guestLogin({
    String? name,
    String? avatarUrl,
  }) async {
    try {
      final res = await _remoteDataSource.guestLogin(name: name, avatarUrl: avatarUrl);
      return Right(await _persistSession(res));
    } on DioException catch (e) {
      return Left(authErrorMessage(e, 'Error al iniciar como invitado'));
    }
  }

  @override
  Future<Either<String, String>> requestPinReset({required String email}) async {
    try {
      final msg = await _remoteDataSource.requestPinReset(email);
      return Right(msg);
    } on DioException catch (e) {
      return Left(authErrorMessage(e, 'Error al solicitar código'));
    }
  }

  @override
  Future<Either<String, String>> resetPin({
    required String email,
    required String otpCode,
    required String newPin,
  }) async {
    try {
      final msg = await _remoteDataSource.resetPin(
        email: email,
        otpCode: otpCode,
        newPin: newPin,
      );
      return Right(msg);
    } on DioException catch (e) {
      return Left(authErrorMessage(e, 'Código o PIN inválido'));
    }
  }

  @override
  Future<Either<String, String>> updatePin({
    required String currentPin,
    required String newPin,
  }) async {
    try {
      final msg = await _remoteDataSource.updatePin(
        currentPin: currentPin,
        newPin: newPin,
      );
      return Right(msg);
    } on DioException catch (e) {
      return Left(authErrorMessage(e, 'Error al actualizar PIN'));
    }
  }

  @override
  Future<Either<String, UserEntity>> updateProfile({String? name, String? avatarUrl}) async {
    try {
      final user = await _remoteDataSource.updateProfile(name: name, avatarUrl: avatarUrl);
      // La cache es la fuente del usuario al reabrir la app: hay que mantenerla al día.
      await _localDataSource.updateCachedUser(user);
      return Right(user);
    } on DioException catch (e) {
      return Left(authErrorMessage(e, 'Error al actualizar perfil'));
    }
  }

  @override
  Future<Either<String, UserEntity?>> getCurrentUser() async {
    final cached = await _localDataSource.getCachedUser();
    return Right(cached);
  }

  @override
  Future<void> logout() async {
    await _localDataSource.clearAuthData();
  }

  Future<UserModel> _persistSession(Map<String, dynamic> res) async {
    final user = UserModel.fromJson(res['user']);
    final tokens = res['tokens'];
    await _localDataSource.saveAuthData(
      user: user,
      accessToken: tokens['accessToken'],
      refreshToken: tokens['refreshToken'],
    );
    return user;
  }
}
