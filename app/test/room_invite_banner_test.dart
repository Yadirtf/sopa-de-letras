import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/social/domain/entities/room_invite_entity.dart';
import 'package:wordhive_app/features/social/presentation/widgets/room_invite_banner.dart';

void main() {
  testWidgets('el banner muestra quién invita y responde a los botones', (tester) async {
    var joined = false;
    var dismissed = false;
    final invite = RoomInviteEntity(
      roomCode: 'HIVE42',
      wordSearchTitle: 'Animales',
      fromName: 'Ana',
      expiresAt: DateTime.now().add(const Duration(seconds: 15)),
    );

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: RoomInviteBanner(invite: invite, onJoin: () => joined = true, onDismiss: () => dismissed = true),
      ),
    ));

    expect(find.textContaining('Ana te invita a jugar'), findsOneWidget);
    expect(find.text('«Animales»'), findsOneWidget);

    await tester.tap(find.text('¡Unirme!'));
    expect(joined, isTrue);

    await tester.tap(find.text('Ahora no'));
    expect(dismissed, isTrue);

    await tester.pumpWidget(const SizedBox.shrink());
  });

  testWidgets('un reto de batalla se ve como reto y se acepta', (tester) async {
    var joined = false;
    final invite = RoomInviteEntity.fromJson({
      'game': 'battle',
      'roomCode': 'bt42ab',
      'wordSearchTitle': 'Cielo · Arena 8 × 8',
      'fromName': 'Ana',
      'expiresAt': DateTime.now().add(const Duration(seconds: 15)).millisecondsSinceEpoch,
    });
    expect(invite.isBattle, isTrue);

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(body: RoomInviteBanner(invite: invite, onJoin: () => joined = true, onDismiss: () {})),
    ));

    expect(find.text('Ana te reta a una batalla'), findsOneWidget);
    expect(find.text('La Batalla Más Temida · Cielo · Arena 8 × 8'), findsOneWidget);
    await tester.tap(find.text('Aceptar reto'));
    expect(joined, isTrue);

    await tester.pumpWidget(const SizedBox.shrink());
  });
}
