import 'package:flutter/material.dart';
import '../../../../core/theme/app_avatars.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/icon_badge.dart';
import '../../domain/entities/user_entity.dart';

/// Cabecera del perfil: avatar grande, nombre, correo y, si aplica, la
/// etiqueta de invitado.
class ProfileHeaderWidget extends StatelessWidget {
  final UserEntity user;

  const ProfileHeaderWidget({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    final avatar = AppAvatars.of(user.avatarUrl);

    return Column(
      children: [
        Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.bottomCenter,
          children: [
            IconBadge(icon: avatar.icon, color: avatar.color, size: 104),
            if (user.isGuest)
              Positioned(
                bottom: -8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: AppColors.accentAmber, borderRadius: BorderRadius.circular(10)),
                  child: const Text(
                    'INVITADO',
                    style: TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 16),
        Text(user.name, style: AppTypography.titleLarge, textAlign: TextAlign.center),
        if (!user.isGuest) ...[
          const SizedBox(height: 2),
          Text(user.email, style: AppTypography.bodyMedium, textAlign: TextAlign.center),
        ],
      ],
    );
  }
}
