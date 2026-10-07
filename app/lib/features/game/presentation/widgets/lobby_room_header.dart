import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/avatar_view.dart';
import '../../domain/entities/game_room_entity.dart';

/// Cabecera del lobby: la sopa que se va a jugar y quien creo la sala (con su avatar).
class LobbyRoomHeader extends StatelessWidget {
  final GameRoomEntity room;

  const LobbyRoomHeader({super.key, required this.room});

  @override
  Widget build(BuildContext context) {
    final host = room.players.where((p) => p.userId == room.hostUserId).firstOrNull;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(room.wordSearchTitle, style: AppTypography.heading2.copyWith(fontSize: 20)),
        const SizedBox(height: 8),
        Row(
          children: [
            if (host != null) ...[
              AvatarView(avatarId: host.avatarUrl, size: 26),
              const SizedBox(width: 8),
            ],
            Expanded(
              child: Text.rich(
                key: const ValueKey('lobby-host-name'),
                TextSpan(
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                  children: [
                    if (host != null) ...[
                      const TextSpan(text: 'Sala de '),
                      TextSpan(
                        text: host.username,
                        style: const TextStyle(color: AppColors.accentAmber, fontWeight: FontWeight.bold),
                      ),
                      const TextSpan(text: '  ·  '),
                    ],
                    TextSpan(text: 'Jugadores: ${room.players.length} de ${room.maxPlayers}'),
                  ],
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
