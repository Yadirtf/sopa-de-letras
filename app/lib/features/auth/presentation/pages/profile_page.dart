import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_avatars.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/icon_badge.dart';
import '../providers/auth_notifier.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final user = authState.user;

    if (user == null) {
      return Scaffold(
        body: Center(
          child: ElevatedButton(
            onPressed: () => context.go('/login'),
            child: const Text('Iniciar Sesión'),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Mi Perfil', style: AppTypography.titleMedium),
        backgroundColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: AppColors.accentRose),
            onPressed: () async {
              await ref.read(authNotifierProvider.notifier).logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Center(
              child: Stack(
                alignment: Alignment.bottomRight,
                children: [
                  IconBadge(
                    icon: AppAvatars.of(user.avatarUrl).icon,
                    color: AppAvatars.of(user.avatarUrl).color,
                    size: 100,
                  ),
                  if (user.isGuest)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.accentAmber,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text('INVITADO', style: TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Text(user.name, style: AppTypography.titleLarge),
            Text(user.email, style: AppTypography.bodyMedium),
            const SizedBox(height: 32),

            if (user.isGuest)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.accentAmber.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.accentAmber),
                ),
                child: Column(
                  children: [
                    const Text('Estás usando una cuenta de invitado.', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    const Text('Regístrate para guardar tus récords permanentemente y agregar amigos.', textAlign: TextAlign.center),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () => context.push('/register'),
                      child: const Text('Completar Registro'),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 24),
            ListTile(
              leading: const Icon(Icons.lock_outline, color: AppColors.accentCyan),
              title: const Text('Cambiar PIN de 4 dígitos'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Función de cambio de PIN disponible en Ajustes')),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
