import '../../../domain/entities/game_event_entities.dart';

/// Lo que cuenta el podio, calculado en un solo sitio (y facil de probar):
/// quien gano, que titular toca y como le fue al jugador que mira.
class PodiumSummary {
  final List<PodiumEntryEntity> podium;
  final String? currentUserId;
  final int totalWords;

  const PodiumSummary({required this.podium, required this.currentUserId, required this.totalWords});

  PodiumEntryEntity? get winner => podium.isEmpty ? null : podium.first;
  PodiumEntryEntity? get me => podium.where((p) => p.userId == currentUserId).firstOrNull;
  bool get isSolo => podium.length <= 1;
  bool get iWon => winner != null && winner!.userId == currentUserId;

  /// Jugadores que no caben en los tres escalones.
  List<PodiumEntryEntity> get rest => podium.length > 3 ? podium.sublist(3) : const [];

  String get headline {
    final w = winner;
    if (w == null) return 'Partida terminada';
    if (isSolo) return totalWords > 0 && w.wordsCount >= totalWords ? '¡Sopa completada!' : '¡Se acabó el tiempo!';
    return iWon ? '¡Ganaste!' : '¡${w.username} gana!';
  }

  String get subtitle {
    final w = winner;
    if (w == null) return '';
    if (isSolo) return 'Encontraste ${w.wordsCount} de $totalWords palabras';
    final mine = me;
    if (iWon) return 'Eres el campeón de esta sopa';
    if (mine == null) return 'Campeón de esta sopa';
    return 'Quedaste en el puesto ${mine.rank} de ${podium.length}';
  }
}
