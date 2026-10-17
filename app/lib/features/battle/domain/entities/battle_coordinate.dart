/// Coordenadas como en papel: letra de columna (A a Z) y número de fila desde 1.
/// Acepta "H11", "H-11", "11-H", "11 h". El servidor revisa igual, esto solo
/// sirve para avisar al instante si lo escrito no tiene sentido.
abstract class BattleCoordinate {
  static const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  static String column(int col) => letters[col];

  static String format(int col, int row) => '${column(col)}${row + 1}';

  /// Devuelve (columna, fila) 0-based, o null si no se entiende.
  static (int, int)? parse(String text) {
    final clean = text.trim().toUpperCase().replaceAll(RegExp(r'[\s\-_,.:/]+'), '');
    final letterFirst = RegExp(r'^([A-Z])(\d{1,2})$').firstMatch(clean);
    final numberFirst = RegExp(r'^(\d{1,2})([A-Z])$').firstMatch(clean);
    final letter = letterFirst?.group(1) ?? numberFirst?.group(2);
    final number = letterFirst?.group(2) ?? numberFirst?.group(1);
    if (letter == null || number == null) return null;
    final row = int.parse(number) - 1;
    if (row < 0) return null;
    return (letters.indexOf(letter), row);
  }
}
