/// Convierte texto pegado (separado por comas, en lista numerada, con viñetas
/// o una palabra por línea, como lo devuelven las IA) en palabras listas para
/// la sopa: MAYÚSCULAS, sin tildes (la Ñ se respeta) y sin repetidas.
class WordBulkParser {
  static const minLength = 3;
  static const maxLength = 15;
  static const maxWords = 20;

  static final _numbering = RegExp(r'(^|\s)\d+\s*[.)\-:]+');
  static final _separators = RegExp(r'[,;\n\r\t|•·]+');
  static final _edgeNoise = RegExp(r'''^[\s\-*"'“”«»]+|[\s"'“”«».]+$''');
  static const _accents = {
    'Á': 'A',
    'À': 'A',
    'Ä': 'A',
    'Â': 'A',
    'É': 'E',
    'È': 'E',
    'Ë': 'E',
    'Ê': 'E',
    'Í': 'I',
    'Ì': 'I',
    'Ï': 'I',
    'Î': 'I',
    'Ó': 'O',
    'Ò': 'O',
    'Ö': 'O',
    'Ô': 'O',
    'Ú': 'U',
    'Ù': 'U',
    'Ü': 'U',
    'Û': 'U'
  };

  /// Una sola palabra tal como la guarda el servidor.
  static String normalize(String raw) {
    final upper = raw.trim().toUpperCase();
    final buffer = StringBuffer();
    for (final char in upper.split('')) {
      buffer.write(_accents[char] ?? char);
    }
    return buffer.toString().replaceAll(RegExp(r'[^A-ZÑ]'), '');
  }

  /// Corta el texto en trozos. Si no hay ningún separador, los espacios
  /// separan ("perro gato casa"); si los hay, se respetan los nombres
  /// compuestos ("oso polar" → OSOPOLAR).
  static List<String> split(String text) {
    final unnumbered = text.replaceAllMapped(_numbering, (m) => '${m[1]}\n');
    final hasSeparators = _separators.hasMatch(unnumbered);
    final pieces = unnumbered.split(hasSeparators ? _separators : RegExp(r'\s+'));
    return pieces.map((p) => p.replaceAll(_edgeNoise, '')).where((p) => p.isNotEmpty).toList();
  }

  static WordBulkParseResult parse(String text, {List<String> existing = const []}) {
    final seen = existing.toSet();
    final accepted = <String>[];
    final duplicates = <String>[];
    final rejected = <RejectedWord>[];
    var overLimit = 0;

    for (final raw in split(text)) {
      final word = normalize(raw);
      final reason = _rejectionReason(word);
      if (reason != null) {
        rejected.add(RejectedWord(raw, reason));
      } else if (seen.contains(word)) {
        duplicates.add(word);
      } else if (existing.length + accepted.length >= maxWords) {
        overLimit++;
      } else {
        seen.add(word);
        accepted.add(word);
      }
    }
    return WordBulkParseResult(words: accepted, duplicates: duplicates, rejected: rejected, overLimit: overLimit);
  }

  static String? _rejectionReason(String word) {
    if (word.isEmpty) return 'No tiene letras';
    if (word.length < minLength) return 'Muy corta (mín. $minLength letras)';
    if (word.length > maxLength) return 'Muy larga (máx. $maxLength letras)';
    return null;
  }
}

class RejectedWord {
  final String raw;
  final String reason;

  const RejectedWord(this.raw, this.reason);
}

class WordBulkParseResult {
  final List<String> words;
  final List<String> duplicates;
  final List<RejectedWord> rejected;

  /// Palabras válidas que no caben porque ya se llegó al máximo.
  final int overLimit;

  const WordBulkParseResult({
    required this.words,
    required this.duplicates,
    required this.rejected,
    required this.overLimit,
  });

  bool get isEmpty => words.isEmpty && duplicates.isEmpty && rejected.isEmpty && overLimit == 0;
}
