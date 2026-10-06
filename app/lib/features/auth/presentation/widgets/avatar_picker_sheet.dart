import 'package:flutter/material.dart';
import '../../../../core/avatars/app_avatars.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/avatar_view.dart';
import 'avatar_picker.dart';

/// Abre el selector de avatares a casi toda la pantalla y devuelve el id
/// elegido, o `null` si el jugador cierra sin confirmar.
Future<String?> showAvatarPickerSheet(BuildContext context, {required String? currentId}) {
  return showModalBottomSheet<String>(
    context: context,
    useRootNavigator: true,
    isScrollControlled: true,
    backgroundColor: AppColors.bgSecondary,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
    builder: (_) => FractionallySizedBox(heightFactor: 0.88, child: _AvatarPickerSheet(initialId: currentId)),
  );
}

class _AvatarPickerSheet extends StatefulWidget {
  final String? initialId;

  const _AvatarPickerSheet({required this.initialId});

  @override
  State<_AvatarPickerSheet> createState() => _AvatarPickerSheetState();
}

class _AvatarPickerSheetState extends State<_AvatarPickerSheet> {
  late String _selected = AppAvatars.of(widget.initialId).id;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(color: AppColors.textMuted, borderRadius: BorderRadius.circular(2)),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                AvatarView(avatarId: _selected, size: 56),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Elige tu avatar', style: AppTypography.titleMedium.copyWith(fontSize: 20)),
                      Text(AppAvatars.of(_selected).name, style: AppTypography.bodyMedium),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(child: AvatarPicker(selectedId: _selected, onSelected: (id) => setState(() => _selected = id))),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: () => Navigator.of(context).pop(_selected),
                icon: const Icon(Icons.check_rounded),
                label: const Text('Usar este avatar'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
