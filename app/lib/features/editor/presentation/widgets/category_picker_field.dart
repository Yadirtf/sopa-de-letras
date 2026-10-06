import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../catalog/presentation/widgets/catalog_visual_style.dart';
import '../../domain/entities/category_entity.dart';
import 'category_picker_sheet.dart';

/// Campo "Tema": muestra el elegido con su icono y color, y al tocarlo abre
/// el buscador donde también se puede crear un tema nuevo.
class CategoryPickerField extends StatelessWidget {
  final CategoryEntity? selected;
  final ValueChanged<CategoryEntity> onChanged;

  const CategoryPickerField({super.key, required this.selected, required this.onChanged});

  Future<void> _open(BuildContext context) async {
    final picked = await showCategoryPicker(context, selected: selected);
    if (picked != null) onChanged(picked);
  }

  @override
  Widget build(BuildContext context) {
    final category = selected;
    final style = category == null ? null : CatalogVisualStyle.category(category.key);
    final color = style?.color ?? AppColors.accentCyan;

    return Semantics(
      button: true,
      label: category == null ? 'Elegir tema' : 'Tema: ${category.label}. Toca para cambiarlo',
      child: Material(
        color: category == null ? AppColors.bgCard : color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _open(context),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: category == null ? AppColors.borderGlow : color),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: color.withValues(alpha: 0.2),
                  child: Icon(style?.icon ?? Icons.travel_explore_rounded, color: color),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Tema', style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
                      const SizedBox(height: 2),
                      Text(
                        category?.label ?? 'Busca o crea un tema',
                        style: AppTypography.bodyLarge.copyWith(
                          color: category == null ? AppColors.textSecondary : AppColors.textPrimary,
                          fontWeight: category == null ? FontWeight.w400 : FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(category == null ? 'Elegir' : 'Cambiar', style: AppTypography.labelBold.copyWith(color: color)),
                Icon(Icons.chevron_right_rounded, color: color),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
