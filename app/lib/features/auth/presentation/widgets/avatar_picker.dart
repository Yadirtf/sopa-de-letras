import 'package:flutter/material.dart';
import '../../../../core/avatars/app_avatars.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/avatar_view.dart';
import 'avatar_category_bar.dart';

/// Selector de avatares: arriba las familias, abajo los avatares de la
/// familia elegida. Necesita altura acotada (va dentro de un `Expanded`).
class AvatarPicker extends StatefulWidget {
  final String? selectedId;
  final ValueChanged<String> onSelected;

  const AvatarPicker({super.key, required this.selectedId, required this.onSelected});

  @override
  State<AvatarPicker> createState() => _AvatarPickerState();
}

class _AvatarPickerState extends State<AvatarPicker> {
  // Abre en la familia del avatar actual: quien ya tiene uno lo ve marcado.
  late AvatarCategory _category = AppAvatars.of(widget.selectedId).category;

  @override
  Widget build(BuildContext context) {
    final selected = AppAvatars.of(widget.selectedId).id;
    final avatars = AppAvatars.inCategory(_category);

    return Column(
      children: [
        AvatarCategoryBar(selected: _category, onSelected: (c) => setState(() => _category = c)),
        const SizedBox(height: 12),
        Expanded(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 250),
            child: GridView.builder(
              key: ValueKey(_category.key),
              padding: const EdgeInsets.fromLTRB(4, 4, 4, 16),
              gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: 88,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
              ),
              itemCount: avatars.length,
              itemBuilder: (_, i) => _AvatarTile(
                avatar: avatars[i],
                isSelected: avatars[i].id == selected,
                onTap: () => widget.onSelected(avatars[i].id),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _AvatarTile extends StatelessWidget {
  final AvatarOption avatar;
  final bool isSelected;
  final VoidCallback onTap;

  const _AvatarTile({required this.avatar, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: isSelected,
      label: avatar.name,
      excludeSemantics: true,
      child: GestureDetector(
        onTap: onTap,
        child: LayoutBuilder(
          builder: (_, box) => Stack(
            clipBehavior: Clip.none,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: isSelected ? AppColors.accentViolet : Colors.transparent, width: 3),
                  boxShadow: isSelected
                      ? [BoxShadow(color: AppColors.accentViolet.withValues(alpha: 0.5), blurRadius: 12)]
                      : null,
                ),
                child: AvatarView(avatarId: avatar.id, size: box.maxWidth - 12),
              ),
              if (isSelected)
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    padding: const EdgeInsets.all(3),
                    decoration: BoxDecoration(
                      color: AppColors.accentViolet,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.bgPrimary, width: 2),
                    ),
                    child: const Icon(Icons.check_rounded, size: 16, color: Colors.white),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
