import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../art/battle_art.dart';
import 'battle_grid_layers.dart';
import 'battle_grid_painter.dart';

/// Arena tocable. Se ajusta al ancho disponible y, en arenas grandes, se
/// puede acercar con dos dedos (o la rueda del ratón) para atinar la casilla.
class BattleGrid extends ConsumerStatefulWidget {
  final BattleGridLayers layers;
  final void Function(int col, int row)? onCellTap;

  /// Cambia cuando cae un disparo nuevo: arranca su animación.
  final int shotSeq;
  final double maxCell;

  const BattleGrid({super.key, required this.layers, this.onCellTap, this.shotSeq = 0, this.maxCell = 34});

  @override
  ConsumerState<BattleGrid> createState() => _BattleGridState();
}

class _BattleGridState extends ConsumerState<BattleGrid> with TickerProviderStateMixin {
  static const _shotDuration = Duration(milliseconds: 1900);

  late final AnimationController _shot = AnimationController(vsync: this, duration: _shotDuration);

  /// Reloj continuo para el fuego, el humo, el agua y la mira.
  final _time = ValueNotifier<double>(0);
  late final Ticker _ticker = createTicker((elapsed) => _time.value = elapsed.inMicroseconds / 1e6);

  @override
  void initState() {
    super.initState();
    _ticker.start();
  }

  @override
  void didUpdateWidget(covariant BattleGrid old) {
    super.didUpdateWidget(old);
    if (widget.shotSeq != old.shotSeq && widget.layers.lastShot != null) _shot.forward(from: 0);
  }

  @override
  void dispose() {
    _ticker.dispose();
    _time.dispose();
    _shot.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final layers = widget.layers;
    final art = ref.watch(battleArtProvider(layers.terrain)).valueOrNull;
    return LayoutBuilder(builder: (context, box) {
      final probe = (box.maxWidth - 20) / layers.cols;
      final cell = math.min(probe, widget.maxCell).clamp(8.0, 64.0);
      final label = (cell * 0.9).clamp(14.0, 24.0);
      final width = label + layers.cols * cell + 2;
      final height = label + layers.rows * cell + 2;

      final board = GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapUp: widget.onCellTap == null
            ? null
            : (details) {
                final c = ((details.localPosition.dx - label) / cell).floor();
                final r = ((details.localPosition.dy - label) / cell).floor();
                if (c >= 0 && r >= 0 && c < layers.cols && r < layers.rows) widget.onCellTap!(c, r);
              },
        child: RepaintBoundary(
          child: AnimatedBuilder(
            animation: Listenable.merge([_shot, _time]),
            builder: (context, _) => CustomPaint(
              size: Size(width, height),
              painter: BattleGridPainter(
                layers: layers,
                art: art,
                cell: cell,
                label: label,
                time: _time.value,
                shotT: _shot.isAnimating ? _shot.value : null,
              ),
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
