import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

/// Un paso del registro: su etiqueta corta (barra de progreso), su título y
/// la frase que explica qué hacer en él.
class RegisterStep {
  final String label;
  final String title;
  final String subtitle;

  const RegisterStep(this.label, this.title, this.subtitle);
}

const registerSteps = [
  RegisterStep('Tus datos', '¿Cómo te llamas?', 'Cuéntanos un poco de ti para crear tu perfil.'),
  RegisterStep('Avatar', 'Elige tu avatar', 'Explora las categorías y toca el que más vaya contigo.'),
  RegisterStep('PIN', 'Crea tu PIN', 'Elige 4 números fáciles de recordar. Con ellos entrarás a WordHive.'),
];

/// Barra de progreso por pasos + título del paso actual. Cada paso tiene su
/// propio título: nunca se queda el texto de un paso anterior.
class RegisterStepHeader extends StatelessWidget {
  final int step;

  const RegisterStepHeader({super.key, required this.step});

  @override
  Widget build(BuildContext context) {
    final current = registerSteps[step];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            for (var i = 0; i < registerSteps.length; i++) ...[
              if (i > 0) const SizedBox(width: 8),
              Expanded(child: _StepSegment(label: registerSteps[i].label, done: i < step, active: i == step)),
            ],
          ],
        ),
        const SizedBox(height: 20),
        Text(
          'Paso ${step + 1} de ${registerSteps.length}',
          style: AppTypography.labelBold.copyWith(color: AppColors.accentCyan),
        ),
        const SizedBox(height: 4),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 250),
          child: Column(
            key: ValueKey(step),
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Semantics(header: true, child: Text(current.title, style: AppTypography.titleLarge)),
              const SizedBox(height: 4),
              Text(current.subtitle, style: AppTypography.bodyMedium),
            ],
          ),
        ),
      ],
    );
  }
}

class _StepSegment extends StatelessWidget {
  final String label;
  final bool done;
  final bool active;

  const _StepSegment({required this.label, required this.done, required this.active});

  @override
  Widget build(BuildContext context) {
    final color = done ? AppColors.accentEmerald : (active ? AppColors.accentViolet : AppColors.textMuted);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          height: 6,
          decoration: BoxDecoration(
            color: done || active ? color : AppColors.bgCard,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        const SizedBox(height: 6),
        Row(
          children: [
            if (done) ...[Icon(Icons.check_circle_rounded, size: 14, color: color), const SizedBox(width: 4)],
            Flexible(
              child: Text(
                label,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 12,
                  color: done || active ? AppColors.textPrimary : AppColors.textSecondary,
                  fontWeight: active ? FontWeight.bold : FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
