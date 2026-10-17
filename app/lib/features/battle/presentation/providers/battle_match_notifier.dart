import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/battle_view.dart';
import '../../domain/repositories/battle_repository.dart';
import 'battle_providers.dart';

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

  const BattleMatchState({
    this.view,
    this.lastShot,
    this.weapon = 'BULLET',
    this.isBusy = false,
    this.connected = true,
    this.message,
    this.fatalError,
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
  }) {
    return BattleMatchState(
      view: view ?? this.view,
      lastShot: lastShot ?? this.lastShot,
      weapon: weapon ?? this.weapon,
      isBusy: isBusy ?? this.isBusy,
      connected: connected ?? this.connected,
      message: clearMessage ? null : (message ?? this.message),
      fatalError: fatalError ?? this.fatalError,
    );
  }
}

final battleMatchProvider =
    StateNotifierProvider.autoDispose.family<BattleMatchNotifier, BattleMatchState, String>((ref, code) {
  return BattleMatchNotifier(ref.watch(battleRepositoryProvider), code.toUpperCase())..start();
});

class BattleMatchNotifier extends StateNotifier<BattleMatchState> {
  final BattleRepository _repo;
  final String code;
  final List<StreamSubscription> _subs = [];

  BattleMatchNotifier(this._repo, this.code) : super(const BattleMatchState(isBusy: true));

  Future<void> start() async {
    _subs.add(_repo.updates.where((u) => u.view.code == code).listen(_onUpdate));
    _subs.add(_repo.connection.listen((ok) => mounted ? state = state.copyWith(connected: ok) : null));
    try {
      final view = await _repo.join(code);
      if (mounted) state = state.copyWith(view: view, isBusy: false, connected: true);
    } on BattleFailure catch (e) {
      if (mounted) state = state.copyWith(isBusy: false, fatalError: e.message);
    }
  }

  void _onUpdate(BattleUpdate update) {
    if (!mounted) return;
    var weapon = state.weapon;
    if (weapon != 'BULLET' && (update.view.myAmmo[weapon] ?? 0) <= 0) weapon = 'BULLET';
    state = state.copyWith(view: update.view, lastShot: update.shot, weapon: weapon);
  }

  void selectWeapon(String weaponId) => state = state.copyWith(weapon: weaponId, clearMessage: true);

  void clearMessage() => state = state.copyWith(clearMessage: true);

  Future<bool> shoot(int col, int row) async {
    final view = state.view;
    if (view == null || state.isBusy) return false;
    if (!view.isMyTurn) {
      state = state.copyWith(message: 'Espera, todavía es el turno de tu rival.');
      return false;
    }
    state = state.copyWith(isBusy: true, clearMessage: true);
    try {
      await _repo.shoot(code, weapon: state.weapon, col: col, row: row);
      if (mounted) state = state.copyWith(isBusy: false);
      return true;
    } on BattleFailure catch (e) {
      if (mounted) state = state.copyWith(isBusy: false, message: e.message);
      return false;
    }
  }

  Future<void> placeUnits(List<UnitPlacement> units) => _guard(() => _repo.place(code, units));

  Future<List<UnitPlacement>?> randomLayout() async {
    try {
      return await _repo.randomLayout(code);
    } on BattleFailure catch (e) {
      if (mounted) state = state.copyWith(message: e.message);
      return null;
    }
  }

  Future<void> rematch() => _guard(() => _repo.rematch(code));

  Future<void> leave() => _guard(() => _repo.leave(code));

  Future<void> _guard(Future<void> Function() action) async {
    state = state.copyWith(isBusy: true, clearMessage: true);
    try {
      await action();
      if (mounted) state = state.copyWith(isBusy: false);
    } on BattleFailure catch (e) {
      if (mounted) state = state.copyWith(isBusy: false, message: e.message);
    }
  }

  @override
  void dispose() {
    for (final s in _subs) {
      s.cancel();
    }
    super.dispose();
  }
}
