import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../widgets/home_bottom_bar.dart';

/// Marco de las pantallas "de casa": Unirme, Mis sopas, Inicio y Perfil
/// comparten la barra inferior. Sala, partida y editores son rutas de la raíz,
/// así que al entrar en ellas la barra desaparece sola y el tablero tiene
/// toda la pantalla.
class HomeShellPage extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const HomeShellPage({super.key, required this.navigationShell});

  static const int homeBranch = HomeBottomBar.homeBranch;

  void _goTo(int branch) {
    // Tocar la pestaña en la que ya estás la devuelve a su primera pantalla.
    navigationShell.goBranch(branch, initialLocation: branch == navigationShell.currentIndex);
  }

  @override
  Widget build(BuildContext context) {
    final onHome = navigationShell.currentIndex == homeBranch;

    // El botón "atrás" de Android desde otra pestaña lleva a la casita
    // en vez de cerrar la app: nadie sale sin querer.
    return PopScope(
      canPop: onHome,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _goTo(homeBranch);
      },
      child: Scaffold(
        backgroundColor: AppColors.bgPrimary,
        body: navigationShell,
        bottomNavigationBar: HomeBottomBar(
          currentBranch: navigationShell.currentIndex,
          onBranchSelected: _goTo,
          onCreate: () => context.push('/create-word-search'),
        ),
      ),
    );
  }
}
