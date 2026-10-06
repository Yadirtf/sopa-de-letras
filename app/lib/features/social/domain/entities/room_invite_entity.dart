import 'package:equatable/equatable.dart';

/// Invitación entrante a una sala (US-24). Vive solo unos segundos en pantalla.
class RoomInviteEntity extends Equatable {
  final String roomCode;
  final String wordSearchTitle;
  final String fromName;
  final String? fromAvatar;
  final DateTime expiresAt;

  const RoomInviteEntity({
    required this.roomCode,
    required this.wordSearchTitle,
    required this.fromName,
    this.fromAvatar,
    required this.expiresAt,
  });

  factory RoomInviteEntity.fromJson(Map<String, dynamic> json, {DateTime? now}) {
    final millis = (json['expiresAt'] as num?)?.toInt();
    final fallback = (now ?? DateTime.now()).add(const Duration(seconds: 15));
    return RoomInviteEntity(
      roomCode: (json['roomCode'] as String? ?? '').toUpperCase(),
      wordSearchTitle: json['wordSearchTitle'] as String? ?? 'Sopa de letras',
      fromName: json['fromName'] as String? ?? 'Un amigo',
      fromAvatar: json['fromAvatar'] as String?,
      expiresAt: millis != null ? DateTime.fromMillisecondsSinceEpoch(millis) : fallback,
    );
  }

  /// Segundos que le quedan al banner; nunca negativo.
  int secondsLeft(DateTime now) {
    final diff = expiresAt.difference(now).inMilliseconds;
    return diff <= 0 ? 0 : (diff / 1000).ceil();
  }

  @override
  List<Object?> get props => [roomCode, wordSearchTitle, fromName, fromAvatar, expiresAt];
}
