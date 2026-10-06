import 'package:flutter/material.dart';
import '../../../../core/theme/app_avatars.dart';
import '../../../../core/theme/app_colors.dart';

class AvatarSelectorWidget extends StatelessWidget {
  final String? selectedAvatar;
  final ValueChanged<String> onAvatarSelected;

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
        itemCount: AppAvatars.all.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (context, index) {
          final avatar = AppAvatars.all[index];
          final isSelected = selectedAvatar == avatar.id;

          return GestureDetector(
            onTap: () => onAvatarSelected(avatar.id),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 70,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.accentViolet.withValues(alpha: 0.2) : AppColors.bgCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? AppColors.accentViolet : AppColors.borderSubtle,
                  width: isSelected ? 2 : 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.accentViolet.withValues(alpha: 0.4),
                          blurRadius: 10,
                        ),
                      ]
                    : [],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(avatar.icon, size: 30, color: avatar.color),
                  const SizedBox(height: 4),
                  Text(
                    avatar.name,
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
