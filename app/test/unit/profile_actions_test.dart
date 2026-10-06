import 'package:dartz/dartz.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/auth/domain/entities/user_entity.dart';
import 'package:wordhive_app/features/auth/domain/repositories/auth_repository.dart';
import 'package:wordhive_app/features/auth/presentation/providers/auth_notifier.dart';
import 'package:wordhive_app/features/auth/presentation/providers/profile_actions.dart';

const _ana = UserEntity(id: 'u1', name: 'Ana', age: 9, email: 'ana@mail.com', isGuest: false, isOnline: true);

/// Repositorio falso: solo lo que usa el perfil; el resto no debe llamarse.
class _FakeAuthRepository implements AuthRepository {
  String? pinError;
  int pinCalls = 0;

  @override
  Future<Either<String, UserEntity?>> getCurrentUser() async => const Right(_ana);

  @override
  Future<Either<String, UserEntity>> updateProfile({String? name, String? avatarUrl}) async => Right(UserEntity(
        id: _ana.id,
        name: name ?? _ana.name,
        age: _ana.age,
        email: _ana.email,
        avatarUrl: avatarUrl ?? _ana.avatarUrl,
        isGuest: false,
        isOnline: true,
      ));

  @override
  Future<Either<String, String>> updatePin({required String currentPin, required String newPin}) async {
    pinCalls++;
    return pinError == null ? const Right('PIN actualizado correctamente') : Left(pinError!);
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => throw UnimplementedError('${invocation.memberName}');
}

void main() {
  late _FakeAuthRepository repo;
  late ProviderContainer container;

  setUp(() async {
    repo = _FakeAuthRepository();
    container = ProviderContainer(overrides: [authRepositoryProvider.overrideWithValue(repo)]);
    container.read(authNotifierProvider);
    await Future<void>.delayed(Duration.zero);
  });

  tearDown(() => container.dispose());

  test('guardar nombre y avatar actualiza el usuario de toda la app', () async {
    final error = await container.read(ProfileActions.provider).updateProfile(name: '  Ana Sofía ', avatarUrl: 'star');

    expect(error, isNull);
    final user = container.read(authNotifierProvider).user!;
    expect(user.name, 'Ana Sofía');
    expect(user.avatarUrl, 'star');
    expect(user.email, 'ana@mail.com');
  });

  test('un nombre de menos de 3 letras se rechaza sin llamar al servidor', () async {
    final error = await container.read(ProfileActions.provider).updateProfile(name: 'Al');

    expect(error, contains('3 letras'));
    expect(container.read(authNotifierProvider).user!.name, 'Ana');
  });

  test('cambiar el PIN por el mismo se rechaza antes de llamar al servidor', () async {
    final error = await container.read(ProfileActions.provider).updatePin(currentPin: '1234', newPin: '1234');

    expect(error, isNotNull);
    expect(repo.pinCalls, 0);
  });

  test('el error del servidor (PIN actual incorrecto) llega tal cual a la pantalla', () async {
    repo.pinError = 'El PIN actual no es correcto';
    final error = await container.read(ProfileActions.provider).updatePin(currentPin: '0000', newPin: '4321');

    expect(error, 'El PIN actual no es correcto');
    expect(repo.pinCalls, 1);
  });
}
