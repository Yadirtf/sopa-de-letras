import '../../domain/entities/game_room_entity.dart';

class RoomPlayerModel extends RoomPlayerEntity {
  const RoomPlayerModel({
    required super.userId,
    required super.username,
    super.avatarUrl,
    required super.isHost,
    required super.isReady,
    required super.score,
    required super.wordsFound,
    required super.colorHex,
    super.rank,
  });

  factory RoomPlayerModel.fromJson(Map<String, dynamic> json) {
    return RoomPlayerModel(
      userId: json['userId'] ?? '',
      username: json['username'] ?? 'Jugador',
      avatarUrl: json['avatarUrl'],
      isHost: json['isHost'] ?? false,
      isReady: json['isReady'] ?? false,
      score: (json['score'] as num?)?.toInt() ?? 0,
      wordsFound: (json['wordsFound'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      colorHex: json['colorHex'] ?? '#7C3AED',
      rank: (json['rank'] as num?)?.toInt(),
    );
  }

  Map<String, dynamic> toJson() => {
        'userId': userId,
        'username': username,
        'avatarUrl': avatarUrl,
        'isHost': isHost,
        'isReady': isReady,
        'score': score,
        'wordsFound': wordsFound,
        'colorHex': colorHex,
        if (rank != null) 'rank': rank,
      };
}

class GameRoomModel extends GameRoomEntity {
  const GameRoomModel({
    required super.id,
    required super.code,
    required super.wordSearchId,
    required super.wordSearchTitle,
    required super.hostUserId,
    required super.status,
    required super.maxPlayers,
    super.timeLimitSeconds,
    required super.isPrivate,
    required super.players,
    super.grid,
    super.words,
    super.shareUrl,
    super.deepLink,
    super.qrData,
  });

  factory GameRoomModel.fromJson(Map<String, dynamic> json) {
    RoomStatusEnum status = RoomStatusEnum.waiting;
    final statusStr = (json['status'] ?? '').toString().toUpperCase();
    if (statusStr == 'IN_PROGRESS') status = RoomStatusEnum.inProgress;
    if (statusStr == 'COUNTDOWN') status = RoomStatusEnum.countdown;
    if (statusStr == 'FINISHED') status = RoomStatusEnum.finished;

    final rawPlayers = json['players'] as List<dynamic>? ?? [];
    final players = rawPlayers
        .map((p) => RoomPlayerModel.fromJson(p as Map<String, dynamic>))
        .toList();

    List<List<String>> grid = [];
    if (json['grid'] is List) {
      grid = (json['grid'] as List)
          .map((row) => (row as List).map((c) => c.toString()).toList())
          .toList();
    }

    List<String> words = [];
    if (json['words'] is List) {
      words = (json['words'] as List).map((w) => w.toString()).toList();
    }

    return GameRoomModel(
      id: json['id'] ?? '',
      code: json['code'] ?? '',
      wordSearchId: json['wordSearchId'] ?? '',
      wordSearchTitle: json['wordSearchTitle'] ?? 'Sopa de Letras',
      hostUserId: json['hostUserId'] ?? '',
      status: status,
      maxPlayers: (json['maxPlayers'] as num?)?.toInt() ?? 20,
      timeLimitSeconds: (json['timeLimitSeconds'] as num?)?.toInt(),
      isPrivate: json['isPrivate'] ?? false,
      players: players,
      grid: grid,
      words: words,
      shareUrl: json['shareUrl'],
      deepLink: json['deepLink'],
      qrData: json['qrData'],
    );
  }
}
