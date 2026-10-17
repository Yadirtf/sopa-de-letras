import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';

/// "¡Tu turno!" o "Turno de Ana", con la cuenta regresiva de 30 segundos.
class TurnBanner extends StatefulWidget {
  final bool myTurn;
  final String enemyName;
  final DateTime? endsAt;

  /// Se llama una vez por segundo en los últimos 5 segundos de MI turno (para el tic).
  final VoidCallback? onFinalSecond;

  const TurnBanner({super.key, required this.myTurn, required this.enemyName, this.endsAt, this.onFinalSecond});

  @override
  State<TurnBanner> createState() => _TurnBannerState();
}

class _TurnBannerState extends State<TurnBanner> {
  // Se crea en initState: un `late final` sin leer nunca arrancaba y el reloj se quedaba quieto.
  Timer? _tick;
  int _lastLeft = -1;

  int get _left => widget.endsAt == null ? 0 : widget.endsAt!.difference(DateTime.now()).inSeconds.clamp(0, 99);

  @override
  void initState() {
    super.initState();
    _tick = Timer.periodic(const Duration(milliseconds: 250), (_) {
      if (!mounted) return;
      final left = _left;
      if (widget.myTurn && left != _lastLeft && left > 0 && left <= 5) widget.onFinalSecond?.call();
      _lastLeft = left;
      setState(() {});
    });
  }

  @override
  void dispose() {
    _tick?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final left = _left;
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
        Icon(widget.myTurn ? Icons.gps_fixed_rounded : Icons.hourglass_top_rounded, color: color, size: 24),
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
