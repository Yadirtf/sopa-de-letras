import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Un avatar de WordHive: icono Material redondeado + color de la paleta.
/// El `id` es lo que se guarda en el backend (`avatarUrl`), así que nunca
/// cambia aunque cambie el dibujo.
class AvatarOption {
  final String id;
  final String name;
  final IconData icon;
  final Color color;

  const AvatarOption(this.id, this.name, this.icon, this.color);
}

/// Catálogo único de avatares: registro, perfil, amigos e invitaciones
/// leen de aquí para que cada jugador se vea igual en todas partes.
abstract class AppAvatars {
  static const List<AvatarOption> all = [
    AvatarOption('bee_scout', 'Explorador', Icons.emoji_nature_rounded, AppColors.accentAmber),
    AvatarOption('bee_queen', 'Reina', Icons.workspace_premium_rounded, AppColors.accentViolet),
    AvatarOption('honey_pot', 'Panal', Icons.hive_rounded, AppColors.accentAmber),
    AvatarOption('lightning', 'Veloz', Icons.bolt_rounded, AppColors.accentCyan),
    AvatarOption('star', 'Estrella', Icons.star_rounded, AppColors.accentEmerald),
    AvatarOption('flower', 'Polen', Icons.local_florist_rounded, AppColors.accentRose),
  ];

  /// Avatar por id; si no existe (o es nulo) usamos la abeja exploradora.
  static AvatarOption of(String? id) => all.firstWhere((a) => a.id == id, orElse: () => all.first);
}
