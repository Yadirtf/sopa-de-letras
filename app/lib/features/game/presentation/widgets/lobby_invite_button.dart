import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../social/presentation/widgets/invite_friends_sheet.dart';

/// Boton ambar para invitar amigos mientras quedan puestos libres en la sala.
class LobbyInviteButton extends StatelessWidget {
  final String roomCode;

  const LobbyInviteButton({super.key, required this.roomCode});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextButton.icon(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.accentAmber,
          minimumSize: const Size.fromHeight(48),
          backgroundColor: AppColors.accentAmber.withValues(alpha: 0.1),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
        onPressed: () => InviteFriendsSheet.show(context, roomCode),
        icon: const Icon(Icons.person_add_alt_1_rounded),
        label: Text('Invitar amigos', style: AppTypography.labelLarge.copyWith(color: AppColors.accentAmber)),
      ),
    );
  }
}
