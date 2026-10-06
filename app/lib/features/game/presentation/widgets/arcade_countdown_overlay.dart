import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

/// Cuenta regresiva 3-2-1-¡A buscar! a pantalla completa.
///
/// El servidor solo avisa una vez ("faltan 3 segundos"), asi que el conteo lo
/// lleva este widget con su propio reloj. Antes mostraba siempre el mismo "3".
class ArcadeCountdownOverlay extends StatefulWidget {
  final int seconds;
  final VoidCallback onFinished;

  const ArcadeCountdownOverlay({super.key, required this.seconds, required this.onFinished});

  @override
  State<ArcadeCountdownOverlay> createState() => _ArcadeCountdownOverlayState();
}

class _ArcadeCountdownOverlayState extends State<ArcadeCountdownOverlay> {
  static const _goHold = Duration(milliseconds: 800);
  late int _count = widget.seconds;
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    HapticFeedback.mediumImpact();
    _ticker = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      setState(() => _count--);
      HapticFeedback.mediumImpact();
      if (_count <= 0) {
        t.cancel();
        _ticker = Timer(_goHold, widget.onFinished);
      }
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final go = _count <= 0;
    final color = go ? AppColors.accentEmerald : AppColors.accentAmber;

    return Container(
      color: AppColors.bgPrimary.withValues(alpha: 0.88),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            go ? '' : 'Prepárate...',
            style: AppTypography.heading2.copyWith(color: AppColors.textSecondary, fontSize: 20),
          ),
          const SizedBox(height: 24),
          TweenAnimationBuilder<double>(
            key: ValueKey(_count),
            tween: Tween(begin: 0.4, end: 1),
            duration: const Duration(milliseconds: 600),
            curve: Curves.elasticOut,
            builder: (context, value, child) => Transform.scale(scale: value, child: child),
            child: Container(
              width: go ? null : 150,
              height: go ? null : 150,
              padding: go ? const EdgeInsets.symmetric(horizontal: 32, vertical: 24) : null,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppColors.bgCard,
                shape: go ? BoxShape.rectangle : BoxShape.circle,
                borderRadius: go ? BorderRadius.circular(24) : null,
                border: Border.all(color: color, width: 4),
                boxShadow: [BoxShadow(color: color.withValues(alpha: 0.6), blurRadius: 36, spreadRadius: 4)],
              ),
              child: Text(
                go ? '¡A buscar!' : '$_count',
                style: AppTypography.displayLarge.copyWith(
                  color: color,
                  fontWeight: FontWeight.bold,
                  fontSize: go ? 40 : 72,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
