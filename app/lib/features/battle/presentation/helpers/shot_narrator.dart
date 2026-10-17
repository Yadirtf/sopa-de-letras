import '../../domain/entities/battle_coordinate.dart';
import '../../domain/entities/battle_view.dart';

/// Frase corta que cuenta qué pasó con el último disparo, como lo diría el rival en papel.
abstract class ShotNarrator {
  static String? describe(ShotReportView? shot, String myUserId, {required String enemyName}) {
    if (shot == null) return null;
    final where = BattleCoordinate.format(shot.col, shot.row);
    final mine = shot.shooterId == myUserId;
    if (shot.weapon == 'RADAR') {
      final n = shot.radarCount ?? 0;
      return mine
          ? '📡 Tu radar en $where encontró $n ${n == 1 ? 'casilla ocupada' : 'casillas ocupadas'}. Sigues tú.'
          : '📡 $enemyName usó el radar cerca de $where.';
    }
    final hits = shot.cells.where((c) => c.result == 'HIT').length;
    if (mine) {
      if (shot.destroyedCount > 0) return '💥 ¡Destruido en $where! Cayó una figura del rival. Dispara otra vez.';
      if (hits > 0) return '🔥 ¡Tocado en $where! Dispara otra vez.';
      return '💧 Agua en $where. Ahora le toca a $enemyName.';
    }
    if (shot.destroyedCount > 0) return '😱 $enemyName destruyó una de tus figuras en $where.';
    if (hits > 0) return '⚠️ $enemyName te dio en $where.';
    return '😅 $enemyName falló en $where. ¡Te toca!';
  }
}
