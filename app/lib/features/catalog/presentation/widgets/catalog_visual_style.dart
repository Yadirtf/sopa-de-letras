import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Cara visible de una categoría o dificultad: icono, color y nombre bonito.
/// Las tarjetas del inicio se pintan con esto para que cada tema se
/// reconozca de un vistazo, incluso antes de saber leer bien.
class CatalogVisualStyle {
  final IconData icon;
  final Color color;
  final String label;

  const CatalogVisualStyle(this.icon, this.color, this.label);

  static const _categories = {
    'NATURALEZA': CatalogVisualStyle(Icons.eco_rounded, AppColors.accentEmerald, 'Naturaleza'),
    'CIENCIA': CatalogVisualStyle(Icons.science_rounded, AppColors.accentCyan, 'Ciencia'),
    'TECNOLOGIA': CatalogVisualStyle(Icons.memory_rounded, AppColors.accentViolet, 'Tecnología'),
    'HISTORIA': CatalogVisualStyle(Icons.account_balance_rounded, AppColors.accentAmber, 'Historia'),
    'ARTE': CatalogVisualStyle(Icons.palette_rounded, AppColors.accentRose, 'Arte'),
    'DEPORTES': CatalogVisualStyle(Icons.sports_soccer_rounded, AppColors.accentEmerald, 'Deportes'),
    'ANIMALES': CatalogVisualStyle(Icons.pets_rounded, AppColors.accentAmber, 'Animales'),
    'COMIDA': CatalogVisualStyle(Icons.restaurant_rounded, AppColors.accentRose, 'Comida'),
    'GEOGRAFIA': CatalogVisualStyle(Icons.public_rounded, AppColors.accentCyan, 'Geografía'),
    'MUSICA': CatalogVisualStyle(Icons.music_note_rounded, AppColors.accentViolet, 'Música'),
  };

  static const _difficulties = {
    'EASY': CatalogVisualStyle(Icons.sentiment_satisfied_alt_rounded, AppColors.accentEmerald, 'Fácil'),
    'MEDIUM': CatalogVisualStyle(Icons.local_fire_department_rounded, AppColors.accentAmber, 'Medio'),
    'HARD': CatalogVisualStyle(Icons.bolt_rounded, AppColors.accentRose, 'Difícil'),
  };

  static CatalogVisualStyle category(String raw) {
    final key = raw.toUpperCase();
    return _categories[key] ?? CatalogVisualStyle(Icons.extension_rounded, AppColors.accentViolet, _capitalize(raw));
  }

  static CatalogVisualStyle difficulty(String raw) =>
      _difficulties[raw.toUpperCase()] ?? CatalogVisualStyle(Icons.help_outline_rounded, AppColors.accentViolet, raw);

  static String _capitalize(String s) => s.isEmpty ? 'General' : s[0].toUpperCase() + s.substring(1).toLowerCase();
}
