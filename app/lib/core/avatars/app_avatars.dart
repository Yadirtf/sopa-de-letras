import 'package:flutter/material.dart';
import 'avatar_catalog.dart';

export 'avatar_catalog.dart';

/// Un avatar concreto. El [id] (`<familia>_NN`, p. ej. `animales_01`) es lo
/// que se guarda en el backend como `avatarUrl`: nunca debe cambiar.
class AvatarOption {
  final String id;
  final String name;
  final AvatarCategory category;
  final int number;

  const AvatarOption(this.id, this.name, this.category, this.number);

  String get asset => 'assets/avatars/${category.key}/${number.toString().padLeft(2, '0')}.webp';
  Color get color => category.color;
}

/// Catálogo único de avatares: registro, perfil, amigos, salas e
/// invitaciones leen de aquí para que cada jugador se vea igual en todas partes.
abstract class AppAvatars {
  static const String defaultId = 'animales_01';

  /// Los primeros avatares eran iconos. Quien ya eligió uno ve ahora el
  /// dibujo nuevo más parecido, sin tener que tocar nada.
  static const Map<String, String> legacy = {
    'bee_scout': 'animales_01',
    'bee_queen': 'fantasia_06',
    'honey_pot': 'animales_11',
    'lightning': 'fantasia_09',
    'star': 'fantasia_20',
    'flower': 'animales_20',
  };

  static List<AvatarCategory> get categories => avatarCategories;

  static List<AvatarOption> inCategory(AvatarCategory category) =>
      [for (var n = 1; n <= category.count; n++) _build(category, n)];

  /// Avatar por id. Acepta ids antiguos y, si no lo reconoce (o es nulo),
  /// devuelve la abeja de WordHive.
  static AvatarOption of(String? id) => tryParse(legacy[id] ?? id) ?? tryParse(defaultId)!;

  /// `null` si el id no pertenece al catálogo actual.
  static AvatarOption? tryParse(String? id) {
    if (id == null) return null;
    final cut = id.lastIndexOf('_');
    if (cut <= 0) return null;
    final key = id.substring(0, cut);
    final number = int.tryParse(id.substring(cut + 1));
    for (final category in avatarCategories) {
      if (category.key == key && number != null && number >= 1 && number <= category.count) {
        return _build(category, number);
      }
    }
    return null;
  }

  static AvatarOption _build(AvatarCategory category, int number) {
    final id = '${category.key}_${number.toString().padLeft(2, '0')}';
    final name = number <= category.names.length ? category.names[number - 1] : '${category.name} $number';
    return AvatarOption(id, name, category, number);
  }
}
