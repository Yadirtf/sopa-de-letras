import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class LoginFooterWidget extends StatelessWidget {
  final VoidCallback onGuestPlay;

  const LoginFooterWidget({super.key, required this.onGuestPlay});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 24),
        OutlinedButton.icon(
          onPressed: onGuestPlay,
          icon: const Icon(Icons.bolt, color: AppColors.accentAmber),
          label: const Text('Jugar como Invitado (Sin Registro)'),
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.textPrimary,
            side: const BorderSide(color: AppColors.accentAmber),
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
          ),
        ),
        const SizedBox(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('¿No tienes cuenta? ', style: AppTypography.bodyMedium),
            GestureDetector(
              onTap: () => context.push('/register'),
              child: const Text(
                'Regístrate',
                style: TextStyle(
                  color: AppColors.accentViolet,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        GestureDetector(
          onTap: () => context.push('/forgot-pin'),
          child: Text('¿Olvidaste tu PIN?', style: AppTypography.bodyMedium),
        ),
      ],
    );
  }
}
