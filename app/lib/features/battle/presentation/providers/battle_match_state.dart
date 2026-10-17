import '../../domain/entities/battle_reaction.dart';
import '../../domain/entities/battle_view.dart';

/// Estado de la pantalla de batalla: la vista que manda el servidor, el
/// último disparo (para la animación), el arma elegida y avisos para el jugador.
class BattleMatchState {
  final BattleView? view;
  final ShotReportView? lastShot;
  final String weapon;
  final bool isBusy;
  final bool connected;
  final String? message;
  final String? fatalError;

  /// Reacción que se está mostrando en grande (mía o del rival).
  final BattleReactionShow? reaction;

  const BattleMatchState({
    this.view,
    this.lastShot,
    this.weapon = 'BULLET',
    this.isBusy = false,
    this.connected = true,
    this.message,
    this.fatalError,
    this.reaction,
  });

  BattleMatchState copyWith({
    BattleView? view,
    ShotReportView? lastShot,
    String? weapon,
    bool? isBusy,
    bool? connected,
    String? message,
    bool clearMessage = false,
    String? fatalError,
    BattleReactionShow? reaction,
  }) {
    return BattleMatchState(
      view: view ?? this.view,
      lastShot: lastShot ?? this.lastShot,
      weapon: weapon ?? this.weapon,
      isBusy: isBusy ?? this.isBusy,
      connected: connected ?? this.connected,
      message: clearMessage ? null : (message ?? this.message),
      fatalError: fatalError ?? this.fatalError,
      reaction: reaction ?? this.reaction,
    );
  }
}
