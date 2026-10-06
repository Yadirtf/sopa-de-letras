import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../social/presentation/providers/friends_notifier.dart';

/// Atajos con icono Y texto debajo de la barra superior. Sustituyen a los
/// iconos sueltos del AppBar: un niño o un abuelo no tiene por qué adivinar
/// qué significa cada dibujito.
class HomeQuickActions extends ConsumerWidget {
  const HomeQuickActions({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final available = ref.watch(friendsNotifierProvider.select((s) => s.availableCount));
    final pendingRequests = ref.watch(friendsNotifierProvider.select((s) => s.incoming.length));

    return SizedBox(
      height: 52,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          _QuickAction(
            emoji: '👋',
            label: available > 0 ? 'Amigos · $available en línea' : 'Amigos',
            color: AppColors.accentEmerald,
            badge: pendingRequests,
            onTap: () => context.push('/friends', extra: {'tab': pendingRequests > 0 ? 1 : 0}),
          ),
          _QuickAction(emoji: '🔑', label: 'Unirme con código', color: AppColors.accentCyan, onTap: () => context.push('/join-room')),
          _QuickAction(emoji: '🧩', label: 'Mis sopas', color: AppColors.accentAmber, onTap: () => context.push('/my-creations')),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final String emoji;
  final String label;
  final Color color;
  final VoidCallback onTap;
  final int badge;

  const _QuickAction({required this.emoji, required this.label, required this.color, required this.onTap, this.badge = 0});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 10, top: 4, bottom: 4),
      child: Badge(
        isLabelVisible: badge > 0,
        label: Text('$badge'),
        backgroundColor: AppColors.accentRose,
        child: Material(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(22),
          child: InkWell(
            borderRadius: BorderRadius.circular(22),
            onTap: onTap,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: color.withValues(alpha: 0.5)),
              ),
              child: Text('$emoji  $label', style: AppTypography.labelBold.copyWith(color: AppColors.textPrimary)),
            ),
          ),
        ),
      ),
    );
  }
}
