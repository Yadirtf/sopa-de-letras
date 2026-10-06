import 'package:flutter/material.dart';

/// Icono dentro de un círculo teñido con su propio color. Es la "pastilla"
/// visual de WordHive: sustituye a los emojis con iconos nítidos y coherentes
/// que se leen igual en cualquier teléfono.
class IconBadge extends StatelessWidget {
  final IconData icon;
  final Color color;
  final double size;

  const IconBadge({super.key, required this.icon, required this.color, this.size = 48});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        shape: BoxShape.circle,
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Icon(icon, color: color, size: size * 0.5),
    );
  }
}
