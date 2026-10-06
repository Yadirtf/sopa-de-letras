import 'package:dartz/dartz.dart';
import '../entities/category_entity.dart';

abstract class CategoryRepository {
  /// Temas que coinciden con [term]; vacío devuelve los más usados.
  Future<Either<String, List<CategoryEntity>>> search(String term);

  /// Crea el tema o devuelve el equivalente si ya existía.
  Future<Either<String, CategoryEntity>> create(String name);
}
