import 'package:equatable/equatable.dart';
import '../../domain/entities/game_room_entity.dart';
import '../../domain/entities/game_event_entities.dart';

class GameRoomState extends Equatable {
  final GameRoomEntity? room;
  final bool isLoading;

  /// El anfitrion pulso Iniciar y esperamos la cuenta atras del servidor.
  final bool isStarting;
  final String? errorMessage;
  final int? countdownValue;
  final bool isGameActive;
  final List<LeaderboardEntryEntity> leaderboard;
  final List<PodiumEntryEntity> podium;
  final Map<String, WordFoundEventEntity> claimedWords;
  final RematchVoteStateEntity? rematchState;
  final WordFoundEventEntity? latestWordFound;

  const GameRoomState({
    this.room,
    this.isLoading = false,
    this.isStarting = false,
    this.errorMessage,
    this.countdownValue,
    this.isGameActive = false,
    this.leaderboard = const [],
    this.podium = const [],
    this.claimedWords = const {},
    this.rematchState,
    this.latestWordFound,
  });

  GameRoomState copyWith({
    GameRoomEntity? room,
    bool? isLoading,
    bool? isStarting,
    String? errorMessage,
    int? countdownValue,
    bool clearCountdown = false,
    bool? isGameActive,
    List<LeaderboardEntryEntity>? leaderboard,
    List<PodiumEntryEntity>? podium,
    Map<String, WordFoundEventEntity>? claimedWords,
    RematchVoteStateEntity? rematchState,
    WordFoundEventEntity? latestWordFound,
  }) {
    return GameRoomState(
      room: room ?? this.room,
      isLoading: isLoading ?? this.isLoading,
      isStarting: isStarting ?? this.isStarting,
      errorMessage: errorMessage,
      countdownValue: clearCountdown ? null : (countdownValue ?? this.countdownValue),
      isGameActive: isGameActive ?? this.isGameActive,
      leaderboard: leaderboard ?? this.leaderboard,
      podium: podium ?? this.podium,
      claimedWords: claimedWords ?? this.claimedWords,
      rematchState: rematchState ?? this.rematchState,
      latestWordFound: latestWordFound ?? this.latestWordFound,
    );
  }

  @override
  List<Object?> get props => [
        room,
        isLoading,
        isStarting,
        errorMessage,
        countdownValue,
        isGameActive,
        leaderboard,
        podium,
        claimedWords,
        rematchState,
        latestWordFound,
      ];
}
