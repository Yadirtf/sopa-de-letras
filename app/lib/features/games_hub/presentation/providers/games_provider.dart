import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';

/// Un juego de WordHive tal como lo lista el servidor (`GET /games`).
class GameInfo {
  final String id;
  final String name;
  final String tagline;
  final bool isNew;
  final String appPath;

  const GameInfo({
    required this.id,
    required this.name,
    required this.tagline,
    required this.isNew,
    required this.appPath,
  });

  factory GameInfo.fromJson(Map<String, dynamic> json) => GameInfo(
        id: json['id'].toString(),
        name: json['name']?.toString() ?? '',
        tagline: json['tagline']?.toString() ?? '',
        isNew: json['isNew'] == true,
        appPath: json['appPath']?.toString() ?? '/home',
      );
}

/// Si el servidor está dormido (Render) o no hay internet, igual se muestran los dos juegos.
const fallbackGames = [
  GameInfo(
    id: 'word-search',
    name: 'Sopa de letras',
    tagline: 'Encuentra las palabras antes que tus amigos.',
    isNew: false,
    appPath: '/home/sopa',
  ),
  GameInfo(
    id: 'battle',
    name: 'La Batalla Más Temida',
    tagline: 'Esconde tu ejército, elige el terreno y dispara por coordenadas.',
    isNew: true,
    appPath: '/batalla',
  ),
];

final gamesProvider = FutureProvider<List<GameInfo>>((ref) async {
  try {
    final response = await ApiClient().dio.get(ApiEndpoints.games);
    final list =
        (response.data['data'] as List).whereType<Map>().map((g) => GameInfo.fromJson(g.cast<String, dynamic>()));
    return list.isEmpty ? fallbackGames : list.toList();
  } catch (_) {
    return fallbackGames;
  }
});
