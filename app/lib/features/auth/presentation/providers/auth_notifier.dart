import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/datasources/auth_local_datasource.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/repositories/auth_repository.dart';
import 'auth_state.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final apiClient = ApiClient();
  final remoteDs = AuthRemoteDataSource(apiClient);
  final localDs = AuthLocalDataSource();
  return AuthRepositoryImpl(remoteDs, localDs);
});

final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repo = ref.watch(authRepositoryProvider);
  return AuthNotifier(repo);
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repo;

  AuthNotifier(this._repo) : super(const AuthState()) {
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    final result = await _repo.getCurrentUser();
    result.fold(
      (err) => state = state.copyWith(status: AuthStatus.unauthenticated),
      (user) {
        if (user != null) {
          state = state.copyWith(status: AuthStatus.authenticated, user: user);
        } else {
          state = state.copyWith(status: AuthStatus.unauthenticated);
        }
      },
    );
  }

  Future<bool> login(String email, String pin) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    final result = await _repo.login(email: email, pin: pin);
    return result.fold(
      (error) {
        state = state.copyWith(status: AuthStatus.error, errorMessage: error);
        return false;
      },
      (user) {
        state = state.copyWith(status: AuthStatus.authenticated, user: user);
        return true;
      },
    );
  }

  Future<bool> register({
    required String name,
    required int age,
    required String email,
    required String pin,
    String? avatarUrl,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    final result = await _repo.register(
      name: name,
      age: age,
      email: email,
      pin: pin,
      avatarUrl: avatarUrl,
    );
    return result.fold(
      (error) {
        state = state.copyWith(status: AuthStatus.error, errorMessage: error);
        return false;
      },
      (user) {
        state = state.copyWith(status: AuthStatus.authenticated, user: user);
        return true;
      },
    );
  }

  Future<bool> guestLogin({String? name, String? avatarUrl}) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    final result = await _repo.guestLogin(name: name, avatarUrl: avatarUrl);
    return result.fold(
      (error) {
        state = state.copyWith(status: AuthStatus.error, errorMessage: error);
        return false;
      },
      (user) {
        state = state.copyWith(status: AuthStatus.authenticated, user: user);
        return true;
      },
    );
  }

  Future<bool> requestPinReset(String email) async {
    state = state.copyWith(status: AuthStatus.loading);
    final result = await _repo.requestPinReset(email: email);
    return result.fold(
      (err) {
        state = state.copyWith(status: AuthStatus.error, errorMessage: err);
        return false;
      },
      (msg) {
        state = state.copyWith(status: AuthStatus.unauthenticated, successMessage: msg);
        return true;
      },
    );
  }

  Future<bool> resetPin(String email, String otp, String newPin) async {
    state = state.copyWith(status: AuthStatus.loading);
    final result = await _repo.resetPin(email: email, otpCode: otp, newPin: newPin);
    return result.fold(
      (err) {
        state = state.copyWith(status: AuthStatus.error, errorMessage: err);
        return false;
      },
      (msg) {
        state = state.copyWith(status: AuthStatus.unauthenticated, successMessage: msg);
        return true;
      },
    );
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}
