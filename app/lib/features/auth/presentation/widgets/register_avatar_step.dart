import 'package:flutter/material.dart';
import '../../../../core/avatars/app_avatars.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/avatar_view.dart';
import 'avatar_picker.dart';

/// Paso 2 del registro: vista previa grande de cómo te verán tus amigos y,
/// debajo, el selector por categorías.
class RegisterAvatarStep extends StatelessWidget {
  final String name;
  final String avatarId;
  final ValueChanged<String> onSelected;
  final VoidCallback onContinue;

  const RegisterAvatarStep({
    super.key,
    required this.name,
    required this.avatarId,
    required this.onSelected,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    final avatar = AppAvatars.of(avatarId);
    return Column(
      children: [
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: Row(
            children: [
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 250),
                transitionBuilder: (child, anim) => ScaleTransition(scale: anim, child: child),
                child: AvatarView(key: ValueKey(avatar.id), avatarId: avatar.id, size: 72),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTypography.titleMedium),
                    const SizedBox(height: 2),
                    Text('${avatar.category.name} · ${avatar.name}', style: AppTypography.bodyMedium),
                    Text(
                      'Así te verán tus amigos',
                      style: AppTypography.bodyMedium.copyWith(fontSize: 12, color: AppColors.accentCyan),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Expanded(child: AvatarPicker(selectedId: avatarId, onSelected: onSelected)),
        const SizedBox(height: 8),
        SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton.icon(
            onPressed: onContinue,
            icon: const Icon(Icons.arrow_forward_rounded),
            label: const Text('Siguiente: crear mi PIN'),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}
