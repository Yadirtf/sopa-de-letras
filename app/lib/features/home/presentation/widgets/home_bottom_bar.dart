import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import 'home_bar_item.dart';
import 'home_house_button.dart';

/// Barra inferior con la casita en el centro. Cada icono lleva su palabra
/// debajo: nadie tiene que adivinar qué hace un dibujo.
///
/// Orden de ramas del shell: 0 Unirme · 1 Mis sopas · 2 Inicio · 3 Crear ·
/// 4 Perfil. Las ramas 5 (Amigos) y 6 (Notificaciones) se abren desde la
/// barra de arriba y no encienden ningún botón de esta.
class HomeBottomBar extends StatelessWidget {
  static const int joinBranch = 0;
  static const int mineBranch = 1;
  static const int homeBranch = 2;
  static const int createBranch = 3;
  static const int profileBranch = 4;

  final int currentBranch;
  final ValueChanged<int> onBranchSelected;

  const HomeBottomBar({
    super.key,
    required this.currentBranch,
    required this.onBranchSelected,
  });

  @override
  Widget build(BuildContext context) {
    HomeBarItem tab(int branch, IconData icon, IconData activeIcon, String label, Color color) {
      return HomeBarItem(
        icon: currentBranch == branch ? activeIcon : icon,
        label: label,
        color: color,
        selected: currentBranch == branch,
        onTap: () => onBranchSelected(branch),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        border: const Border(top: BorderSide(color: AppColors.borderGlow)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, -4))
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 76,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              tab(joinBranch, Icons.vpn_key_outlined, Icons.vpn_key_rounded, 'Unirme', AppColors.accentCyan),
              tab(mineBranch, Icons.extension_outlined, Icons.extension_rounded, 'Mis sopas', AppColors.accentAmber),
              Expanded(
                child: HomeHouseButton(
                  selected: currentBranch == homeBranch,
                  onTap: () => onBranchSelected(homeBranch),
                ),
              ),
              tab(createBranch, Icons.add_circle_outline_rounded, Icons.add_circle_rounded, 'Crear',
                  AppColors.accentEmerald),
              tab(profileBranch, Icons.person_outline_rounded, Icons.person_rounded, 'Perfil', AppColors.accentViolet),
            ],
          ),
        ),
      ),
    );
  }
}
