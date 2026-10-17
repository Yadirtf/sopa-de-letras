import '../../domain/entities/battle_config.dart';
import '../../domain/entities/battle_view.dart';

/// Lee la vista privada que manda el socket `/battle` (evento `state`).
abstract class BattleViewModel {
  static BattleView fromJson(Map<String, dynamic> json) {
    final myBoard = _map(json['myBoard']);
    final enemyBoard = _map(json['enemyBoard']);
    final turnEndsAt = (json['turnEndsAt'] as num?)?.toInt();
    final serverTime = (json['serverTime'] as num?)?.toInt();
    // El reloj del teléfono puede ir adelantado: se corrige con la hora del servidor.
    final skew = serverTime == null ? 0 : DateTime.now().millisecondsSinceEpoch - serverTime;

    return BattleView(
      code: json['code']?.toString() ?? '',
      status: _status(json['status']),
      config: BattleConfig.fromJson(_map(json['config'])),
      hostUserId: json['hostUserId']?.toString() ?? '',
      myUserId: json['myUserId']?.toString() ?? '',
      players: _list(json['players']).map(_player).toList(),
      turnUserId: json['turnUserId']?.toString(),
      turnEndsAt: turnEndsAt == null ? null : DateTime.fromMillisecondsSinceEpoch(turnEndsAt + skew),
      winnerUserId: json['winnerUserId']?.toString(),
      endReason: json['endReason']?.toString(),
      rematchVotes: (json['rematchVotes'] as List?)?.map((e) => e.toString()).toList() ?? const [],
      myAmmo: _map(json['myAmmo']).map((k, v) => MapEntry(k, (v as num?)?.toInt() ?? 0)),
      myUnits: _list(myBoard['units']).map(_unit).toList(),
      myMarks: _marks(myBoard['marks']),
      enemyMarks: _marks(enemyBoard['marks']),
      enemyRevealed: _list(enemyBoard['revealed']).map(_unit).toList(),
      scans: _list(enemyBoard['scans'])
          .map((s) => RadarScanView(col: _int(s['col']), row: _int(s['row']), count: _int(s['count'])))
          .toList(),
      lastShot: json['lastShot'] is Map ? shot(_map(json['lastShot'])) : null,
    );
  }

  static ShotReportView shot(Map<String, dynamic> s) => ShotReportView(
        seq: _int(s['seq']),
        shooterId: s['shooterId']?.toString() ?? '',
        weapon: s['weapon']?.toString() ?? 'BULLET',
        col: _int(s['col']),
        row: _int(s['row']),
        cells: _list(s['cells'])
            .map((c) =>
                ShotCellView(col: _int(c['col']), row: _int(c['row']), result: c['result']?.toString() ?? 'MISS'))
            .toList(),
        destroyedCount: (s['destroyed'] as List?)?.length ?? 0,
        radarCount: (s['radarCount'] as num?)?.toInt(),
        keepsTurn: s['keepsTurn'] == true,
      );

  static BattleStatus _status(dynamic raw) => switch (raw) {
        'PLACING' => BattleStatus.placing,
        'PLAYING' => BattleStatus.playing,
        'FINISHED' => BattleStatus.finished,
        _ => BattleStatus.waiting,
      };

  static BattlePlayerInfo _player(Map<String, dynamic> p) => BattlePlayerInfo(
        userId: p['userId']?.toString() ?? '',
        username: p['username']?.toString() ?? 'Jugador',
        avatarUrl: p['avatarUrl']?.toString(),
        isBot: p['isBot'] == true,
        isReady: p['isReady'] == true,
        score: _int(p['score']),
        unitsTotal: _int(p['unitsTotal']),
        unitsAlive: _int(p['unitsAlive']),
        shotsFired: _int(p['shotsFired']),
        hitsLanded: _int(p['hitsLanded']),
      );

  static BattleUnitView _unit(Map<String, dynamic> u) => BattleUnitView(
        typeId: u['typeId']?.toString() ?? '',
        col: _int(u['col']),
        row: _int(u['row']),
        width: _int(u['width']),
        height: _int(u['height']),
        rotated: u['rotated'] == true,
        hitCells: (u['hitCells'] as List?)?.map((e) => e.toString()).toSet() ?? const {},
      );

  static Map<String, CellMark> _marks(dynamic raw) => {
        for (final m in _list(raw))
          BattleView.key(_int(m['col']), _int(m['row'])): m['mark'] == 'HIT' ? CellMark.hit : CellMark.miss,
      };

  static Map<String, dynamic> _map(dynamic raw) => raw is Map ? raw.cast<String, dynamic>() : <String, dynamic>{};

  static List<Map<String, dynamic>> _list(dynamic raw) =>
      raw is List ? raw.whereType<Map>().map((m) => m.cast<String, dynamic>()).toList() : const [];

  static int _int(dynamic v) => (v as num?)?.toInt() ?? 0;
}
