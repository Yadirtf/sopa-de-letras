import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/widgets/avatar_selector_widget.dart';
import '../../domain/entities/social_entities.dart';

/// Avatar circular con emoji y, opcionalmente, el puntito de presencia.
/// Reutiliza el catálogo de avatares del registro para que cada jugador
/// se vea igual en su perfil, en la lista de amigos y en las invitaciones.
class PlayerAvatar extends StatelessWidget {
  final String? avatarId;
  final double size;
  final PresenceStatus? status;

  const PlayerAvatar({super.key, required this.avatarId, this.size = 48, this.status});

  static String emojiFor(String? avatarId) {
    final match = AvatarSelectorWidget.avatars.where((a) => a['id'] == avatarId).firstOrNull;
    return match?['icon'] ?? '🐝';
  }

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
          Container(
            width: size,
            height: size,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.bgSecondary,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.borderGlow),
            ),
            child: Text(emojiFor(avatarId), style: TextStyle(fontSize: size * 0.5)),
          ),
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
