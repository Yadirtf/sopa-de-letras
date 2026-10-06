import '../../domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.id,
    required super.name,
    required super.age,
    required super.email,
    super.avatarUrl,
    required super.isGuest,
    required super.isOnline,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      name: json['name'] as String,
      age: json['age'] as int? ?? 18,
      email: json['email'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      isGuest: json['isGuest'] as bool? ?? false,
      isOnline: json['isOnline'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'age': age,
      'email': email,
      'avatarUrl': avatarUrl,
      'isGuest': isGuest,
      'isOnline': isOnline,
    };
  }
}
