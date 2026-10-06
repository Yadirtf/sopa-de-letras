import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/preview_word_search_entity.dart';

/// Cuadrícula de muestra que se ajusta al ancho de la pantalla (sin scroll
/// lateral) y, si se quiere, resalta dónde quedó cada palabra.
class InteractiveGridPreview extends StatefulWidget {
  final PreviewWordSearchEntity preview;

  const InteractiveGridPreview({super.key, required this.preview});

  @override
  State<InteractiveGridPreview> createState() => _InteractiveGridPreviewState();
}

class _InteractiveGridPreviewState extends State<InteractiveGridPreview> {
  bool _showAnswers = true;

  Set<int> _answerCells() {
    final size = widget.preview.grid.length;
    final cells = <int>{};
    for (final w in widget.preview.placedWords) {
      final dr = (w.endRow - w.startRow).sign;
      final dc = (w.endCol - w.startCol).sign;
      final steps = math.max((w.endRow - w.startRow).abs(), (w.endCol - w.startCol).abs());
      for (var i = 0; i <= steps; i++) {
        cells.add((w.startRow + dr * i) * size + (w.startCol + dc * i));
      }
    }
    return cells;
  }

  @override
  Widget build(BuildContext context) {
    final grid = widget.preview.grid;
    final answers = _showAnswers ? _answerCells() : const <int>{};

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: AppColors.accentEmerald, size: 18),
            const SizedBox(width: 6),
            Expanded(
              child: Text('${widget.preview.placedWords.length} palabras escondidas',
                  style: AppTypography.labelBold.copyWith(color: AppColors.accentEmerald)),
            ),
            Text('Ver respuestas', style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
            Switch(
              value: _showAnswers,
              activeThumbColor: AppColors.accentEmerald,
              onChanged: (v) => setState(() => _showAnswers = v),
            ),
          ],
        ),
        const SizedBox(height: 8),
        LayoutBuilder(
          builder: (context, constraints) {
            final cell = math.min(32.0, constraints.maxWidth / math.max(1, grid.length));
            return Center(
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: AppColors.bgSecondary,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.borderGlow),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    for (var r = 0; r < grid.length; r++)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          for (var c = 0; c < grid[r].length; c++)
                            _Cell(
                                letter: grid[r][c],
                                size: cell - 0.5,
                                highlighted: answers.contains(r * grid.length + c)),
                        ],
                      ),
                  ],
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 8),
        Text('Es una muestra: al publicar, el orden de las letras puede cambiar.',
            textAlign: TextAlign.center, style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
      ],
    );
  }
}

class _Cell extends StatelessWidget {
  final String letter;
  final double size;
  final bool highlighted;

  const _Cell({required this.letter, required this.size, required this.highlighted});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: highlighted ? AppColors.accentEmerald.withValues(alpha: 0.3) : null,
        border: Border.all(color: AppColors.textMuted.withValues(alpha: 0.35), width: 0.5),
      ),
      child: Text(
        letter,
        style: AppTypography.caption.copyWith(
          fontSize: size * 0.5,
          fontWeight: FontWeight.bold,
          color: highlighted ? AppColors.textPrimary : AppColors.textSecondary,
        ),
      ),
    );
  }
}
