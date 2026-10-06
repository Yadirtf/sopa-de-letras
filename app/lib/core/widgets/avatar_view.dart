import 'package:flutter/material.dart';
import '../avatars/app_avatars.dart';
import '../theme/app_colors.dart';

/// Avatar circular del jugador. Es la única forma de dibujar un avatar en la
/// app: recibe el id guardado (nuevo o antiguo) y siempre pinta algo.
class AvatarView extends StatelessWidget {
  final String? avatarId;
  final double size;

  const AvatarView({super.key, required this.avatarId, this.size = 48});

  @override
  Widget build(BuildContext context) {
    final avatar = AppAvatars.of(avatarId);
    final pixelRatio = MediaQuery.maybeDevicePixelRatioOf(context) ?? 2;
    final inset = avatar.category.transparent ? size * 0.1 : 0.0;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Color.alphaBlend(avatar.color.withValues(alpha: 0.18), AppColors.bgSecondary),
        shape: BoxShape.circle,
        border: Border.all(color: avatar.color.withValues(alpha: 0.5), width: size >= 64 ? 2 : 1),
      ),
      child: ClipOval(
        child: Padding(
          padding: EdgeInsets.all(inset),
          child: Image.asset(
            avatar.asset,
            fit: BoxFit.cover,
            // Decodifica al tamaño en pantalla: una lista de 250 avatares
            // no debe cargar 250 imágenes completas en memoria.
            cacheWidth: ((size - inset * 2) * pixelRatio).ceil(),
            filterQuality: FilterQuality.medium,
            gaplessPlayback: true,
            semanticLabel: 'Avatar ${avatar.name}',
            errorBuilder: (_, __, ___) => Icon(Icons.person_rounded, color: avatar.color, size: size * 0.55),
          ),
        ),
      ),
    );
  }
}
