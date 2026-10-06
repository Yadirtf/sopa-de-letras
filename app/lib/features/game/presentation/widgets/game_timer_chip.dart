import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

/// Reloj de la partida: cuenta hacia atras si hay limite de tiempo y hacia
/// adelante si no. Se pone rojo en los ultimos 30 segundos.
class GameTimerChip extends StatefulWidget {
  final DateTime? startedAt;
  final int? timeLimitSeconds;

  const GameTimerChip({super.key, required this.startedAt, this.timeLimitSeconds});

  @override
  State<GameTimerChip> createState() => _GameTimerChipState();
}

class _GameTimerChipState extends State<GameTimerChip> {
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  static String _format(int totalSeconds) {
    final s = totalSeconds < 0 ? 0 : totalSeconds;
    return '${s ~/ 60}:${(s % 60).toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final started = widget.startedAt;
    final limit = widget.timeLimitSeconds ?? 0;
    final elapsed = started == null ? 0 : DateTime.now().difference(started).inSeconds;
    final countsDown = limit > 0;
    final remaining = limit - elapsed;
    final urgent = countsDown && started != null && remaining <= 30;
    final color = urgent ? AppColors.accentRose : AppColors.accentCyan;
    final label = started == null ? '--:--' : _format(countsDown ? remaining : elapsed);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: urgent ? 0.2 : 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.6)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(countsDown ? Icons.hourglass_bottom_rounded : Icons.timer_outlined, size: 16, color: color),
          const SizedBox(width: 4),
          Text(label,
              style:
                  AppTypography.labelLarge.copyWith(color: color, fontFeatures: const [FontFeature.tabularFigures()])),
        ],
      ),
    );
  }
}
