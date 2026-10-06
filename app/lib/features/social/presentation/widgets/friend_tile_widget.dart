import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import 'player_avatar_widget.dart';

/// Tarjeta base de la pestaña social: avatar, nombre, subtítulo y una acción.
/// Alto mínimo de 72 px para dedos pequeños y pantallas grandes por igual.
class SocialTile extends StatelessWidget {
  final String name;
  final String? avatarId;
  final Widget subtitle;
  final Widget? trailing;
  final Widget? avatar;
  final bool highlighted;

  const SocialTile({
    super.key,
    required this.name,
    required this.avatarId,
    required this.subtitle,
    this.trailing,
    this.avatar,
    this.highlighted = false,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      constraints: const BoxConstraints(minHeight: 72),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: highlighted ? AppColors.accentEmerald.withValues(alpha: 0.5) : AppColors.borderSubtle),
      ),
      child: Row(
        children: [
          avatar ?? PlayerAvatar(avatarId: avatarId),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(name, style: AppTypography.labelBold.copyWith(fontSize: 16), overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                subtitle,
              ],
            ),
          ),
          if (trailing != null) ...[const SizedBox(width: 8), trailing!],
        ],
      ),
    );
  }
}

/// Botón con texto (no solo icono): "Aceptar", "Invitar"... más claro para todas las edades.
class SocialActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback? onPressed;
  final bool busy;
  final bool filled;

  const SocialActionButton({
    super.key,
    required this.label,
    required this.icon,
    required this.color,
    required this.onPressed,
    this.busy = false,
    this.filled = true,
  });

  @override
  Widget build(BuildContext context) {
    final child = busy
        ? SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: filled ? Colors.white : color))
        : Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(icon, size: 18),
            const SizedBox(width: 6),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
          ]);
    final shape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(12));
    const minSize = Size(48, 44);
    return filled
        ? ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: color,
              foregroundColor: Colors.white,
              disabledBackgroundColor: AppColors.bgSecondary,
              minimumSize: minSize,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              shape: shape,
            ),
            onPressed: busy ? null : onPressed,
            child: child,
          )
        : OutlinedButton(
            style: OutlinedButton.styleFrom(
              foregroundColor: color,
              side: BorderSide(color: color.withValues(alpha: 0.6)),
              minimumSize: minSize,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              shape: shape,
            ),
            onPressed: busy ? null : onPressed,
            child: child,
          );
  }
}
