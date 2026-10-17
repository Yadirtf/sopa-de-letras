import 'dart:ui';
import 'battle_reaction.dart';
export 'battle_reaction.dart';

/// Catálogo de La Batalla Más Temida tal como lo define el servidor:
/// terrenos (cada uno con su ejército), armas y límites de la arena.
class BattleUnitType {
  final String id;
  final String name;
  final int width;
  final int height;

  const BattleUnitType({
    required this.id,
    required this.name,
    required this.width,
    required this.height,
  });

  int get cells => width * height;
  String get footprint => '$width×$height';
}

class BattleTerrain {
  final String id;
  final String name;
  final String inspiredBy;
  final Color ground;
  final Color gridLine;
  final List<BattleUnitType> units;

  const BattleTerrain({
    required this.id,
    required this.name,
    required this.inspiredBy,
    required this.ground,
    required this.gridLine,
    required this.units,
  });

  BattleUnitType? unit(String id) {
    for (final u in units) {
      if (u.id == id) return u;
    }
    return null;
  }

  /// Suelo claro (nieve, arena): las marcas se pintan oscuras para que se vean.
  bool get isLight => ground.computeLuminance() > 0.45;
}

class BattleWeapon {
  final String id;
  final String name;
  final String description;
  final bool damages;
  final int defaultUses;

  const BattleWeapon({
    required this.id,
    required this.name,
    required this.description,
    required this.damages,
    required this.defaultUses,
  });

  bool get isUnlimited => defaultUses < 0;
}

class BattleLimits {
  final int minCols;
  final int maxCols;
  final int minRows;
  final int maxRows;
  final int maxPerUnit;
  final int maxWeaponUses;
  final double maxCoverage;

  const BattleLimits({
    this.minCols = 6,
    this.maxCols = 26,
    this.minRows = 6,
    this.maxRows = 30,
    this.maxPerUnit = 6,
    this.maxWeaponUses = 5,
    this.maxCoverage = 0.35,
  });
}

class BattleCatalog {
  final List<BattleTerrain> terrains;
  final List<BattleWeapon> weapons;
  final BattleLimits limits;
  final List<BattleReaction> reactions;

  const BattleCatalog({
    required this.terrains,
    required this.weapons,
    required this.limits,
    this.reactions = BattleReaction.defaults,
  });

  BattleReaction reaction(String id) => reactions.firstWhere((r) => r.id == id, orElse: () => reactions.first);

  BattleTerrain terrain(String id) => terrains.firstWhere((t) => t.id == id, orElse: () => terrains.first);

  BattleWeapon weapon(String id) => weapons.firstWhere((w) => w.id == id, orElse: () => weapons.first);

  List<BattleWeapon> get specialWeapons => weapons.where((w) => !w.isUnlimited).toList();
}
