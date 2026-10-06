import 'package:flutter/material.dart';
import '../../../../core/theme/app_typography.dart';

/// Mini cuadrícula decorativa de la portada de cada tarjeta. Las letras salen
/// del título mezcladas con el abecedario, siempre las mismas para la misma
/// sopa (semilla = id), así que "parece" su sopa sin revelar ninguna palabra.
class LetterMosaicWidget extends StatelessWidget {
  final String seed;
  final String title;
  final Color color;
  final int rows;
  final int columns;

  const LetterMosaicWidget({
    super.key,
    required this.seed,
    required this.title,
    required this.color,
    this.rows = 4,
    this.columns = 7,
  });

  static const _alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

  List<String> _letters() {
    final fromTitle = title.toUpperCase().replaceAll(RegExp(r'[^A-ZÑ]'), '');
    final pool = '$fromTitle$_alphabet';
    // Generador congruencial: barato, determinista y sin dependencias.
    var state = seed.codeUnits.fold<int>(7, (acc, c) => (acc * 31 + c) & 0x7fffffff);
    return List.generate(rows * columns, (_) {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return pool[state % pool.length];
    });
  }

  @override
  Widget build(BuildContext context) {
    final letters = _letters();
    // FittedBox: la rejilla se encoge para caber en cualquier portada.
    return ExcludeSemantics(
      child: FittedBox(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(rows, (r) {
            return Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(columns, (c) {
                // Una "diagonal" encendida sugiere una palabra encontrada.
                final lit = (c - r) == (seed.length % 3);
                return SizedBox(
                  width: 20,
                  height: 18,
                  child: Center(
                    child: Text(
                      letters[r * columns + c],
                      style: AppTypography.caption.copyWith(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: color.withValues(alpha: lit ? 0.95 : 0.35),
                      ),
                    ),
                  ),
                );
              }),
            );
          }),
        ),
      ),
    );
  }
}
