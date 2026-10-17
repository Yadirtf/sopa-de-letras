import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'battle_grid_layers.dart';
import 'battle_grid_painter.dart';

/// Arena tocable. Se ajusta al ancho disponible y, en arenas grandes, se
/// puede acercar con dos dedos (o la rueda del ratón) para atinar la casilla.
class BattleGrid extends StatefulWidget {
  final BattleGridLayers layers;
  final void Function(int col, int row)? onCellTap;

  /// Cambia cuando cae un disparo nuevo: dispara el destello de la marca.
  final int shotSeq;
  final double maxCell;

  const BattleGrid({super.key, required this.layers, this.onCellTap, this.shotSeq = 0, this.maxCell = 34});

  @override
  State<BattleGrid> createState() => _BattleGridState();
}

class _BattleGridState extends State<BattleGrid> with SingleTickerProviderStateMixin {
  late final AnimationController _flash =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1100));

  @override
  void didUpdateWidget(covariant BattleGrid old) {
    super.didUpdateWidget(old);
    if (widget.shotSeq != old.shotSeq && widget.layers.lastShot != null) _flash.forward(from: 0);
  }

  @override
  void dispose() {
    _flash.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final layers = widget.layers;
    return LayoutBuilder(builder: (context, box) {
      final probe = (box.maxWidth - 20) / layers.cols;
      final cell = math.min(probe, widget.maxCell).clamp(8.0, 64.0);
      final label = (cell * 0.9).clamp(14.0, 24.0);
      final width = label + layers.cols * cell + 2;
      final height = label + layers.rows * cell + 2;

      final board = AnimatedBuilder(
        animation: _flash,
        builder: (context, _) => GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapUp: widget.onCellTap == null
              ? null
              : (details) {
                  final c = ((details.localPosition.dx - label) / cell).floor();
                  final r = ((details.localPosition.dy - label) / cell).floor();
                  if (c >= 0 && r >= 0 && c < layers.cols && r < layers.rows) widget.onCellTap!(c, r);
                },
          child: CustomPaint(
            size: Size(width, height),
            painter: BattleGridPainter(
              layers: layers,
              cell: cell,
              label: label,
              flash: _flash.isAnimating ? 1 - Curves.easeOut.transform(_flash.value) : 0,
            ),
          ),
        ),
      );

      return Center(
        child: InteractiveViewer(
          minScale: 1,
          maxScale: 4,
          child: SizedBox(width: width, height: height, child: board),
        ),
      );
    });
  }
}
