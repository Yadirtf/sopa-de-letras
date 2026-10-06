import 'package:equatable/equatable.dart';

enum RoomStatusEnum { waiting, countdown, inProgress, finished }

class RoomPlayerEntity extends Equatable {
  final String userId;
  final String username;
  final String? avatarUrl;
  final bool isHost;
  final bool isReady;
  final int score;
  final List<String> wordsFound;
  final String colorHex;
  final int? rank;

  const RoomPlayerEntity({
    required this.userId,
    required this.username,
    this.avatarUrl,
    required this.isHost,
    required this.isReady,
    required this.score,
    required this.wordsFound,
    required this.colorHex,
    this.rank,
  });

  RoomPlayerEntity copyWith({
    bool? isReady,
    int? score,
    List<String>? wordsFound,
    int? rank,
  }) {
    return RoomPlayerEntity(
      userId: userId,
      username: username,
      avatarUrl: avatarUrl,
      isHost: isHost,
      isReady: isReady ?? this.isReady,
      score: score ?? this.score,
      wordsFound: wordsFound ?? this.wordsFound,
      colorHex: colorHex,
      rank: rank ?? this.rank,
    );
  }

  @override
  List<Object?> get props => [
        userId,
        username,
        avatarUrl,
        isHost,
        isReady,
        score,
        wordsFound,
        colorHex,
        rank,
      ];
}

class GameRoomEntity extends Equatable {
  final String id;
  final String code;
  final String wordSearchId;
  final String wordSearchTitle;
  final String hostUserId;
  final RoomStatusEnum status;
  final int maxPlayers;
  final int? timeLimitSeconds;
  final bool isPrivate;
  final List<RoomPlayerEntity> players;
  final List<List<String>> grid;
  final List<String> words;
  final String? shareUrl;
  final String? deepLink;
  final String? qrData;

  const GameRoomEntity({
    required this.id,
    required this.code,
    required this.wordSearchId,
    required this.wordSearchTitle,
    required this.hostUserId,
    required this.status,
    required this.maxPlayers,
    this.timeLimitSeconds,
    required this.isPrivate,
    required this.players,
    this.grid = const [],
    this.words = const [],
    this.shareUrl,
    this.deepLink,
    this.qrData,
  });

  bool get isFull => players.length >= maxPlayers;

  GameRoomEntity copyWith({
    String? hostUserId,
    RoomStatusEnum? status,
    List<RoomPlayerEntity>? players,
    List<List<String>>? grid,
    List<String>? words,
  }) {
    return GameRoomEntity(
      id: id,
      code: code,
      wordSearchId: wordSearchId,
      wordSearchTitle: wordSearchTitle,
      hostUserId: hostUserId ?? this.hostUserId,
      status: status ?? this.status,
      maxPlayers: maxPlayers,
      timeLimitSeconds: timeLimitSeconds,
      isPrivate: isPrivate,
      players: players ?? this.players,
      grid: grid ?? this.grid,
      words: words ?? this.words,
      shareUrl: shareUrl,
      deepLink: deepLink,
      qrData: qrData,
    );
  }

  @override
  List<Object?> get props => [
        id,
        code,
        wordSearchId,
        wordSearchTitle,
        hostUserId,
        status,
        maxPlayers,
        timeLimitSeconds,
        isPrivate,
        players,
        grid,
        words,
      ];
}
