import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_links.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

/// Plan B siempre visible: si el amigo no tiene cuenta o no aparece,
/// basta con dictarle o copiarle el código de la sala.
class ShareRoomCodeTile extends StatefulWidget {
  final String roomCode;

  const ShareRoomCodeTile({super.key, required this.roomCode});

  @override
  State<ShareRoomCodeTile> createState() => _ShareRoomCodeTileState();
}

class _ShareRoomCodeTileState extends State<ShareRoomCodeTile> {
  bool _copied = false;

  Future<void> _copy() async {
    await Clipboard.setData(ClipboardData(text: AppLinks.roomInvite(widget.roomCode)));
    HapticFeedback.selectionClick();
    if (!mounted) return;
    setState(() => _copied = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _copied = false);
  }

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      leading: const Icon(Icons.vpn_key_rounded, color: AppColors.accentAmber),
      title: Text('¿Tu amigo no aparece? Pásale el código', style: AppTypography.bodySmall),
      subtitle:
          Text(widget.roomCode, style: AppTypography.pinKey.copyWith(color: AppColors.accentAmber, letterSpacing: 4)),
      trailing: TextButton.icon(
        icon: Icon(_copied ? Icons.check_rounded : Icons.copy_rounded, size: 18),
        label: Text(_copied ? '¡Copiado!' : 'Copiar'),
        onPressed: _copy,
      ),
    );
  }
}
