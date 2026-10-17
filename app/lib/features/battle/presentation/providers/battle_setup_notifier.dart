import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/battle_catalog.dart';
import '../../domain/entities/battle_config.dart';
import '../../domain/repositories/battle_repository.dart';
import 'battle_providers.dart';

/// Lo que va eligiendo quien crea la sala. Mientras no toque el ejército a
/// mano, al cambiar terreno o tamaño se vuelve a pedir la recomendación.
class BattleSetupState {
  final BattleConfig config;
  final bool armyEdited;
  final bool isBusy;
  final String? error;

  const BattleSetupState(
      {this.config = const BattleConfig(), this.armyEdited = false, this.isBusy = false, this.error});

  BattleSetupState copyWith(
      {BattleConfig? config, bool? armyEdited, bool? isBusy, String? error, bool clearError = false}) {
    return BattleSetupState(
      config: config ?? this.config,
      armyEdited: armyEdited ?? this.armyEdited,
      isBusy: isBusy ?? this.isBusy,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

final battleSetupProvider = StateNotifierProvider.autoDispose<BattleSetupNotifier, BattleSetupState>((ref) {
  return BattleSetupNotifier(ref.watch(battleRepositoryProvider));
});

class BattleSetupNotifier extends StateNotifier<BattleSetupState> {
  final BattleRepository _repo;
  bool _initialized = false;

  BattleSetupNotifier(this._repo) : super(const BattleSetupState());

  void init(BattleCatalog catalog) {
    if (_initialized) return;
    _initialized = true;
    final weapons = {for (final w in catalog.specialWeapons) w.id: w.defaultUses};
    state = state.copyWith(config: state.config.copyWith(terrainId: catalog.terrains.first.id, weapons: weapons));
    _refreshRecommendation();
  }

  void setTerrain(String terrainId) {
    state = state.copyWith(config: state.config.copyWith(terrainId: terrainId, army: {}), armyEdited: false);
    _refreshRecommendation();
  }

  void setSize({int? cols, int? rows}) {
    state = state.copyWith(config: state.config.copyWith(cols: cols, rows: rows), clearError: true);
  }

  /// Al soltar el control de tamaño: si el ejército es el recomendado, se ajusta a la arena nueva.
  void sizeSettled() {
    if (!state.armyEdited) _refreshRecommendation();
  }

  void useRecommendation() {
    state = state.copyWith(armyEdited: false);
    _refreshRecommendation();
  }

  void setUnitCount(String unitId, int count) {
    final army = {...state.config.army, unitId: count};
    state = state.copyWith(config: state.config.copyWith(army: army), armyEdited: true, clearError: true);
  }

  void setWeaponUses(String weaponId, int uses) {
    final weapons = {...state.config.weapons, weaponId: uses};
    state = state.copyWith(config: state.config.copyWith(weapons: weapons));
  }

  void setInputMode(BattleInputMode mode) => state = state.copyWith(config: state.config.copyWith(inputMode: mode));

  /// Crea la sala y devuelve su código (o null si el servidor la rechazó).
  Future<String?> create(BattleOpponent opponent) async {
    state = state.copyWith(isBusy: true, clearError: true);
    try {
      final code = await _repo.createRoom(state.config.copyWith(opponent: opponent));
      state = state.copyWith(isBusy: false);
      return code;
    } on BattleFailure catch (e) {
      state = state.copyWith(isBusy: false, error: e.message);
      return null;
    }
  }

  Future<void> _refreshRecommendation() async {
    final config = state.config;
    try {
      final army = await _repo.recommendation(terrainId: config.terrainId, cols: config.cols, rows: config.rows);
      final now = state.config;
      if (!mounted || state.armyEdited || now.terrainId != config.terrainId) return;
      state = state.copyWith(config: now.copyWith(army: army));
    } on BattleFailure catch (e) {
      if (mounted) state = state.copyWith(error: e.message);
    }
  }
}
