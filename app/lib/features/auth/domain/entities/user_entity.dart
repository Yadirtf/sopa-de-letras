import 'package:equatable/equatable.dart';

class UserEntity extends Equatable {
  final String id;
  final String name;
  final int age;
  final String email;
  final String? avatarUrl;
  final bool isGuest;
  final bool isOnline;

  const UserEntity({
    required this.id,
    required this.name,
    required this.age,
    required this.email,
    this.avatarUrl,
    required this.isGuest,
    required this.isOnline,
  });

  @override
  List<Object?> get props => [id, name, age, email, avatarUrl, isGuest, isOnline];
}
