import 'dart:math' as math;
import '../../domain/entities/game_event_entities.dart';
import '../../domain/entities/game_room_entity.dart';

/// Un carril de la carrera: cuanto lleva cada jugador y si va adelante.
class RaceStanding {
  final String userId;
  final String username;
  final String colorHex;
  final int wordsCount;
  final int score;
  final int place;
  final bool isMe;
  final bool isLeader;
  final bool isConnected;

  const RaceStanding({
    required this.userId,
    required this.username,
    required this.colorHex,
    required this.wordsCount,
    required this.score,
    required this.place,
    required this.isMe,
    required this.isLeader,
    required this.isConnected,
  });
}

/// Ordena por puntos (desempata por palabras) y marca al lider solo si va
/// adelante de verdad: con un empate en la punta nadie lleva la corona.
///
/// El avance del oponente llega por el marcador ([leaderboard]): cuantas palabras
/// y puntos lleva, sin decir cuales. Tomamos lo mas reciente de ambas fuentes.
List<RaceStanding> computeRaceStandings(
  List<RoomPlayerEntity> players,
  String? me, [
  List<LeaderboardEntryEntity> leaderboard = const [],
]) {
  final board = {for (final e in leaderboard) e.userId: e};
  int words(RoomPlayerEntity p) => math.max(p.wordsFound.length, board[p.userId]?.wordsCount ?? 0);
  int score(RoomPlayerEntity p) => math.max(p.score, board[p.userId]?.score ?? 0);

  final sorted = [...players]..sort((a, b) {
      final byScore = score(b).compareTo(score(a));
      return byScore != 0 ? byScore : words(b).compareTo(words(a));
    });
  final top = sorted.isEmpty ? 0 : score(sorted.first);
  final tiedAtTop = sorted.where((p) => score(p) == top).length > 1;

  var place = 0;
  int? previousScore;
  return [
    for (var i = 0; i < sorted.length; i++)
      () {
        final p = sorted[i];
        if (score(p) != previousScore) place = i + 1;
        previousScore = score(p);
        return RaceStanding(
          userId: p.userId,
          username: p.username,
          colorHex: p.colorHex,
          wordsCount: words(p),
          score: score(p),
          place: place,
          isMe: p.userId == me,
          isLeader: i == 0 && top > 0 && !tiedAtTop,
          isConnected: p.isConnected,
        );
      }(),
  ];
}

/// Una frase que se entiende de un vistazo, para chicos y grandes.
String raceHeadline(List<RaceStanding> standings) {
  if (standings.length <= 1) return '¡Encuentra todas las palabras!';
  if (standings.every((s) => s.score == 0)) return '¡A buscar! Nadie ha encontrado palabras aún';
  final leader = standings.where((s) => s.isLeader).firstOrNull;
  if (leader == null) return '¡Empate en el primer lugar!';
  if (leader.isMe) return '¡Vas ganando! Sigue así';
  final mine = standings.where((s) => s.isMe).firstOrNull;
  final suffix = mine == null ? '' : ' · tú vas de ${mine.place}º';
  return '${leader.username} va adelante$suffix';
}
