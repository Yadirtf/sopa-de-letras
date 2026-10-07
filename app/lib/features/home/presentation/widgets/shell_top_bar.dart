import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../catalog/presentation/widgets/home_friends_button.dart';
import '../../../catalog/presentation/widgets/home_greeting_title.dart';
import '../../../notifications/presentation/widgets/notification_bell_button.dart';

/// Barra de arriba común a todas las pantallas del marco: saludo con el
/// avatar (lleva al perfil), Amigos y la campana. Así lo social siempre
/// está a un toque, estés donde estés, salvo en la sala y la partida.
class ShellTopBar extends StatelessWidget implements PreferredSizeWidget {
  const ShellTopBar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.bgPrimary,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      automaticallyImplyLeading: false,
      titleSpacing: 16,
      title: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: () => context.go('/profile'),
        child: const HomeGreetingTitle(),
      ),
      actions: const [HomeFriendsButton(), NotificationBellButton(), SizedBox(width: 8)],
      shape: const Border(bottom: BorderSide(color: AppColors.borderSubtle)),
    );
  }
}
