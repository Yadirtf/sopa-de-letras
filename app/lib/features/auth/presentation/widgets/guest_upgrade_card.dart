import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

/// Invitación amable a registrarse para guardar récords y tener amigos.
class GuestUpgradeCard extends StatelessWidget {
  const GuestUpgradeCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.accentAmber.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.accentAmber),
      ),
      child: Column(
        children: [
          Text('Estás jugando como invitado', style: AppTypography.labelBold),
          const SizedBox(height: 8),
          Text(
            'Regístrate para guardar tus récords, tener PIN propio y agregar amigos.',
            textAlign: TextAlign.center,
            style: AppTypography.bodyMedium,
          ),
          const SizedBox(height: 12),
          ElevatedButton(onPressed: () => context.push('/register'), child: const Text('Completar registro')),
        ],
      ),
    );
  }
}
