import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';
import '../../data/datasources/category_remote_datasource.dart';
import '../../data/repositories/category_repository_impl.dart';
import '../../domain/entities/category_entity.dart';
import '../../domain/repositories/category_repository.dart';

final categoryRepositoryProvider = Provider<CategoryRepository>((ref) {
  return CategoryRepositoryImpl(CategoryRemoteDataSource(ApiClient()));
});

/// Resultados del buscador de temas para un texto ya "reposado" (debounce en la vista).
final categorySearchProvider = FutureProvider.autoDispose.family<List<CategoryEntity>, String>((ref, term) async {
  final result = await ref.watch(categoryRepositoryProvider).search(term);
  return result.fold((err) => throw err, (list) => list);
});
