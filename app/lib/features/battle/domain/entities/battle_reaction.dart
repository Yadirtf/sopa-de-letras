/// Reacción 3D que un jugador le manda a su rival (assets/battle/reactions/<id>.webp).
class BattleReaction {
  final String id;
  final String label;

  /// Las caras del soldado van en su propia pestaña; el resto son objetos de guerra.
  final bool face;

  const BattleReaction(this.id, this.label, {this.face = false});

  /// Las mismas del backend; se usan si el catálogo llega sin ellas.
  static const defaults = [
    BattleReaction('laugh', '¡Jajaja!', face: true),
    BattleReaction('sly', 'Je, je, je', face: true),
    BattleReaction('angry', '¡Grrr!', face: true),
    BattleReaction('sad', 'Ay, no…', face: true),
    BattleReaction('shocked', '¡¿Qué?!', face: true),
    BattleReaction('cool', 'Pan comido', face: true),
    BattleReaction('boom', '¡Boom!'),
    BattleReaction('bullseye', '¡En el blanco!'),
    BattleReaction('incoming', '¡Ahí va!'),
    BattleReaction('blocked', '¡No me das!'),
    BattleReaction('alert', '¡Alerta!'),
    BattleReaction('winning', '¡Voy ganando!'),
    BattleReaction('well_played', '¡Bien jugado!'),
    BattleReaction('surrender', '¡Me rindo!'),
  ];
}

/// Reacción que acaba de llegar (o que acabo de mandar) para mostrarla en grande.
class BattleReactionShow {
  final String reactionId;
  final bool fromMe;
  final int seq;

  const BattleReactionShow({required this.reactionId, required this.fromMe, required this.seq});
}
