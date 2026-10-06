import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

/// La casita del centro: más grande que el resto y un poco levantada sobre la
/// barra, para que siempre se sepa cómo volver al inicio.
class HomeHouseButton extends StatelessWidget {
  final bool selected;
  final VoidCallback onTap;

  const HomeHouseButton({super.key, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: selected,
      label: 'Inicio',
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            // Se dibuja 12 px por encima de la barra sin robarle altura.
            Transform.translate(
              offset: const Offset(0, -12),
              child: AnimatedScale(
                scale: selected ? 1.0 : 0.9,
                duration: const Duration(milliseconds: 300),
                curve: Curves.elasticOut,
                child: Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: selected
                          ? const [AppColors.accentViolet, AppColors.accentCyan]
                          : [AppColors.bgCard, AppColors.bgCard],
                    ),
                    border: Border.all(color: selected ? Colors.white24 : AppColors.borderGlow, width: 2),
                    boxShadow: selected
                        ? [BoxShadow(color: AppColors.accentViolet.withValues(alpha: 0.5), blurRadius: 16)]
                        : const [],
                  ),
                  child: Icon(
                    selected ? Icons.home_rounded : Icons.home_outlined,
                    size: 30,
                    color: selected ? Colors.white : AppColors.textSecondary,
                  ),
                ),
              ),
            ),
            Text(
              'Inicio',
              style: AppTypography.caption.copyWith(
                fontSize: 11,
                color: selected ? AppColors.textPrimary : AppColors.textSecondary,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
