import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// En pantallas anchas (navegador de escritorio, tablet en horizontal) la
/// app se presenta como una columna centrada, del ancho de un móvil grande.
///
/// Todas las pantallas de WordHive se diseñaron para el móvil: estiradas a
/// 1920 px los botones quedaban kilométricos y el tablero se salía de la
/// vista. Con el marco, ratón y teclado manejan exactamente la misma app.
/// También ajusta el [MediaQuery] para que cada pantalla calcule su tamaño
/// con el ancho de la columna, no con el de la ventana.
class WideScreenFrame extends StatelessWidget {
  static const maxWidth = 600.0;
  static const _breakpoint = 720.0;

  final Widget child;

  const WideScreenFrame({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    if (media.size.width < _breakpoint) return child;

    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: RadialGradient(
          center: Alignment(0, -0.6),
          radius: 1.3,
          colors: [Color(0xFF1B1238), AppColors.bgPrimary],
        ),
      ),
      child: Center(
        child: Container(
          width: maxWidth,
          height: double.infinity,
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            color: AppColors.bgPrimary,
            border: const Border.symmetric(vertical: BorderSide(color: AppColors.borderGlow)),
            boxShadow: [
              BoxShadow(color: AppColors.accentViolet.withValues(alpha: 0.18), blurRadius: 60, spreadRadius: 4),
            ],
          ),
          child: MediaQuery(
            data: media.copyWith(size: Size(maxWidth, media.size.height)),
            child: child,
          ),
        ),
      ),
    );
  }
}
