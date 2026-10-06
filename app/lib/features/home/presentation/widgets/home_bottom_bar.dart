import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import 'home_bar_item.dart';
import 'home_house_button.dart';

/// Barra inferior con la casita en el centro. Cada icono lleva su palabra
/// debajo: nadie tiene que adivinar qué hace un dibujo.
///
/// Orden de ramas del shell: 0 Unirme · 1 Mis sopas · 2 Inicio · 3 Perfil.
/// "Crear" no es una pestaña sino un atajo que abre el editor encima.
class HomeBottomBar extends StatelessWidget {
  static const int joinBranch = 0;
  static const int mineBranch = 1;
  static const int homeBranch = 2;
  static const int profileBranch = 3;

  final int currentBranch;
  final ValueChanged<int> onBranchSelected;
  final VoidCallback onCreate;

  const HomeBottomBar({
    super.key,
    required this.currentBranch,
    required this.onBranchSelected,
    required this.onCreate,
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
              HomeBarItem(
                icon: Icons.add_circle_outline_rounded,
                label: 'Crear',
                color: AppColors.accentEmerald,
                selected: false,
                onTap: onCreate,
              ),
              tab(profileBranch, Icons.person_outline_rounded, Icons.person_rounded, 'Perfil', AppColors.accentViolet),
            ],
          ),
        ),
      ),
    );
  }
}
