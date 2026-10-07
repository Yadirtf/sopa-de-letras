import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

/// Casilla grande para el código de sala. En el navegador, Enter también entra.
class RoomCodeField extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSubmitted;

  const RoomCodeField({super.key, required this.controller, required this.onSubmitted});

  OutlineInputBorder _border(Color color, [double width = 1]) => OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: color, width: width),
      );

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      textAlign: TextAlign.center,
      textCapitalization: TextCapitalization.characters,
      textInputAction: TextInputAction.go,
      onSubmitted: (_) => onSubmitted(),
      maxLength: 6,
      style: AppTypography.heading1.copyWith(color: AppColors.accentCyan, letterSpacing: 8, fontSize: 28),
      decoration: InputDecoration(
        hintText: 'HIVE92',
        hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.5)),
        counterText: '',
        filled: true,
        fillColor: AppColors.bgCard,
        border: _border(AppColors.borderGlow),
        enabledBorder: _border(AppColors.borderSubtle),
        focusedBorder: _border(AppColors.accentViolet, 2),
      ),
    );
  }
}
