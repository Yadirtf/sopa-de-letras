import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/game_room_entity.dart';

class RoomCreatedCardWidget extends StatelessWidget {
  final GameRoomEntity room;

  const RoomCreatedCardWidget({super.key, required this.room});

  void _copyToClipboard(BuildContext context, String text, String message) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.accentEmerald),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text('¡Tu Sala está Lista!', style: AppTypography.heading1.copyWith(fontSize: 24)),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.accentViolet, width: 2),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(room.code, style: AppTypography.heading1.copyWith(color: AppColors.accentCyan, letterSpacing: 4)),
              const SizedBox(width: 12),
              IconButton(
                icon: const Icon(Icons.copy_rounded, color: AppColors.textPrimary),
                onPressed: () => _copyToClipboard(context, room.code, 'Código copiado'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
          child: QrImageView(data: 'https://wordhive.app/room/${room.code}', size: 180, version: QrVersions.auto),
        ),
        const SizedBox(height: 24),
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.accentEmerald,
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          icon: const Icon(Icons.meeting_room_rounded, color: Colors.white),
          label: Text('Ir al Lobby', style: AppTypography.labelLarge.copyWith(color: Colors.white)),
          onPressed: () => context.go('/lobby/${room.code}'),
        ),
      ],
    );
  }
}
