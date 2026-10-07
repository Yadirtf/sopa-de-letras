import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import 'celebration_painters.dart';

/// Fondo de ganador: noche violeta profunda, haces dorados girando y confeti.
/// Si el sistema pide reducir animaciones, se queda quieto (pero igual de elegante).
class CelebrationBackground extends StatefulWidget {
  final Widget child;
  final bool confetti;

  const CelebrationBackground({super.key, required this.child, this.confetti = true});

  @override
  State<CelebrationBackground> createState() => _CelebrationBackgroundState();
}

class _CelebrationBackgroundState extends State<CelebrationBackground> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(vsync: this, duration: const Duration(seconds: 24));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final still = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    if (still) {
      _controller.stop();
    } else if (!_controller.isAnimating) {
      _controller.repeat();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF2A1458), Color(0xFF150B33), AppColors.bgPrimary],
          stops: [0, 0.45, 1],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: RepaintBoundary(
              child: AnimatedBuilder(
                animation: _controller,
                builder: (_, __) => CustomPaint(
                  painter: WinnerRaysPainter(t: _controller.value),
                  foregroundPainter: widget.confetti ? ConfettiPainter(t: _controller.value) : null,
                ),
              ),
            ),
          ),
          widget.child,
        ],
      ),
    );
  }
}
