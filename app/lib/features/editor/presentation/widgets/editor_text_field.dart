import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

/// Campo de texto del editor con la etiqueta encima (más legible que la
/// etiqueta flotante para personas mayores o con poca visión).
class EditorTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String hint;
  final ValueChanged<String> onChanged;

  const EditorTextField({
    super.key,
    required this.controller,
    required this.label,
    required this.hint,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(label, style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          onChanged: onChanged,
          maxLength: 60,
          textCapitalization: TextCapitalization.sentences,
          style: AppTypography.bodyLarge.copyWith(color: AppColors.textPrimary),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: AppTypography.bodyMedium.copyWith(color: AppColors.textMuted),
            counterText: '',
            filled: true,
            fillColor: AppColors.bgSecondary,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: AppColors.accentCyan, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}
