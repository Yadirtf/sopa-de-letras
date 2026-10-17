import 'package:flutter/material.dart';
import 'battle_art.dart';

/// Suelo del terreno como fondo (miniaturas de terreno, fichas de figuras).
DecorationImage terrainBackdrop(String terrainId, {double opacity = 1}) => DecorationImage(
      image: AssetImage(BattleArt.terrain(terrainId)),
      fit: BoxFit.cover,
      opacity: opacity,
    );

/// Figura 3D vista desde arriba, acostada (de lado) para que quepa en una fila.
class UnitThumb extends StatelessWidget {
  final String typeId;
  final String terrainId;
  final double size;
  final bool wreck;

  const UnitThumb({super.key, required this.typeId, required this.terrainId, this.size = 52, this.wreck = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      padding: EdgeInsets.all(size * 0.06),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        image: terrainBackdrop(terrainId),
        boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 6, offset: Offset(0, 2))],
      ),
      child: Image.asset(BattleArt.unit(typeId, wreck: wreck, rotated: true), fit: BoxFit.contain),
    );
  }
}

/// Ícono 3D de un arma de la armería.
class WeaponIcon extends StatelessWidget {
  final String weaponId;
  final double size;

  const WeaponIcon({super.key, required this.weaponId, this.size = 40});

  @override
  Widget build(BuildContext context) =>
      Image.asset(BattleArt.weapon(weaponId), width: size, height: size, fit: BoxFit.contain);
}

/// Franja con el suelo del terreno y algunas de sus figuras, como una maqueta.
class TerrainBanner extends StatelessWidget {
  final String terrainId;
  final List<String> unitIds;
  final double height;

  const TerrainBanner({super.key, required this.terrainId, required this.unitIds, this.height = 120});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        image: terrainBackdrop(terrainId),
        boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 12, offset: Offset(0, 4))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          for (final id in unitIds)
            Flexible(child: Image.asset(BattleArt.unit(id, rotated: true), fit: BoxFit.contain)),
        ],
      ),
    );
  }
}
