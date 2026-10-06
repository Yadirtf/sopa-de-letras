import 'package:flutter/material.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/social_entities.dart';
import 'player_avatar_widget.dart';

/// Texto de estado junto al color: así se entiende aunque alguien
/// no distinga el verde del ámbar (accesibilidad para daltonismo).
class PresenceLabel extends StatelessWidget {
  final PresenceStatus status;

  const PresenceLabel({super.key, required this.status});

  static String textFor(PresenceStatus status) => switch (status) {
        PresenceStatus.online => 'En línea · ¡Listo para jugar!',
        PresenceStatus.playing => 'Jugando una partida',
        PresenceStatus.offline => 'Desconectado',
      };

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      child: Text(
        textFor(status),
        key: ValueKey(status),
        style: AppTypography.bodySmall.copyWith(
          color: PlayerAvatar.colorFor(status),
          fontWeight: status.isAvailable ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
    );
  }
}
