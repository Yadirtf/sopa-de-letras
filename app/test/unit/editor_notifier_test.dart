import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:wordhive_app/features/editor/data/models/category_model.dart';
import 'package:wordhive_app/features/editor/domain/entities/category_entity.dart';
import 'package:wordhive_app/features/editor/domain/entities/preview_word_search_entity.dart';
import 'package:wordhive_app/features/editor/domain/repositories/editor_repository.dart';
import 'package:wordhive_app/features/editor/domain/usecases/create_word_search_usecase.dart';
import 'package:wordhive_app/features/editor/domain/usecases/preview_word_search_usecase.dart';
import 'package:wordhive_app/features/editor/presentation/providers/editor_notifier.dart';

class _MockRepo extends Mock implements EditorRepository {}

void main() {
  late _MockRepo repo;
  late EditorNotifier notifier;

  setUp(() {
    repo = _MockRepo();
    notifier = EditorNotifier(PreviewWordSearchUseCase(repo), CreateWordSearchUseCase(repo));
  });

  test('addFromText agrega una lista pegada y agranda la cuadrícula si hace falta', () {
    final result = notifier.addFromText('gato, perro, gato, paralelepipedos');
    expect(result.words, ['GATO', 'PERRO', 'PARALELEPIPEDOS']);
    expect(notifier.state.words, ['GATO', 'PERRO', 'PARALELEPIPEDOS']);
    expect(notifier.state.gridSize, 15);
  });

  test('replaceWord corrige, avisa de repetidas y longitudes inválidas', () {
    notifier.addFromText('gato, perro');
    expect(notifier.replaceWord('GATO', 'perro'), 'PERRO ya está en la lista');
    expect(notifier.replaceWord('GATO', 'ab'), isNotNull);
    expect(notifier.replaceWord('GATO', 'gatito'), isNull);
    expect(notifier.state.words, ['GATITO', 'PERRO']);
  });

  test('cambiar palabras o dificultad descarta la vista previa', () async {
    notifier.addFromText('uno, dos, tres, cuatro, cinco');
    notifier.setTitle('Números');
    notifier.setCategory(const CategoryEntity(key: 'CIENCIA', label: 'Ciencia'));
    when(() => repo.preview(
          words: any(named: 'words'),
          gridSize: any(named: 'gridSize'),
          difficulty: any(named: 'difficulty'),
        )).thenAnswer((_) async => const Right(PreviewWordSearchEntity(grid: [
          ['A']
        ], placedWords: [], gridSize: 1)));

    expect(await notifier.generatePreview(), isTrue);
    expect(notifier.state.preview, isNotNull);
    notifier.removeWord('UNO');
    expect(notifier.state.preview, isNull);
  });

  test('pide tema antes de generar la vista previa', () async {
    notifier.addFromText('uno, dos, tres, cuatro, cinco');
    notifier.setTitle('Números');
    expect(await notifier.generatePreview(), isFalse);
    expect(notifier.state.errorMessage, 'Elige un tema para tu sopa');
  });

  test('CategoryModel lee la respuesta del servidor', () {
    final model = CategoryModel.fromJson(const {'key': 'MUSICA', 'label': 'Música', 'usageCount': 3});
    expect(model.label, 'Música');
    expect(model.usageCount, 3);
  });
}
