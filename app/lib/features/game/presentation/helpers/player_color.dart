import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Color de un jugador a partir de su "#RRGGBB" del servidor (violeta si viene mal).
Color playerColor(String hex) {
  final value = int.tryParse(hex.replaceFirst('#', ''), radix: 16);
  return value == null ? AppColors.accentViolet : Color(0xFF000000 | value);
}
