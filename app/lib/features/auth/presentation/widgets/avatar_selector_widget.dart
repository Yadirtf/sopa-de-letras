import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class AvatarSelectorWidget extends StatelessWidget {
  final String? selectedAvatar;
  final ValueChanged<String> onAvatarSelected;

  static const List<Map<String, String>> avatars = [
    {'id': 'bee_scout', 'name': 'Explorador', 'icon': '🐝'},
    {'id': 'bee_queen', 'name': 'Reina', 'icon': '👑'},
    {'id': 'honey_pot', 'name': 'Panal', 'icon': '🍯'},
    {'id': 'lightning', 'name': 'Veloz', 'icon': '⚡'},
    {'id': 'star', 'name': 'Estrella', 'icon': '⭐'},
    {'id': 'flower', 'name': 'Polen', 'icon': '🌸'},
  ];

  const AvatarSelectorWidget({
    super.key,
    required this.selectedAvatar,
    required this.onAvatarSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 90,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: avatars.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (context, index) {
          final avatar = avatars[index];
          final isSelected = selectedAvatar == avatar['id'];

          return GestureDetector(
            onTap: () => onAvatarSelected(avatar['id']!),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 70,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.accentViolet.withOpacity(0.2) : AppColors.bgCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? AppColors.accentViolet : AppColors.borderSubtle,
                  width: isSelected ? 2 : 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.accentViolet.withOpacity(0.4),
                          blurRadius: 10,
                        ),
                      ]
                    : [],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(avatar['icon']!, style: const TextStyle(fontSize: 28)),
                  const SizedBox(height: 4),
                  Text(
                    avatar['name']!,
                    style: TextStyle(
                      fontSize: 10,
                      color: isSelected ? AppColors.accentViolet : AppColors.textSecondary,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
