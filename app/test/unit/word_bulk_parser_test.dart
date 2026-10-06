import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/editor/domain/services/category_key.dart';
import 'package:wordhive_app/features/editor/domain/services/word_bulk_parser.dart';

void main() {
  group('WordBulkParser', () {
    test('separa por comas, normaliza tildes y conserva la Ñ', () {
      final r = WordBulkParser.parse('león, Árbol ,  niño,camión');
      expect(r.words, ['LEON', 'ARBOL', 'NIÑO', 'CAMION']);
    });

    test('entiende listas numeradas y con viñetas como las de una IA', () {
      const text = '1. Elefante\n2) Jirafa\n3 - Cebra\n- "Tigre"\n• Hipopótamo.';
      expect(WordBulkParser.parse(text).words, ['ELEFANTE', 'JIRAFA', 'CEBRA', 'TIGRE', 'HIPOPOTAMO']);
    });

    test('lista numerada en una sola línea', () {
      expect(WordBulkParser.parse('1. perro 2. gato 3. conejo').words, ['PERRO', 'GATO', 'CONEJO']);
    });

    test('sin separadores, los espacios separan; con separadores se unen compuestos', () {
      expect(WordBulkParser.parse('perro gato casa').words, ['PERRO', 'GATO', 'CASA']);
      expect(WordBulkParser.parse('oso polar, foca').words, ['OSOPOLAR', 'FOCA']);
    });

    test('reporta repetidas (también contra las existentes) y no válidas', () {
      final r = WordBulkParser.parse('sol, Sol, luna, ab, supercalifragilistico, 123', existing: ['LUNA']);
      expect(r.words, ['SOL']);
      expect(r.duplicates, ['SOL', 'LUNA']);
      expect(r.rejected.map((e) => e.raw), ['ab', 'supercalifragilistico', '123']);
    });

    test('respeta el máximo de 20 palabras', () {
      final existing = List.generate(18, (i) => 'PALABRA${String.fromCharCode(65 + i)}');
      final r = WordBulkParser.parse('uno, dos, tres, cuatro', existing: existing);
      expect(r.words, ['UNO', 'DOS']);
      expect(r.overLimit, 2);
    });
  });

  test('categoryKeyOf coincide con la key del servidor', () {
    expect(categoryKeyOf('  Tecnología   y ciencia! '), 'TECNOLOGIA Y CIENCIA');
    expect(categoryKeyOf('niños'), 'NIÑOS');
  });
}
