import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import '../../domain/entities/category_entity.dart';
import '../../domain/repositories/category_repository.dart';
import '../datasources/category_remote_datasource.dart';

class CategoryRepositoryImpl implements CategoryRepository {
  final CategoryRemoteDataSource _remote;

  CategoryRepositoryImpl(this._remote);

  @override
  Future<Either<String, List<CategoryEntity>>> search(String term) =>
      _guard(() => _remote.search(term), 'No pudimos cargar los temas');

  @override
  Future<Either<String, CategoryEntity>> create(String name) =>
      _guard(() => _remote.create(name), 'No pudimos crear el tema');

  Future<Either<String, T>> _guard<T>(Future<T> Function() call, String fallback) async {
    try {
      return Right(await call());
    } on DioException catch (e) {
      final data = e.response?.data;
      return Left(data is Map && data['message'] != null ? data['message'].toString() : fallback);
    } catch (_) {
      return Left(fallback);
    }
  }
}
