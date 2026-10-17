import 'dart:ui';
import '../../domain/entities/battle_catalog.dart';

/// Lee el catálogo que manda `GET /battle/catalog`.
abstract class BattleCatalogModel {
  static BattleCatalog fromJson(Map<String, dynamic> json) {
    final limits = (json['limits'] as Map?)?.cast<String, dynamic>() ?? const {};
    return BattleCatalog(
      terrains: _list(json['terrains']).map(_terrain).toList(),
      weapons: _list(json['weapons']).map(_weapon).toList(),
      limits: BattleLimits(
        minCols: _int(limits['minCols'], 6),
        maxCols: _int(limits['maxCols'], 26),
        minRows: _int(limits['minRows'], 6),
        maxRows: _int(limits['maxRows'], 30),
        maxPerUnit: _int(limits['maxPerUnit'], 6),
        maxWeaponUses: _int(limits['maxWeaponUses'], 5),
        maxCoverage: (limits['maxCoverage'] as num?)?.toDouble() ?? 0.35,
      ),
      reactions: _reactions(json['reactions']),
    );
  }

  static List<BattleReaction> _reactions(dynamic raw) {
    final list = _list(raw)
        .where((r) => r['id'] is String)
        .map((r) => BattleReaction(r['id'] as String, r['label']?.toString() ?? ''))
        .toList();
    return list.isEmpty ? BattleReaction.defaults : list;
  }

  static List<Map<String, dynamic>> _list(dynamic raw) =>
      raw is List ? raw.whereType<Map>().map((m) => m.cast<String, dynamic>()).toList() : const [];

  static int _int(dynamic v, int fallback) => (v as num?)?.toInt() ?? fallback;

  static Color _color(dynamic hex, Color fallback) {
    final clean = hex?.toString().replaceFirst('#', '') ?? '';
    final value = int.tryParse(clean, radix: 16);
    return value == null ? fallback : Color(0xFF000000 | value);
  }

  static BattleTerrain _terrain(Map<String, dynamic> t) => BattleTerrain(
        id: t['id'].toString(),
        name: t['name']?.toString() ?? '',
        inspiredBy: t['inspiredBy']?.toString() ?? '',
        ground: _color(t['groundHex'], const Color(0xFF2A3346)),
        gridLine: _color(t['gridHex'], const Color(0xFF151D2E)),
        units: _list(t['units'])
            .map((u) => BattleUnitType(
                  id: u['id'].toString(),
                  name: u['name']?.toString() ?? '',
                  width: _int(u['width'], 1),
                  height: _int(u['height'], 1),
                ))
            .toList(),
      );

  static BattleWeapon _weapon(Map<String, dynamic> w) => BattleWeapon(
        id: w['id'].toString(),
        name: w['name']?.toString() ?? '',
        description: w['description']?.toString() ?? '',
        damages: w['damages'] != false,
        defaultUses: _int(w['defaultUses'], -1),
      );
}
