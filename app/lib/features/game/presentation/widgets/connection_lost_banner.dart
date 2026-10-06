import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

/// Aviso tranquilo cuando se cae el internet: el jugador NO sale de la sala,
/// su puesto y sus puntos lo esperan hasta que vuelva la conexion.
class ConnectionLostBanner extends StatelessWidget {
  final bool visible;

  const ConnectionLostBanner({super.key, required this.visible});

  @override
  Widget build(BuildContext context) {
    return AnimatedSize(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutExpo,
      child: !visible
          ? const SizedBox(width: double.infinity)
          : Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.accentAmber.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.accentAmber.withValues(alpha: 0.6)),
              ),
              child: Row(
                children: [
                  const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2.4, color: AppColors.accentAmber),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Sin internet. Te guardamos tu lugar mientras reconectamos...',
                      style: AppTypography.bodySmall.copyWith(color: AppColors.textPrimary),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
