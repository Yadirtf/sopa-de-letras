import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import '../../domain/entities/word_search_detail_entity.dart';
import '../../domain/repositories/catalog_repository.dart';
import '../datasources/catalog_remote_datasource.dart';

class CatalogRepositoryImpl implements CatalogRepository {
  final CatalogRemoteDataSource _remoteDataSource;

  CatalogRepositoryImpl(this._remoteDataSource);

  @override
  Future<Either<String, CatalogResult>> getCatalog({
    String? cursor,
    int limit = 12,
    String? category,
    String? difficulty,
    String? search,
  }) async {
    try {
      final res = await _remoteDataSource.getCatalog(
        cursor: cursor,
        limit: limit,
        category: category,
        difficulty: difficulty,
        search: search,
      );

      final result = CatalogResult(
        items: res.items,
        nextCursor: res.nextCursor,
        totalCount: res.totalCount,
        hasMore: res.hasMore,
      );

      return Right(result);
    } on DioException catch (e) {
      final message = e.response?.data?['message']?.toString() ??
          'Error al conectar con el servidor de catálogos';
      return Left(message);
    } catch (e) {
      return Left(e.toString());
    }
  }

  @override
  Future<Either<String, WordSearchDetailEntity>> getWordSearchDetail(
    String id,
  ) async {
    try {
      final detail = await _remoteDataSource.getWordSearchDetail(id);
      return Right(detail);
    } on DioException catch (e) {
      final message = e.response?.data?['message']?.toString() ??
          'Error al obtener los detalles de la sopa';
      return Left(message);
    } catch (e) {
      return Left(e.toString());
    }
  }
}
