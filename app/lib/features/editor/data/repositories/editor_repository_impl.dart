import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import '../../domain/entities/preview_word_search_entity.dart';
import '../../domain/entities/my_word_search_entity.dart';
import '../../domain/repositories/editor_repository.dart';
import '../datasources/editor_remote_datasource.dart';

class EditorRepositoryImpl implements EditorRepository {
  final EditorRemoteDataSource _remoteDataSource;

  EditorRepositoryImpl(this._remoteDataSource);

  @override
  Future<Either<String, PreviewWordSearchEntity>> preview({
    required List<String> words,
    required int gridSize,
    required String difficulty,
  }) async {
    try {
      final res = await _remoteDataSource.preview(
        words: words,
        gridSize: gridSize,
        difficulty: difficulty,
      );
      return Right(res);
    } on DioException catch (e) {
      return Left(e.response?.data?['message']?.toString() ?? 'Error al generar previsualización');
    } catch (e) {
      return Left(e.toString());
    }
  }

  @override
  Future<Either<String, MyWordSearchEntity>> create({
    required String title,
    String? description,
    required String category,
    required String difficulty,
    required int gridSize,
    required List<String> words,
    bool isPublic = true,
  }) async {
    try {
      final res = await _remoteDataSource.create(
        title: title,
        description: description,
        category: category,
        difficulty: difficulty,
        gridSize: gridSize,
        words: words,
        isPublic: isPublic,
      );
      return Right(res);
    } on DioException catch (e) {
      return Left(e.response?.data?['message']?.toString() ?? 'Error al crear la sopa');
    } catch (e) {
      return Left(e.toString());
    }
  }

  @override
  Future<Either<String, List<MyWordSearchEntity>>> getMyWordSearches() async {
    try {
      final list = await _remoteDataSource.getMyWordSearches();
      return Right(list);
    } on DioException catch (e) {
      return Left(e.response?.data?['message']?.toString() ?? 'Error al cargar tus creaciones');
    } catch (e) {
      return Left(e.toString());
    }
  }

  @override
  Future<Either<String, void>> delete(String id) async {
    try {
      await _remoteDataSource.delete(id);
      return const Right(null);
    } on DioException catch (e) {
      return Left(e.response?.data?['message']?.toString() ?? 'Error al eliminar la sopa');
    } catch (e) {
      return Left(e.toString());
    }
  }
}
