import 'package:equatable/equatable.dart';

/// Invitación entrante a una sala (US-24). Vive solo unos segundos en pantalla.
/// `game` dice a qué juego: la sopa de letras o un reto de La Batalla Más Temida.
class RoomInviteEntity extends Equatable {
  static const wordSearch = 'word_search';
  static const battle = 'battle';

  final String game;
  final String roomCode;
  final String wordSearchTitle;
  final String fromName;
  final String? fromAvatar;
  final DateTime expiresAt;

  const RoomInviteEntity({
    this.game = wordSearch,
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
      game: json['game'] == battle ? battle : wordSearch,
      roomCode: (json['roomCode'] as String? ?? '').toUpperCase(),
      wordSearchTitle: json['wordSearchTitle'] as String? ?? 'Sopa de letras',
      fromName: json['fromName'] as String? ?? 'Un amigo',
      fromAvatar: json['fromAvatar'] as String?,
      expiresAt: millis != null ? DateTime.fromMillisecondsSinceEpoch(millis) : fallback,
    );
  }

  bool get isBattle => game == battle;

  /// Segundos que le quedan al banner; nunca negativo.
  int secondsLeft(DateTime now) {
    final diff = expiresAt.difference(now).inMilliseconds;
    return diff <= 0 ? 0 : (diff / 1000).ceil();
  }

  @override
  List<Object?> get props => [game, roomCode, wordSearchTitle, fromName, fromAvatar, expiresAt];
}
