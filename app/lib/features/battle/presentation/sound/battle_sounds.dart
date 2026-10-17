import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

/// Sonidos de la batalla (assets/battle/sounds). El toque de corneta avisa
/// que te toca atacar; el tic marca los últimos segundos del turno. Cada
/// reacción trae su propio sonido en reactions/<id>.mp3.
enum BattleSound {
  turn('turn.mp3', 0.9),
  tick('tick.mp3', 0.6);

  final String file;
  final double volume;
  const BattleSound(this.file, this.volume);
}

/// Reproduce los sonidos si el jugador no los apagó. Nunca rompe el juego:
/// si el navegador o el teléfono no deja sonar, se queda en silencio.
class BattleSounds extends StateNotifier<bool> {
  static const _box = 'battle_prefs';
  static const _key = 'sound_on';

  /// Las pruebas lo apagan: allí no hay reproductor de audio.
  @visibleForTesting
  static bool enabled = true;

  final Map<BattleSound, AudioPlayer> _players = {};
  AudioPlayer? _reaction;

  BattleSounds() : super(true) {
    _load();
  }

  bool get isOn => state;

  Future<void> _load() async {
    try {
      final box = await Hive.openBox(_box);
      if (mounted) state = box.get(_key, defaultValue: true) as bool;
    } catch (_) {
      // Sin almacenamiento: queda encendido.
    }
  }

  Future<void> toggle() async {
    state = !state;
    try {
      (await Hive.openBox(_box)).put(_key, state);
    } catch (_) {}
  }

  Future<void> play(BattleSound sound) async {
    if (!state || !enabled) return;
    try {
      final player = _players[sound] ??= AudioPlayer()..setReleaseMode(ReleaseMode.stop);
      await player.stop();
      await player.play(AssetSource('battle/sounds/${sound.file}'), volume: sound.volume);
    } catch (e) {
      debugPrint('[BattleSounds] ${sound.name}: $e');
    }
  }

  /// Sonido de la escena de una reacción; la que yo mando suena más bajito.
  /// Una reacción nueva corta la anterior.
  Future<void> playReaction(String id, {bool quiet = false}) async {
    if (!state || !enabled) return;
    try {
      final player = _reaction ??= AudioPlayer()..setReleaseMode(ReleaseMode.stop);
      await player.stop();
      await player.play(AssetSource('battle/sounds/reactions/$id.mp3'), volume: quiet ? 0.6 : 1);
    } catch (e) {
      debugPrint('[BattleSounds] reacción $id: $e');
    }
  }

  @override
  void dispose() {
    _reaction?.dispose();
    for (final p in _players.values) {
      p.dispose();
    }
    super.dispose();
  }
}

final battleSoundsProvider = StateNotifierProvider<BattleSounds, bool>((ref) => BattleSounds());
