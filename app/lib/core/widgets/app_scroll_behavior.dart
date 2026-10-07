import 'dart:ui';
import 'package:flutter/material.dart';

/// En el navegador de escritorio también se arrastran con el ratón las listas
/// horizontales (temas, filtros, avatares), igual que con el dedo en el móvil.
/// Sin esto, quien no tiene rueda horizontal no podía ver los últimos temas.
class AppScrollBehavior extends MaterialScrollBehavior {
  const AppScrollBehavior();

  @override
  Set<PointerDeviceKind> get dragDevices => {...super.dragDevices, PointerDeviceKind.mouse};
}
