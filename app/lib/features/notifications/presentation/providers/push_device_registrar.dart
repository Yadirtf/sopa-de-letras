import 'dart:async';
import '../../../../core/push/push_messaging.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../../data/datasources/push_device_remote_datasource.dart';

/// Mantiene al backend al día de qué teléfono pertenece a qué jugador:
/// alta al iniciar sesión o cambiar el token, baja al cerrar sesión (para que
/// el siguiente que use el teléfono no reciba avisos ajenos).
class PushDeviceRegistrar {
  final PushMessaging _push;
  final PushDeviceRemoteDataSource _api;
  final Future<String?> Function() _readAccessToken;

  String? _userId;
  String? _accessToken;
  String? _deviceToken;

  PushDeviceRegistrar(this._push, this._api, {Future<String?> Function()? readAccessToken})
      : _readAccessToken = readAccessToken ?? SecureStorageService().getAccessToken;

  String? get userId => _userId;

  Future<void> signIn(String userId) async {
    _userId = userId;
    _accessToken = await _readAccessToken();
    await register();
  }

  Future<void> signOut() async {
    final device = _deviceToken;
    final jwt = _accessToken;
    _userId = null;
    _accessToken = null;
    if (device == null || jwt == null) return;
    try {
      await _api.unregister(device, accessToken: jwt);
    } catch (_) {
      // Si falla, el backend reasigna el token en el próximo inicio de sesión.
    }
  }

  Future<void> register({String? token}) async {
    if (_userId == null) return;
    final device = token ?? await _push.token();
    if (device == null) return;
    _deviceToken = device;
    try {
      await _api.register(device);
    } catch (_) {
      // Se reintenta en el próximo inicio de sesión o cambio de token.
    }
  }
}
