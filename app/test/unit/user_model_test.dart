import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/auth/data/models/user_model.dart';
import 'package:wordhive_app/features/auth/domain/entities/user_entity.dart';

void main() {
  const tUserModel = UserModel(
    id: 'user_001',
    name: 'Abeja_Master',
    age: 22,
    email: 'master@wordhive.com',
    avatarUrl: 'bee_scout',
    isGuest: false,
    isOnline: true,
  );

  test('UserModel debe ser un subtipo de UserEntity', () {
    expect(tUserModel, isA<UserEntity>());
  });

  test('debe deserializar correctamente un mapa JSON a UserModel', () {
    final Map<String, dynamic> jsonMap = {
      'id': 'user_001',
      'name': 'Abeja_Master',
      'age': 22,
      'email': 'master@wordhive.com',
      'avatarUrl': 'bee_scout',
      'isGuest': false,
      'isOnline': true,
    };

    final result = UserModel.fromJson(jsonMap);

    expect(result, equals(tUserModel));
    expect(result.id, 'user_001');
    expect(result.name, 'Abeja_Master');
    expect(result.isGuest, false);
  });

  test('debe serializar correctamente un UserModel a JSON', () {
    final result = tUserModel.toJson();

    expect(result['id'], 'user_001');
    expect(result['name'], 'Abeja_Master');
    expect(result['email'], 'master@wordhive.com');
  });
}
