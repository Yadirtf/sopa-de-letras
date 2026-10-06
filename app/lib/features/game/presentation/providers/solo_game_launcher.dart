import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'game_room_notifier.dart';
import 'game_room_state.dart';

/// Codigo de la sala solitaria en curso: el lobby la arranca sola (tambien al
/// pedir "otra vez" desde el podio) en vez de esperar a que alguien toque Iniciar.
final soloRoomCodeProvider = StateProvider<String?>((ref) => null);

/// Modo solitario: reutiliza el motor multijugador (validacion en el servidor,
/// puntos, trofeos y podio) con una sala privada en la que solo esta el jugador.
/// Se inicia al instante, asi que nadie mas puede colarse (una partida en curso
/// no admite jugadores nuevos).
class SoloGameLauncher {
  final GameRoomNotifier _notifier;
  final GameRoomState Function() _readState;

  SoloGameLauncher(this._notifier, this._readState);

  /// Devuelve el codigo de la sala si todo salio bien; si no, null y el motivo
  /// queda en el estado (errorMessage) para mostrarlo.
  Future<String?> launch({
    required String wordSearchId,
    required String userId,
    required String username,
    String? avatarUrl,
  }) async {
    await _notifier.createRoom(wordSearchId: wordSearchId, maxPlayers: 2, isPrivate: true);
    final code = _readState().room?.code;
    if (code == null) return null;
    await _notifier.joinRoom(code: code, userId: userId, username: username, avatarUrl: avatarUrl);
    if (!_notifier.isJoinedTo(code)) return null;
    _notifier.startGame();
    return code.toUpperCase();
  }
}
