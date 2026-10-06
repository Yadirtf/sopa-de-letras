import 'package:dartz/dartz.dart';
import '../repositories/editor_repository.dart';

class DeleteWordSearchUseCase {
  final EditorRepository _repository;

  DeleteWordSearchUseCase(this._repository);

  Future<Either<String, void>> call(String id) {
    return _repository.delete(id);
  }
}
