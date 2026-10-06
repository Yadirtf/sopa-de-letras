import 'package:equatable/equatable.dart';

class WordFoundEventEntity extends Equatable {
  final String word;
  final String claimedByUserId;
  final String claimedByUsername;
  final String colorHex;
  final int pointsAwarded;
  final int newScore;

  /// Celdas [fila, columna] de la primera y ultima letra, para pintar la palabra en el tablero.
  final List<int>? start;
  final List<int>? end;

  const WordFoundEventEntity({
    required this.word,
    required this.claimedByUserId,
    required this.claimedByUsername,
    required this.colorHex,
    required this.pointsAwarded,
    required this.newScore,
    this.start,
    this.end,
  });

  @override
  List<Object?> get props => [
        word,
        claimedByUserId,
        claimedByUsername,
        colorHex,
        pointsAwarded,
        newScore,
        start,
        end,
      ];
}

class LeaderboardEntryEntity extends Equatable {
  final int rank;
  final String userId;
  final String username;
  final String? avatarUrl;
  final String colorHex;
  final int score;
  final int wordsCount;
  final int progressPercent;

  const LeaderboardEntryEntity({
    required this.rank,
    required this.userId,
    required this.username,
    this.avatarUrl,
    required this.colorHex,
    required this.score,
    required this.wordsCount,
    required this.progressPercent,
  });

  @override
  List<Object?> get props => [
        rank,
        userId,
        username,
        avatarUrl,
        colorHex,
        score,
        wordsCount,
        progressPercent,
      ];
}

class PodiumEntryEntity extends Equatable {
  final int rank;
  final String userId;
  final String username;
  final String? avatarUrl;
  final int score;
  final int wordsCount;
  final int trophiesEarned;

  const PodiumEntryEntity({
    required this.rank,
    required this.userId,
    required this.username,
    this.avatarUrl,
    required this.score,
    required this.wordsCount,
    required this.trophiesEarned,
  });

  @override
  List<Object?> get props => [
        rank,
        userId,
        username,
        avatarUrl,
        score,
        wordsCount,
        trophiesEarned,
      ];
}

class RematchVoteStateEntity extends Equatable {
  final int votesCount;
  final int totalPlayers;
  final int requiredVotes;
  final bool hasQuorum;
  final List<String> votedUserIds;

  const RematchVoteStateEntity({
    required this.votesCount,
    required this.totalPlayers,
    required this.requiredVotes,
    required this.hasQuorum,
    required this.votedUserIds,
  });

  @override
  List<Object?> get props => [
        votesCount,
        totalPlayers,
        requiredVotes,
        hasQuorum,
        votedUserIds,
      ];
}
