import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/core/avatars/app_avatars.dart';

void main() {
  test('cada avatar del catálogo tiene su imagen empaquetada', () {
    for (final category in AppAvatars.categories) {
      final avatars = AppAvatars.inCategory(category);
      expect(avatars, hasLength(category.count));
      for (final avatar in avatars) {
        expect(File(avatar.asset).existsSync(), isTrue, reason: avatar.asset);
      }
      final extra = File('assets/avatars/${category.key}/${(category.count + 1).toString().padLeft(2, '0')}.webp');
      expect(extra.existsSync(), isFalse, reason: 'sube count en ${category.key}');
    }
  });

  test('los ids son estables y se pueden leer de vuelta', () {
    final robot = AppAvatars.of('robots_07');
    expect(robot.id, 'robots_07');
    expect(robot.asset, 'assets/avatars/robots/07.webp');
    expect(AppAvatars.of('animales_02').name, 'Perro');
    expect(AppAvatars.of('comic_03').name, 'Cómic 3');
  });

  test('los avatares antiguos siguen funcionando', () {
    expect(AppAvatars.of('bee_scout').id, 'animales_01');
    expect(AppAvatars.of('flower').name, 'Unicornio');
    for (final id in AppAvatars.legacy.values) {
      expect(AppAvatars.tryParse(id), isNotNull, reason: id);
    }
  });

  test('ids desconocidos o vacíos caen en la abeja', () {
    for (final id in [null, '', 'robots_99', 'nada', 'https://x.com/a.png', '_01']) {
      expect(AppAvatars.of(id).id, AppAvatars.defaultId, reason: '$id');
    }
  });
}
