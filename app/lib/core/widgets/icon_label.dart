import 'package:flutter/material.dart';

/// Texto precedido por un icono del mismo color y tamaño que la letra.
/// Para títulos y encabezados donde antes iba un emoji delante.
class IconLabel extends StatelessWidget {
  final IconData icon;
  final String text;
  final TextStyle style;
  final MainAxisAlignment alignment;

  const IconLabel({
    super.key,
    required this.icon,
    required this.text,
    required this.style,
    this.alignment = MainAxisAlignment.start,
  });

  @override
  Widget build(BuildContext context) {
    final size = (style.fontSize ?? 14) * 1.2;
    return Row(
      mainAxisSize: alignment == MainAxisAlignment.start ? MainAxisSize.min : MainAxisSize.max,
      mainAxisAlignment: alignment,
      children: [
        Icon(icon, size: size, color: style.color),
        SizedBox(width: size * 0.4),
        Flexible(child: Text(text, style: style, overflow: TextOverflow.ellipsis)),
      ],
    );
  }
}
