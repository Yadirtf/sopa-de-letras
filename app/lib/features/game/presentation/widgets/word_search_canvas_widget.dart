import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/game_board_provider.dart';
import 'word_search_painter.dart';

/// Devuelve true si el trazo era una palabra valida (el tablero destella en verde).
typedef WordTraced = bool Function(String word, CellCoord start, CellCoord end);

/// El tablero donde se arrastra el dedo para marcar palabras.
///
/// Escucha punteros "crudos" (Listener) en vez de gestos: asi ningun scroll ni
/// gesto del sistema le roba el arrastre a mitad de palabra, y la primera letra
/// queda marcada en cuanto el dedo toca la pantalla.
class WordSearchCanvasWidget extends ConsumerStatefulWidget {
  final List<List<String>> grid;
  final List<FoundStroke> found;
  final WordTraced onWordTraced;
  final bool enabled;

  const WordSearchCanvasWidget({
    super.key,
    required this.grid,
    required this.found,
    required this.onWordTraced,
    this.enabled = true,
  });

  @override
  ConsumerState<WordSearchCanvasWidget> createState() => _WordSearchCanvasWidgetState();
}

class _WordSearchCanvasWidgetState extends ConsumerState<WordSearchCanvasWidget> {
  int? _pointer;
  List<CellCoord> _flashCells = const [];
  Color _flashColor = AppColors.accentEmerald;
  Timer? _flashTimer;

  @override
  void dispose() {
    _flashTimer?.cancel();
    super.dispose();
  }

  CellCoord _cellAt(Offset pos, double cell) {
    final rows = widget.grid.length;
    final cols = widget.grid.first.length;
    return CellCoord((pos.dy / cell).floor().clamp(0, rows - 1), (pos.dx / cell).floor().clamp(0, cols - 1));
  }

  void _down(PointerDownEvent e, double cell) {
    if (!widget.enabled || _pointer != null) return;
    _pointer = e.pointer;
    final c = _cellAt(e.localPosition, cell);
    ref.read(gameBoardProvider.notifier).startSelection(c.row, c.col, widget.grid);
  }

  void _move(PointerMoveEvent e, double cell) {
    if (e.pointer != _pointer) return;
    final c = _cellAt(e.localPosition, cell);
    ref.read(gameBoardProvider.notifier).updateSelection(c.row, c.col, widget.grid);
  }

  void _up(PointerEvent e) {
    if (e.pointer != _pointer) return;
    _pointer = null;
    final done = ref.read(gameBoardProvider.notifier).clearSelection();
    if (done.selectedCells.length < 2) return;
    final ok = widget.onWordTraced(done.formedWord, done.selectedCells.first, done.selectedCells.last);
    if (!ok) HapticFeedback.mediumImpact();
    _flash(done.selectedCells, ok ? AppColors.accentEmerald : AppColors.accentRose);
  }

  void _flash(List<CellCoord> cells, Color color) {
    _flashTimer?.cancel();
    setState(() {
      _flashCells = cells;
      _flashColor = color;
    });
    _flashTimer = Timer(const Duration(milliseconds: 450), () {
      if (mounted) setState(() => _flashCells = const []);
    });
  }

  @override
  Widget build(BuildContext context) {
    final grid = widget.grid;
    if (grid.isEmpty || grid.first.isEmpty) return const SizedBox.shrink();
    final selection = ref.watch(gameBoardProvider).selectedCells;
    final showing = selection.isNotEmpty ? selection : _flashCells;

    return LayoutBuilder(builder: (context, box) {
      final rows = grid.length;
      final cols = grid.first.length;
      final maxH = box.maxHeight.isFinite ? box.maxHeight : box.maxWidth * rows / cols;
      // -2: el borde de 1px a cada lado no debe desbordar el espacio disponible.
      final cell = math.min((box.maxWidth - 2) / cols, (maxH - 2) / rows);

      return Center(
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.bgCard.withValues(alpha: 0.85),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.borderGlow),
          ),
          child: Listener(
            behavior: HitTestBehavior.opaque,
            onPointerDown: (e) => _down(e, cell),
            onPointerMove: (e) => _move(e, cell),
            onPointerUp: _up,
            onPointerCancel: _up,
            child: CustomPaint(
              size: Size(cell * cols, cell * rows),
              painter: WordSearchPainter(
                grid: grid,
                cellSize: cell,
                found: widget.found,
                selectedCells: showing,
                selectionColor: selection.isNotEmpty ? AppColors.accentViolet : _flashColor,
              ),
            ),
          ),
        ),
      );
    });
  }
}
