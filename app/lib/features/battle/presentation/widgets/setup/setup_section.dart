import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';

/// Tarjeta de un paso de la configuración, con número grande para guiar a cualquier edad.
class SetupSection extends StatelessWidget {
  final int step;
  final String title;
  final String? hint;
  final Widget child;
  final Widget? trailing;

  const SetupSection(
      {super.key, required this.step, required this.title, this.hint, required this.child, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            CircleAvatar(
              radius: 13,
              backgroundColor: AppColors.accentViolet,
              child: Text('$step', style: AppTypography.labelBold.copyWith(color: Colors.white, fontSize: 13)),
            ),
            const SizedBox(width: 10),
            Expanded(child: Text(title, style: AppTypography.titleMedium.copyWith(fontSize: 17))),
            if (trailing != null) trailing!,
          ]),
          if (hint != null) ...[
            const SizedBox(height: 6),
            Text(hint!, style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
          ],
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

/// Menos / número / más, con botones grandes (fáciles de tocar).
class NumberStepper extends StatelessWidget {
  final int value;
  final int min;
  final int max;
  final ValueChanged<int> onChanged;
  final String? keyPrefix;

  const NumberStepper(
      {super.key, required this.value, required this.min, required this.max, required this.onChanged, this.keyPrefix});

  @override
  Widget build(BuildContext context) {
    Widget button(IconData icon, int next, bool enabled, String suffix) => IconButton.filledTonal(
          key: keyPrefix == null ? null : ValueKey('$keyPrefix-$suffix'),
          visualDensity: VisualDensity.compact,
          onPressed: enabled ? () => onChanged(next) : null,
          icon: Icon(icon, size: 18),
        );
    return Row(mainAxisSize: MainAxisSize.min, children: [
      button(Icons.remove_rounded, value - 1, value > min, 'menos'),
      SizedBox(
        width: 34,
        child: Text('$value', textAlign: TextAlign.center, style: AppTypography.titleMedium.copyWith(fontSize: 18)),
      ),
      button(Icons.add_rounded, value + 1, value < max, 'mas'),
    ]);
  }
}
