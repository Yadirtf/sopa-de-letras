/// Ajustes que elige quien crea la sala (el servidor los vuelve a revisar).
enum BattleInputMode { tapOrType, typeOnly }

enum BattleOpponent { friend, bot }

class BattleConfig {
  final int cols;
  final int rows;
  final String terrainId;
  final Map<String, int> army;
  final Map<String, int> weapons;
  final BattleInputMode inputMode;
  final BattleOpponent opponent;

  const BattleConfig({
    this.cols = 20,
    this.rows = 15,
    this.terrainId = 'DESERT',
    this.army = const {},
    this.weapons = const {},
    this.inputMode = BattleInputMode.tapOrType,
    this.opponent = BattleOpponent.friend,
  });

  bool get allowsTap => inputMode == BattleInputMode.tapOrType;

  int get unitCount => army.values.fold(0, (a, b) => a + b);

  BattleConfig copyWith({
    int? cols,
    int? rows,
    String? terrainId,
    Map<String, int>? army,
    Map<String, int>? weapons,
    BattleInputMode? inputMode,
    BattleOpponent? opponent,
  }) {
    return BattleConfig(
      cols: cols ?? this.cols,
      rows: rows ?? this.rows,
      terrainId: terrainId ?? this.terrainId,
      army: army ?? this.army,
      weapons: weapons ?? this.weapons,
      inputMode: inputMode ?? this.inputMode,
      opponent: opponent ?? this.opponent,
    );
  }

  Map<String, dynamic> toJson() => {
        'cols': cols,
        'rows': rows,
        'terrain': terrainId,
        'army': army,
        'weapons': weapons,
        'inputMode': inputMode == BattleInputMode.typeOnly ? 'TYPE_ONLY' : 'TAP_OR_TYPE',
        'opponent': opponent == BattleOpponent.bot ? 'BOT' : 'FRIEND',
      };

  factory BattleConfig.fromJson(Map<String, dynamic> json) {
    Map<String, int> ints(dynamic raw) =>
        raw is Map ? raw.map((k, v) => MapEntry(k.toString(), (v as num?)?.toInt() ?? 0)) : <String, int>{};
    return BattleConfig(
      cols: (json['cols'] as num?)?.toInt() ?? 20,
      rows: (json['rows'] as num?)?.toInt() ?? 15,
      terrainId: json['terrain']?.toString() ?? 'DESERT',
      army: ints(json['army']),
      weapons: ints(json['weapons']),
      inputMode: json['inputMode'] == 'TYPE_ONLY' ? BattleInputMode.typeOnly : BattleInputMode.tapOrType,
      opponent: json['opponent'] == 'BOT' ? BattleOpponent.bot : BattleOpponent.friend,
    );
  }
}
