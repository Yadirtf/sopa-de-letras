import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/auth_notifier.dart';
import '../widgets/change_pin_sheet.dart';
import '../widgets/guest_upgrade_card.dart';
import '../widgets/profile_edit_card.dart';
import '../widgets/profile_header_widget.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  Future<void> _changePin(BuildContext context) async {
    final changed = await ChangePinSheet.show(context);
    if (changed == true && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('¡Listo! Ya puedes entrar con tu PIN nuevo'), backgroundColor: AppColors.accentEmerald),
      );
    }
  }

  Future<void> _logout(BuildContext context, WidgetRef ref) async {
    final sure = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgCard,
        title: const Text('¿Cerrar sesión?'),
        content: const Text('Podrás volver a entrar con tu correo y tu PIN.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Quedarme')),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Cerrar sesión', style: TextStyle(color: AppColors.accentRose)),
          ),
        ],
      ),
    );
    if (sure != true) return;
    await ref.read(authNotifierProvider.notifier).logout();
    if (context.mounted) context.go('/login');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authNotifierProvider.select((s) => s.user));

    if (user == null) {
      return Scaffold(
        body: Center(
          child: ElevatedButton(onPressed: () => context.go('/login'), child: const Text('Iniciar sesión')),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: AppColors.bgPrimary,
        title: Text('Mi perfil', style: AppTypography.titleMedium),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          ProfileHeaderWidget(user: user),
          const SizedBox(height: 24),
          if (user.isGuest) ...[
            const GuestUpgradeCard(),
            const SizedBox(height: 16),
          ],
          // La key reinicia el formulario cuando el usuario guardado cambia.
          ProfileEditCard(key: ValueKey('${user.name}|${user.avatarUrl}'), user: user),
          const SizedBox(height: 16),
          if (!user.isGuest)
            _ProfileTile(
              icon: Icons.lock_rounded,
              color: AppColors.accentAmber,
              title: 'Cambiar mi PIN',
              subtitle: 'Los 4 números con los que entras',
              onTap: () => _changePin(context),
            ),
          const SizedBox(height: 8),
          _ProfileTile(
            icon: Icons.logout_rounded,
            color: AppColors.accentRose,
            title: 'Cerrar sesión',
            onTap: () => _logout(context, ref),
          ),
        ],
      ),
    );
  }
}

class _ProfileTile extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  const _ProfileTile(
      {required this.icon, required this.color, required this.title, this.subtitle, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.bgCard,
      borderRadius: BorderRadius.circular(16),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        leading: Icon(icon, color: color),
        title: Text(title, style: AppTypography.labelBold),
        subtitle: subtitle == null ? null : Text(subtitle!, style: AppTypography.bodyMedium.copyWith(fontSize: 12)),
        trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textSecondary),
        onTap: onTap,
      ),
    );
  }
}
