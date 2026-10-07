import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

/// Tarjeta amable que explica para qué sirven los avisos antes de que
/// aparezca el diálogo del sistema. Devuelve true si el usuario los quiere.
Future<bool> showPushPermissionSheet(BuildContext context) async {
  final accepted = await showModalBottomSheet<bool>(
    context: context,
    backgroundColor: AppColors.bgCard,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
    builder: (context) => const _PushPermissionSheet(),
  );
  return accepted ?? false;
}

class _PushPermissionSheet extends StatelessWidget {
  const _PushPermissionSheet();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 28, 24, 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 84,
              height: 84,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.accentViolet.withValues(alpha: 0.18),
                border: Border.all(color: AppColors.borderGlow, width: 2),
              ),
              child: const Icon(Icons.notifications_active_rounded, size: 44, color: AppColors.accentAmber),
            ),
            const SizedBox(height: 20),
            Text(
              '¿Te avisamos cuando te inviten a jugar?',
              textAlign: TextAlign.center,
              style: AppTypography.heading2.copyWith(fontSize: 22),
            ),
            const SizedBox(height: 12),
            Text(
              'Así sabrás al momento si un amigo te invita a una partida o quiere ser tu amigo, '
              '${kIsWeb ? 'aunque estés en otra pestaña' : 'aunque WordHive esté cerrada'}.',
              textAlign: TextAlign.center,
              style: AppTypography.bodyLarge.copyWith(color: AppColors.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: FilledButton.icon(
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.accentViolet,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                ),
                onPressed: () => Navigator.of(context).pop(true),
                icon: const Icon(Icons.check_circle_rounded),
                label:
                    Text('¡Sí, avísame!', style: AppTypography.labelBold.copyWith(fontSize: 17, color: Colors.white)),
              ),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: Text('Ahora no', style: AppTypography.bodyLarge.copyWith(color: AppColors.textSecondary)),
            ),
          ],
        ),
      ),
    );
  }
}
