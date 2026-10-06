import 'package:flutter/material.dart';

/// Paleta de Diseño Oficial WordHive — "Bioluminiscencia Nocturna"
/// Definida en AGENT.md para maxima retencion e impacto estetico.
abstract class AppColors {
  // Fondos
  static const Color bgPrimary = Color(0xFF080B14); // Noche profunda (fondo raiz)
  static const Color bgSecondary = Color(0xFF0F1623); // Cielo nocturno (secciones)
  static const Color bgCard = Color(0xFF151D2E); // Base glassmorphism

  // Acentos
  static const Color accentViolet = Color(0xFF7C3AED); // Accion principal, CTA
  static const Color accentCyan = Color(0xFF06B6D4); // Info, links, energia
  static const Color accentEmerald = Color(0xFF10B981); // Exito, palabra encontrada
  static const Color accentAmber = Color(0xFFF59E0B); // Rank 1, logros, brillo
  static const Color accentRose = Color(0xFFF43F5E); // Urgencia, error, tiempo fin

  // Textos
  static const Color textPrimary = Color(0xFFF0F4FF); // Blanco calido
  static const Color textSecondary = Color(0xFF8892A4); // Gris azulado
  static const Color textMuted = Color(0xFF4A5568); // Deshabilitado

  // Bordes y overlays glassmorphism
  static const Color borderSubtle = Color(0x1A7C3AED); // Violeta 10%
  static const Color borderGlow = Color(0x4D7C3AED); // Violeta 30%
  static const Color glassFill = Color(0x33151D2E); // Glassmorphism semi-transparente
}
