import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../social/presentation/providers/friends_notifier.dart';

/// "Amigos" arriba a la derecha: pastilla con icono y palabra, un punto verde
/// con cuántos están en línea y el globo rojo si hay solicitudes por responder.
class HomeFriendsButton extends ConsumerWidget {
  const HomeFriendsButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final online = ref.watch(friendsNotifierProvider.select((s) => s.availableCount));
    final pending = ref.watch(friendsNotifierProvider.select((s) => s.incoming.length));

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Badge(
        isLabelVisible: pending > 0,
        backgroundColor: AppColors.accentRose,
        label: Text('$pending'),
        child: Material(
          color: AppColors.accentEmerald.withValues(alpha: 0.12),
          shape: StadiumBorder(side: BorderSide(color: AppColors.accentEmerald.withValues(alpha: 0.5))),
          child: InkWell(
            customBorder: const StadiumBorder(),
            onTap: () => context.push('/friends', extra: {'tab': pending > 0 ? 1 : 0}),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.group_rounded, size: 20, color: AppColors.accentEmerald),
                  const SizedBox(width: 6),
                  Text('Amigos', style: AppTypography.labelBold.copyWith(fontSize: 13)),
                  if (online > 0) ...[
                    const SizedBox(width: 6),
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(color: AppColors.accentEmerald, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 3),
                    Text('$online', style: AppTypography.caption.copyWith(color: AppColors.accentEmerald)),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
