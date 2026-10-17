import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/battle_repository_impl.dart';
import '../../domain/entities/battle_catalog.dart';
import '../../domain/repositories/battle_repository.dart';

/// Un solo repositorio (y un solo socket de batalla) para toda la app.
final battleRepositoryProvider = Provider<BattleRepository>((ref) {
  final repo = BattleRepositoryImpl();
  ref.onDispose(repo.disconnect);
  return repo;
});

/// Terrenos, figuras y armas. Se pide una vez y se reintenta si falló.
final battleCatalogProvider = FutureProvider<BattleCatalog>((ref) {
  return ref.watch(battleRepositoryProvider).catalog();
});
