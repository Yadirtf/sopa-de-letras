/// Misma normalización que usa el servidor para la "key" de un tema:
/// MAYÚSCULAS, sin tildes (la Ñ se respeta) y espacios simples.
String categoryKeyOf(String raw) {
  const accents = {
    'Á': 'A',
    'É': 'E',
    'Í': 'I',
    'Ó': 'O',
    'Ú': 'U',
    'Ü': 'U',
    'À': 'A',
    'È': 'E',
    'Ì': 'I',
    'Ò': 'O',
    'Ù': 'U'
  };
  final upper = raw.toUpperCase().split('').map((c) => accents[c] ?? c).join();
  return upper.replaceAll(RegExp(r'[^A-ZÑ0-9 ]'), '').replaceAll(RegExp(r'\s+'), ' ').trim();
}
