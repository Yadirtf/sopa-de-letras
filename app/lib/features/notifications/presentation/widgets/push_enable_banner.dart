import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/push_actions.dart';
import '../providers/push_providers.dart';

/// Recordatorio en el centro de notificaciones cuando los avisos del
/// teléfono están apagados: un toque y se activan.
class PushEnableBanner extends ConsumerWidget {
  const PushEnableBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (ref.watch(pushEnabledProvider) != false) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 4),
      padding: const EdgeInsets.fromLTRB(16, 14, 12, 14),
      decoration: BoxDecoration(
        color: AppColors.accentViolet.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderGlow),
      ),
      child: Row(
        children: [
          const Icon(Icons.notifications_off_rounded, color: AppColors.accentAmber, size: 30),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Activa los avisos para enterarte cuando un amigo te invite a jugar.',
              style: AppTypography.bodyMedium.copyWith(color: AppColors.textPrimary, height: 1.35),
            ),
          ),
          const SizedBox(width: 8),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.accentViolet,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () => enablePushNotifications(ref),
            child: const Text('Activar'),
          ),
        ],
      ),
    );
  }
}
