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
List<RaceStanding> computeRaceStandings(List<RoomPlayerEntity> players, String? me) {
  final sorted = [...players]..sort((a, b) {
      final byScore = b.score.compareTo(a.score);
      return byScore != 0 ? byScore : b.wordsFound.length.compareTo(a.wordsFound.length);
    });
  final top = sorted.isEmpty ? 0 : sorted.first.score;
  final tiedAtTop = sorted.where((p) => p.score == top).length > 1;

  var place = 0;
  int? previousScore;
  return [
    for (var i = 0; i < sorted.length; i++)
      () {
        final p = sorted[i];
        if (p.score != previousScore) place = i + 1;
        previousScore = p.score;
        return RaceStanding(
          userId: p.userId,
          username: p.username,
          colorHex: p.colorHex,
          wordsCount: p.wordsFound.length,
          score: p.score,
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
