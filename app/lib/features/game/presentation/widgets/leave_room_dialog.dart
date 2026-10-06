import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

/// Pregunta antes de abandonar: un toque accidental no debe sacar a nadie de la partida.
class LeaveRoomDialog {
  static Future<bool> confirm(BuildContext context, {required bool inGame}) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgCard,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        icon: const Icon(Icons.logout_rounded, color: AppColors.accentRose, size: 36),
        title: Text('¿Abandonar la sala?', style: AppTypography.heading2.copyWith(fontSize: 20)),
        content: Text(
          inGame
              ? 'Saldrás de la partida y perderás tu lugar en la carrera.'
              : 'Saldrás de la sala y tu lugar quedará libre para otro jugador.',
          style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary),
        ),
        actionsAlignment: MainAxisAlignment.spaceBetween,
        actions: [
          TextButton(
            key: const ValueKey('leave-cancel'),
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text('Seguir jugando', style: AppTypography.labelLarge.copyWith(color: AppColors.accentCyan)),
          ),
          ElevatedButton(
            key: const ValueKey('leave-confirm'),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentRose),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text('Abandonar', style: AppTypography.labelLarge.copyWith(color: Colors.white)),
          ),
        ],
      ),
    );
    return result ?? false;
  }
}
