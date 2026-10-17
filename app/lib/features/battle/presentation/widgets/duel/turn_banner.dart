import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';

/// "¡Tu turno!" o "Turno de Ana", con la cuenta regresiva de 30 segundos.
class TurnBanner extends StatefulWidget {
  final bool myTurn;
  final String enemyName;
  final DateTime? endsAt;

  const TurnBanner({super.key, required this.myTurn, required this.enemyName, this.endsAt});

  @override
  State<TurnBanner> createState() => _TurnBannerState();
}

class _TurnBannerState extends State<TurnBanner> {
  late final Timer _tick = Timer.periodic(const Duration(milliseconds: 500), (_) {
    if (mounted) setState(() {});
  });

  @override
  void dispose() {
    _tick.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final left = widget.endsAt == null ? 0 : widget.endsAt!.difference(DateTime.now()).inSeconds.clamp(0, 99);
    final color = widget.myTurn ? AppColors.accentEmerald : AppColors.accentCyan;
    final urgent = widget.myTurn && left <= 10;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: (urgent ? AppColors.accentRose : color).withValues(alpha: 0.7)),
      ),
      child: Row(children: [
        Text(widget.myTurn ? '🎯' : '⏳', style: const TextStyle(fontSize: 22)),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            widget.myTurn ? '¡Tu turno! Elige arma y casilla.' : 'Turno de ${widget.enemyName}…',
            key: const ValueKey('battle-turn-text'),
            style: AppTypography.labelBold.copyWith(fontSize: 15),
          ),
        ),
        Text(
          '$left s',
          style: AppTypography.titleMedium.copyWith(color: urgent ? AppColors.accentRose : color, fontSize: 18),
        ),
      ]),
    );
  }
}
