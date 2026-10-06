import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/game/data/models/game_room_model.dart';
import 'package:wordhive_app/features/game/data/models/game_event_models.dart';
import 'package:wordhive_app/features/game/domain/entities/game_room_entity.dart';

void main() {
  group('Game Models Test', () {
    test('GameRoomModel debe deserializarse correctamente desde JSON', () {
      final json = {
        'id': 'room-1',
        'code': 'HIVE92',
        'wordSearchId': 'ws-123',
        'wordSearchTitle': 'Animales',
        'hostUserId': 'host-1',
        'status': 'WAITING',
        'maxPlayers': 4,
        'timeLimitSeconds': 180,
        'isPrivate': false,
        'players': [
          {
            'userId': 'host-1',
            'username': 'Anfitrión',
            'isHost': true,
            'isReady': true,
            'score': 0,
            'wordsFound': [],
            'colorHex': '#7C3AED',
          }
        ],
        'grid': [
          ['L', 'E', 'O', 'N'],
          ['T', 'I', 'G', 'R'],
        ],
        'words': ['LEON', 'TIGRE'],
      };

      final model = GameRoomModel.fromJson(json);

      expect(model.id, 'room-1');
      expect(model.code, 'HIVE92');
      expect(model.status, RoomStatusEnum.waiting);
      expect(model.players.length, 1);
      expect(model.players.first.username, 'Anfitrión');
      expect(model.words, ['LEON', 'TIGRE']);
      expect(model, isA<GameRoomEntity>());
    });

    test('WordFoundEventModel debe deserializar payload de Socket.IO', () {
      final json = {
        'word': 'LEON',
        'claimedBy': {
          'userId': 'user-2',
          'username': 'Player2',
          'colorHex': '#06B6D4',
        },
        'pointsAwarded': 150,
        'newScore': 350,
      };

      final event = WordFoundEventModel.fromJson(json);

      expect(event.word, 'LEON');
      expect(event.claimedByUserId, 'user-2');
      expect(event.claimedByUsername, 'Player2');
      expect(event.colorHex, '#06B6D4');
      expect(event.pointsAwarded, 150);
      expect(event.newScore, 350);
    });

    test('LeaderboardEntryModel debe deserializar entrada de marcador', () {
      final json = {
        'rank': 1,
        'userId': 'user-1',
        'username': 'Champion',
        'avatarUrl': null,
        'colorHex': '#F59E0B',
        'score': 450,
        'wordsCount': 3,
        'progressPercent': 60,
      };

      final entry = LeaderboardEntryModel.fromJson(json);

      expect(entry.rank, 1);
      expect(entry.username, 'Champion');
      expect(entry.score, 450);
      expect(entry.progressPercent, 60);
    });
  });
}
