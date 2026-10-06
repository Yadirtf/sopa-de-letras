import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../catalog/presentation/widgets/catalog_visual_style.dart';
import '../../domain/entities/category_entity.dart';

/// Piezas del buscador de temas (ver `category_picker_sheet.dart`).
class CategorySearchInput extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  const CategorySearchInput({super.key, required this.controller, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      autofocus: true,
      onChanged: onChanged,
      textCapitalization: TextCapitalization.sentences,
      style: AppTypography.bodyLarge.copyWith(color: AppColors.textPrimary),
      decoration: InputDecoration(
        hintText: 'Ej. Dinosaurios, Frutas, Planetas…',
        prefixIcon: const Icon(Icons.search_rounded, color: AppColors.accentCyan),
        filled: true,
        fillColor: AppColors.bgCard,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.accentCyan, width: 1.5),
        ),
      ),
    );
  }
}

class CreateCategoryTile extends StatelessWidget {
  final String name;
  final bool busy;
  final VoidCallback onTap;

  const CreateCategoryTile({super.key, required this.name, required this.busy, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Material(
        color: AppColors.accentViolet.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(16),
        child: ListTile(
          onTap: busy ? null : onTap,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppColors.accentViolet),
          ),
          leading: busy
              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2.5))
              : const Icon(Icons.add_circle_rounded, color: AppColors.accentViolet, size: 28),
          title: Text('Crear el tema «$name»', style: AppTypography.labelBold.copyWith(color: AppColors.textPrimary)),
          subtitle: Text('No existe todavía: tú lo estrenas',
              style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
        ),
      ),
    );
  }
}

class CategoryResultsList extends StatelessWidget {
  final List<CategoryEntity> items;
  final String? selectedKey;
  final ValueChanged<CategoryEntity> onSelected;

  const CategoryResultsList({super.key, required this.items, required this.onSelected, this.selectedKey});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text('No encontramos ese tema.\nEscríbelo completo y créalo arriba.',
              textAlign: TextAlign.center, style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary)),
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(8, 4, 8, 24),
      itemCount: items.length,
      itemBuilder: (context, i) {
        final category = items[i];
        final style = CatalogVisualStyle.category(category.key);
        final selected = category.key == selectedKey;
        final count = category.usageCount;
        return ListTile(
          onTap: () => onSelected(category),
          minVerticalPadding: 12,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          selected: selected,
          selectedTileColor: style.color.withValues(alpha: 0.12),
          leading: CircleAvatar(
            backgroundColor: style.color.withValues(alpha: 0.18),
            child: Icon(style.icon, color: style.color),
          ),
          title: Text(category.label, style: AppTypography.bodyLarge.copyWith(color: AppColors.textPrimary)),
          subtitle: Text(
              count == 0
                  ? 'Aún sin sopas'
                  : count == 1
                      ? '1 sopa'
                      : '$count sopas',
              style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
          trailing: selected ? Icon(Icons.check_circle_rounded, color: style.color) : null,
        );
      },
    );
  }
}

class CategoryLoadError extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const CategoryLoadError({super.key, required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(message, style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          TextButton.icon(onPressed: onRetry, icon: const Icon(Icons.refresh_rounded), label: const Text('Reintentar')),
        ],
      ),
    );
  }
}
