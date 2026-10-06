import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// Una familia de avatares que el jugador puede explorar en el selector.
///
/// Las imágenes viven empaquetadas en `assets/avatars/<key>/NN.webp`, así que
/// se ven al instante y sin internet. Las genera `tool/avatars/gen.mjs`.
class AvatarCategory {
  final String key;
  final String name;
  final IconData icon;
  final Color color;
  final int count;

  /// Nombres de cada avatar (solo en las familias de emoji 3D); en el resto
  /// usamos "Nombre de la familia + número".
  final List<String> names;

  /// Las de emoji 3D tienen fondo transparente: se dibujan con margen sobre
  /// el círculo de color. Las de DiceBear traen su propio fondo pastel.
  final bool transparent;

  const AvatarCategory(
    this.key,
    this.name,
    this.icon,
    this.color,
    this.count, {
    this.names = const [],
    this.transparent = false,
  });
}

/// Orden pensado para todas las edades: lo más reconocible primero.
const List<AvatarCategory> avatarCategories = [
  AvatarCategory('animales', 'Animales', Icons.pets_rounded, AppColors.accentAmber, 25, transparent: true, names: [
    'Abeja', 'Perro', 'Gato', 'Zorro', 'Panda', 'León', 'Tigre', 'Koala', 'Mono', 'Conejo', 'Oso', 'Rana', 'Búho', //
    'Pingüino', 'Hámster', 'Lobo', 'Vaca', 'Cerdito', 'Ratón', 'Unicornio', 'Dragón', 'Pollito', 'Pulpo', 'Tortuga',
    'Delfín',
  ]),
  AvatarCategory('aventureros', 'Aventureros', Icons.explore_rounded, AppColors.accentCyan, 24),
  AvatarCategory('fantasia', 'Fantasía', Icons.auto_awesome_rounded, AppColors.accentViolet, 20,
      transparent: true,
      names: [
        'Alien', 'Marciano', 'Robot', 'Fantasma', 'Mago', 'Hada', 'Genio', 'Superheroína', 'Superhéroe', 'Villano', //
        'Vampira', 'Zombi', 'Elfo', 'Ninja', 'Trol', 'Payaso', 'Calabaza', 'Ogro', 'Duende', 'Genial',
      ]),
  AvatarCategory('profesiones', 'Profesiones', Icons.work_rounded, AppColors.accentEmerald, 18,
      transparent: true,
      names: [
        'Astronauta', 'Artista', 'Científica', 'Bombero', 'Chef', 'Policía', 'Profe', 'Granjero', 'Doctora', //
        'Piloto', 'Programador', 'Cantante', 'Detective', 'Mecánico', 'Estudiante', 'Juez', 'Constructor',
        'Oficinista',
      ]),
  AvatarCategory('comic', 'Cómic', Icons.face_rounded, AppColors.accentRose, 24),
  AvatarCategory('sonrisas', 'Sonrisas', Icons.sentiment_very_satisfied_rounded, AppColors.accentAmber, 24),
  AvatarCategory('robots', 'Robots', Icons.smart_toy_rounded, AppColors.accentCyan, 24, transparent: true),
  AvatarCategory('pixel', 'Pixel', Icons.grid_view_rounded, AppColors.accentEmerald, 24),
  AvatarCategory('caritas', 'Caritas', Icons.emoji_emotions_rounded, AppColors.accentAmber, 24),
  AvatarCategory('retratos', 'Retratos', Icons.brush_rounded, AppColors.accentViolet, 24),
  AvatarCategory('bocetos', 'Bocetos', Icons.draw_rounded, AppColors.accentRose, 24),
];
