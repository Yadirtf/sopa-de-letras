import '../../domain/entities/game_event_entities.dart';

class WordFoundEventModel extends WordFoundEventEntity {
  const WordFoundEventModel({
    required super.word,
    required super.claimedByUserId,
    required super.claimedByUsername,
    required super.colorHex,
    required super.pointsAwarded,
    required super.newScore,
    super.start,
    super.end,
  });

  factory WordFoundEventModel.fromJson(Map<String, dynamic> json) {
    final claimedBy = json['claimedBy'] is Map ? Map<String, dynamic>.from(json['claimedBy']) : <String, dynamic>{};
    final coords = json['coordinates'] is Map ? json['coordinates'] as Map : const {};
    return WordFoundEventModel(
      word: json['word'] ?? '',
      claimedByUserId: claimedBy['userId'] ?? '',
      claimedByUsername: claimedBy['username'] ?? 'Jugador',
      colorHex: claimedBy['colorHex'] ?? '#7C3AED',
      pointsAwarded: (json['pointsAwarded'] as num?)?.toInt() ?? 0,
      newScore: (json['newScore'] as num?)?.toInt() ?? 0,
      start: _cell(coords['start']),
      end: _cell(coords['end']),
    );
  }

  /// Palabra ya reclamada que trae la sala al reconectar (claimedWords del servidor).
  factory WordFoundEventModel.fromClaim(String word, Map<String, dynamic> claim) {
    return WordFoundEventModel(
      word: word,
      claimedByUserId: claim['userId'] ?? '',
      claimedByUsername: claim['username'] ?? 'Jugador',
      colorHex: claim['colorHex'] ?? '#7C3AED',
      pointsAwarded: 0,
      newScore: 0,
      start: _cell(claim['start']),
      end: _cell(claim['end']),
    );
  }

  static List<int>? _cell(dynamic raw) {
    if (raw is! List || raw.length != 2) return null;
    return raw.map((n) => (n as num).toInt()).toList();
  }
}

class LeaderboardEntryModel extends LeaderboardEntryEntity {
  const LeaderboardEntryModel({
    required super.rank,
    required super.userId,
    required super.username,
    super.avatarUrl,
    required super.colorHex,
    required super.score,
    required super.wordsCount,
    required super.progressPercent,
  });

  factory LeaderboardEntryModel.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntryModel(
      rank: (json['rank'] as num?)?.toInt() ?? 1,
      userId: json['userId'] ?? '',
      username: json['username'] ?? 'Jugador',
      avatarUrl: json['avatarUrl'],
      colorHex: json['colorHex'] ?? '#7C3AED',
      score: (json['score'] as num?)?.toInt() ?? 0,
      wordsCount: (json['wordsCount'] as num?)?.toInt() ?? 0,
      progressPercent: (json['progressPercent'] as num?)?.toInt() ?? 0,
    );
  }
}

class PodiumEntryModel extends PodiumEntryEntity {
  const PodiumEntryModel({
    required super.rank,
    required super.userId,
    required super.username,
    super.avatarUrl,
    required super.score,
    required super.wordsCount,
    required super.trophiesEarned,
  });

  factory PodiumEntryModel.fromJson(Map<String, dynamic> json) {
    return PodiumEntryModel(
      rank: (json['rank'] as num?)?.toInt() ?? 1,
      userId: json['userId'] ?? '',
      username: json['username'] ?? 'Jugador',
      avatarUrl: json['avatarUrl'],
      score: (json['score'] as num?)?.toInt() ?? 0,
      wordsCount: (json['wordsCount'] as num?)?.toInt() ?? 0,
      trophiesEarned: (json['trophiesEarned'] as num?)?.toInt() ?? 0,
    );
  }
}

class RematchVoteStateModel extends RematchVoteStateEntity {
  const RematchVoteStateModel({
    required super.votesCount,
    required super.totalPlayers,
    required super.requiredVotes,
    required super.hasQuorum,
    required super.votedUserIds,
  });

  factory RematchVoteStateModel.fromJson(Map<String, dynamic> json) {
    return RematchVoteStateModel(
      votesCount: (json['votesCount'] as num?)?.toInt() ?? 0,
      totalPlayers: (json['totalPlayers'] as num?)?.toInt() ?? 1,
      requiredVotes: (json['requiredVotes'] as num?)?.toInt() ?? 1,
      hasQuorum: json['hasQuorum'] ?? false,
      votedUserIds: (json['votedUserIds'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}
