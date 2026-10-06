import 'package:flutter/material.dart';
import '../../../../core/avatars/app_avatars.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/avatar_view.dart';

/// Fila de familias de avatares. Cada una se muestra con un avatar de
/// ejemplo, no solo con un nombre: así hasta quien aún no lee sabe qué hay.
class AvatarCategoryBar extends StatelessWidget {
  final AvatarCategory selected;
  final ValueChanged<AvatarCategory> onSelected;

  const AvatarCategoryBar({super.key, required this.selected, required this.onSelected});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 96,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        itemCount: AppAvatars.categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final category = AppAvatars.categories[i];
          final isSelected = category.key == selected.key;
          return Semantics(
            button: true,
            selected: isSelected,
            label: 'Categoría ${category.name}',
            excludeSemantics: true,
            child: GestureDetector(
              onTap: () => onSelected(category),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 96,
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? category.color.withValues(alpha: 0.22) : AppColors.bgCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected ? category.color : AppColors.borderSubtle,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    AvatarView(avatarId: '${category.key}_01', size: 44),
                    const SizedBox(height: 6),
                    Text(
                      category.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        color: isSelected ? AppColors.textPrimary : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
