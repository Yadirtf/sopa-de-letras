import '../../../../core/network/api_error.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../../domain/entities/battle_catalog.dart';
import '../../domain/entities/battle_config.dart';
import '../../domain/entities/battle_view.dart';
import '../../domain/repositories/battle_repository.dart';
import '../datasources/battle_remote_datasource.dart';
import '../datasources/battle_socket_datasource.dart';
import '../models/battle_view_model.dart';

class BattleRepositoryImpl implements BattleRepository {
  final BattleRemoteDataSource _remote;
  final BattleSocketDataSource _socket;
  final SecureStorageService _storage;

  BattleRepositoryImpl({
    BattleRemoteDataSource? remote,
    BattleSocketDataSource? socket,
    SecureStorageService? storage,
  })  : _remote = remote ?? BattleRemoteDataSource(),
        _socket = socket ?? BattleSocketDataSource(),
        _storage = storage ?? SecureStorageService();

  Future<T> _http<T>(Future<T> Function() call) async {
    try {
      return await call();
    } catch (e) {
      throw BattleFailure('HTTP', friendlyApiError(e));
    }
  }

  @override
  Future<BattleCatalog> catalog() => _http(_remote.catalog);

  @override
  Future<Map<String, int>> recommendation({required String terrainId, required int cols, required int rows}) =>
      _http(() => _remote.recommendation(terrainId: terrainId, cols: cols, rows: rows));

  @override
  Future<String> createRoom(BattleConfig config) => _http(() => _remote.createRoom(config));

  @override
  Stream<BattleUpdate> get updates => _socket.updates;

  @override
  Stream<bool> get connection => _socket.connection;

  @override
  Stream<BattleReactionEvent> get reactions => _socket.reactions;

  @override
  Future<void> react(String code, String reactionId) =>
      _socket.emit('react', {'code': code, 'reaction': reactionId});

  @override
  Future<BattleView> join(String code) async {
    final token = await _storage.getAccessToken();
    if (token == null || token.isEmpty) {
      throw const BattleFailure('SIN_SESION', 'Inicia sesión para jugar la batalla.');
    }
    _socket.connect(token);
    final reply = await _socket.emit('join', {'code': code.toUpperCase()});
    return BattleViewModel.fromJson((reply['view'] as Map).cast<String, dynamic>());
  }

  @override
  Future<List<UnitPlacement>> randomLayout(String code) async {
    final reply = await _socket.emit('random-layout', {'code': code});
    return (reply['units'] as List)
        .whereType<Map>()
        .map((u) => UnitPlacement(
              typeId: u['typeId'].toString(),
              col: (u['col'] as num).toInt(),
              row: (u['row'] as num).toInt(),
              rotated: u['rotated'] == true,
            ))
        .toList();
  }

  @override
  Future<void> place(String code, List<UnitPlacement> units) =>
      _socket.emit('place', {'code': code, 'units': units.map((u) => u.toJson()).toList()});

  @override
  Future<ShotReportView> shoot(String code, {required String weapon, required int col, required int row}) async {
    final reply = await _socket.emit('shoot', {'code': code, 'weapon': weapon, 'col': col, 'row': row});
    return BattleViewModel.shot((reply['shot'] as Map).cast<String, dynamic>());
  }

  @override
  Future<void> rematch(String code) => _socket.emit('rematch', {'code': code});

  @override
  Future<void> leave(String code) => _socket.emit('leave', {'code': code});

  @override
  void disconnect() => _socket.disconnect();
}
