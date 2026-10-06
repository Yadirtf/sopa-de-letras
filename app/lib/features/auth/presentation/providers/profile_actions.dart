import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_notifier.dart';

/// Acciones del perfil. No tocan el `status` global de auth (eso haría que la
/// pantalla de login reaccionara); cada pantalla lleva su propio "guardando".
/// Devuelven un mensaje amable si algo falló, o null si salió bien.
class ProfileActions {
  final Ref _ref;

  ProfileActions(this._ref);

  static final provider = Provider<ProfileActions>((ref) => ProfileActions(ref));

  Future<String?> updateProfile({String? name, String? avatarUrl}) async {
    final trimmed = name?.trim();
    if (trimmed != null && trimmed.length < 3) return 'Tu nombre necesita al menos 3 letras';

    final result = await _ref.read(authRepositoryProvider).updateProfile(name: trimmed, avatarUrl: avatarUrl);
    return result.fold((error) => error, (user) {
      _ref.read(authNotifierProvider.notifier).replaceUser(user);
      return null;
    });
  }

  Future<String?> updatePin({required String currentPin, required String newPin}) async {
    if (currentPin == newPin) return 'El nuevo PIN debe ser diferente al actual';
    final result = await _ref.read(authRepositoryProvider).updatePin(currentPin: currentPin, newPin: newPin);
    return result.fold((error) => error, (_) => null);
  }
}
