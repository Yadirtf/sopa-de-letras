import 'battle_arena_marks.dart';
import 'battle_config.dart';

export 'battle_arena_marks.dart';

/// Lo que este jugador ve de la batalla: su tablero entero y, del rival,
/// solo sus propios disparos y las figuras que ya cayeron.
enum BattleStatus { waiting, placing, playing, finished }

class BattlePlayerInfo {
  final String userId;
  final String username;
  final String? avatarUrl;
  final bool isBot;
  final bool isReady;
  final int score;
  final int unitsTotal;
  final int unitsAlive;
  final int shotsFired;
  final int hitsLanded;

  const BattlePlayerInfo({
    required this.userId,
    required this.username,
    this.avatarUrl,
    this.isBot = false,
    this.isReady = false,
    this.score = 0,
    this.unitsTotal = 0,
    this.unitsAlive = 0,
    this.shotsFired = 0,
    this.hitsLanded = 0,
  });

  /// Aciertos sobre disparos, en porcentaje.
  int get accuracy => shotsFired == 0 ? 0 : (hitsLanded * 100 / shotsFired).round();
}

class BattleView {
  final String code;
  final BattleStatus status;
  final BattleConfig config;
  final String hostUserId;
  final String myUserId;
  final List<BattlePlayerInfo> players;
  final String? turnUserId;
  final DateTime? turnEndsAt;
  final String? winnerUserId;
  final String? endReason;
  final List<String> rematchVotes;
  final Map<String, int> myAmmo;
  final List<BattleUnitView> myUnits;
  final Map<String, CellMark> myMarks;
  final Map<String, CellMark> enemyMarks;
  final List<BattleUnitView> enemyRevealed;
  final List<RadarScanView> scans;
  final ShotReportView? lastShot;

  const BattleView({
    required this.code,
    required this.status,
    required this.config,
    required this.hostUserId,
    required this.myUserId,
    required this.players,
    this.turnUserId,
    this.turnEndsAt,
    this.winnerUserId,
    this.endReason,
    this.rematchVotes = const [],
    this.myAmmo = const {},
    this.myUnits = const [],
    this.myMarks = const {},
    this.enemyMarks = const {},
    this.enemyRevealed = const [],
    this.scans = const [],
    this.lastShot,
  });

  static String key(int col, int row) => '$col,$row';

  BattlePlayerInfo? get me => _find((p) => p.userId == myUserId);
  BattlePlayerInfo? get enemy => _find((p) => p.userId != myUserId);
  bool get isMyTurn => status == BattleStatus.playing && turnUserId == myUserId;
  bool get iWon => winnerUserId == myUserId;
  bool get amReady => me?.isReady ?? false;
  bool get iVotedRematch => rematchVotes.contains(myUserId);

  BattlePlayerInfo? _find(bool Function(BattlePlayerInfo) test) {
    for (final p in players) {
      if (test(p)) return p;
    }
    return null;
  }
}
