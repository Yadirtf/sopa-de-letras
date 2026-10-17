import 'dart:ui' as ui;
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/battle_catalog.dart';

/// Rutas del arte 3D (renderizado con app/tool/battle_art) y de los efectos.
abstract class BattleArt {
  static const _root = 'assets/battle';

  static String unit(String typeId, {bool wreck = false, bool rotated = false}) =>
      '$_root/units/$typeId${wreck ? '_wreck' : ''}${rotated ? '_r' : ''}.webp';
  static String terrain(String terrainId) => '$_root/terrains/${terrainId.toLowerCase()}.webp';
  static String weapon(String weaponId) => '$_root/weapons/${weaponId.toLowerCase()}.webp';

  /// Partículas de Kenney (CC0): fuego, destello, humo negro y polvo.
  static const fx = {'fire': 4, 'flash': 3, 'smoke': 4, 'puff': 4};
  static String fxFrame(String kind, int i) => '$_root/fx/${kind}_$i.webp';

  /// La textura del suelo cubre este número de casillas por lado.
  static const groundTileCells = 8;
}

/// Imágenes ya decodificadas de un terreno: suelo, sus figuras (sanas,
/// destruidas y giradas) y las partículas. El pintor las usa en cada cuadro.
class BattleArtPack {
  final ui.Image ground;
  final Map<String, ui.Image> units;
  final Map<String, List<ui.Image>> fx;

  const BattleArtPack({required this.ground, required this.units, required this.fx});

  ui.Image? unit(String typeId, {bool wreck = false, bool rotated = false}) =>
      units['$typeId${wreck ? '_wreck' : ''}${rotated ? '_r' : ''}'];

  static Future<ui.Image> _load(String asset) async {
    final data = await rootBundle.load(asset);
    final codec = await ui.instantiateImageCodec(data.buffer.asUint8List());
    return (await codec.getNextFrame()).image;
  }

  static Future<BattleArtPack> load(BattleTerrain terrain) async {
    final units = <String, ui.Image>{};
    await Future.wait([
      for (final u in terrain.units)
        for (final wreck in [false, true])
          for (final rotated in [false, true])
            _load(BattleArt.unit(u.id, wreck: wreck, rotated: rotated)).then(
              (img) => units['${u.id}${wreck ? '_wreck' : ''}${rotated ? '_r' : ''}'] = img,
              onError: (_) {},
            ),
    ]);
    final fx = <String, List<ui.Image>>{};
    for (final entry in BattleArt.fx.entries) {
      fx[entry.key] = await Future.wait([for (var i = 0; i < entry.value; i++) _load(BattleArt.fxFrame(entry.key, i))]);
    }
    return BattleArtPack(ground: await _load(BattleArt.terrain(terrain.id)), units: units, fx: fx);
  }
}

/// Se carga una vez por terreno y queda en memoria mientras dure la app.
final battleArtProvider = FutureProvider.family<BattleArtPack, BattleTerrain>((ref, terrain) {
  return BattleArtPack.load(terrain);
});
