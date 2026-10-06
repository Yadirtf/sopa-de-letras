/// Que paso con el trazo que acaba de hacer el jugador.
enum WordAttemptOutcome { sent, notInList, alreadyMine }

/// Juez local del trazo: responde al instante (sin esperar al servidor) si lo
/// marcado es una palabra de la lista, leida en cualquiera de los dos sentidos.
class WordAttempt {
  final WordAttemptOutcome outcome;

  /// La palabra tal cual esta en la lista (aunque se haya trazado al reves).
  final String? word;

  const WordAttempt._(this.outcome, [this.word]);

  static WordAttempt evaluate(String formed, List<String> words, Iterable<String> myWords) {
    final upper = formed.toUpperCase();
    final reversed = upper.split('').reversed.join();
    final targets = {for (final w in words) w.toUpperCase()};
    final match = targets.contains(upper) ? upper : (targets.contains(reversed) ? reversed : null);
    if (match == null) return const WordAttempt._(WordAttemptOutcome.notInList);
    if (myWords.map((w) => w.toUpperCase()).contains(match)) {
      return WordAttempt._(WordAttemptOutcome.alreadyMine, match);
    }
    return WordAttempt._(WordAttemptOutcome.sent, match);
  }

  /// Frases cortas y amables para cuando el servidor no acepta la palabra.
  static String friendlyRejection(String code) => switch (code) {
        'PALABRA_YA_ENCONTRADA' => 'Ya habías encontrado esa palabra',
        'PARTIDA_NO_ACTIVA' => 'La partida ya terminó',
        'SIN_CONEXION' => 'Sin conexión: tu palabra se enviará al reconectar',
        _ => 'Esa palabra no cuenta, ¡sigue buscando!',
      };
}
