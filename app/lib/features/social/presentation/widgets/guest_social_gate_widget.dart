import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'social_empty_state_widget.dart';

/// Los invitados no tienen cuenta permanente, así que no pueden tener amigos.
/// En lugar de un error, les mostramos el beneficio y el camino para crearla.
class GuestSocialGate extends StatelessWidget {
  const GuestSocialGate({super.key});

  @override
  Widget build(BuildContext context) {
    return SocialEmptyState(
      emoji: '🐝👋🐝',
      title: '¡Juega con tus amigos!',
      message: 'Crea una cuenta gratis para agregar amigos, ver quién está en línea e invitarlos a tus salas con un toque.',
      actionLabel: 'Crear mi cuenta',
      onAction: () => context.push('/register'),
    );
  }
}
