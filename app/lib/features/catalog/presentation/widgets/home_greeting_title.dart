import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_avatars.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/icon_badge.dart';
import '../../../auth/presentation/providers/auth_notifier.dart';

/// Saludo con el avatar y el nombre del jugador: la app le habla a él.
class HomeGreetingTitle extends ConsumerWidget {
  const HomeGreetingTitle({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authNotifierProvider.select((s) => s.user));
    final firstName = (user?.name.trim().split(RegExp(r'\s+')).first ?? '');
    final avatar = AppAvatars.of(user?.avatarUrl);

    return Row(
      children: [
        IconBadge(icon: avatar.icon, color: avatar.color, size: 38),
        const SizedBox(width: 10),
        Flexible(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                firstName.isEmpty ? '¡Hola!' : '¡Hola, $firstName!',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.titleMedium.copyWith(fontSize: 18),
              ),
              Text(
                '¿Qué sopa jugamos hoy?',
                style: AppTypography.caption.copyWith(color: AppColors.textSecondary, fontSize: 12),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
