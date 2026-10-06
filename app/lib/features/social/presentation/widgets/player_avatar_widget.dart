import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/avatar_view.dart';
import '../../domain/entities/social_entities.dart';

/// Avatar circular y, opcionalmente, el puntito de presencia.
/// Reutiliza el catálogo de avatares del registro para que cada jugador
/// se vea igual en su perfil, en la lista de amigos y en las invitaciones.
class PlayerAvatar extends StatelessWidget {
  final String? avatarId;
  final double size;
  final PresenceStatus? status;

  const PlayerAvatar({super.key, required this.avatarId, this.size = 48, this.status});

  static Color colorFor(PresenceStatus status) => switch (status) {
        PresenceStatus.online => AppColors.accentEmerald,
        PresenceStatus.playing => AppColors.accentAmber,
        PresenceStatus.offline => AppColors.textMuted,
      };

  @override
  Widget build(BuildContext context) {
    final dot = size * 0.3;
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          AvatarView(avatarId: avatarId, size: size),
          if (status != null)
            Positioned(
              right: -1,
              bottom: -1,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: dot,
                height: dot,
                decoration: BoxDecoration(
                  color: colorFor(status!),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.bgCard, width: 2.5),
                  boxShadow: status!.isAvailable
                      ? [BoxShadow(color: colorFor(status!).withValues(alpha: 0.6), blurRadius: 6)]
                      : null,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
