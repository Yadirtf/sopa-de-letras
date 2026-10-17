import 'dart:ui' as ui;
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Tira de cuadros de una reacción, tal como la hace app/tool/battle_art.
abstract class ReactionSheet {
  static const frame = 192;
  static const frames = 24;
  static const cols = 6;
  static const fps = 16;

  static String asset(String id) => 'assets/battle/reactions/$id.webp';
}

final reactionSheetProvider = FutureProvider.family<ui.Image, String>((ref, id) async {
  final data = await rootBundle.load(ReactionSheet.asset(id));
  final codec = await ui.instantiateImageCodec(data.buffer.asUint8List());
  return (await codec.getNextFrame()).image;
});

/// Reacción 3D animada en bucle.
class ReactionSprite extends ConsumerStatefulWidget {
  final String reactionId;
  final double size;

  const ReactionSprite({super.key, required this.reactionId, this.size = 96});

  @override
  ConsumerState<ReactionSprite> createState() => _ReactionSpriteState();
}

class _ReactionSpriteState extends ConsumerState<ReactionSprite> with SingleTickerProviderStateMixin {
  late final Ticker _ticker;
  int _frame = 0;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((elapsed) {
      final f = (elapsed.inMilliseconds * ReactionSheet.fps ~/ 1000) % ReactionSheet.frames;
      if (f != _frame) setState(() => _frame = f);
    })
      ..start();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final sheet = ref.watch(reactionSheetProvider(widget.reactionId)).valueOrNull;
    return SizedBox.square(
      dimension: widget.size,
      child: sheet == null ? null : CustomPaint(painter: _FramePainter(sheet, _frame)),
    );
  }
}

class _FramePainter extends CustomPainter {
  final ui.Image sheet;
  final int frame;
  _FramePainter(this.sheet, this.frame);

  @override
  void paint(Canvas canvas, Size size) {
    const f = ReactionSheet.frame;
    final src = Rect.fromLTWH((frame % ReactionSheet.cols) * f.toDouble(), (frame ~/ ReactionSheet.cols) * f.toDouble(),
        f.toDouble(), f.toDouble());
    canvas.drawImageRect(sheet, src, Offset.zero & size, Paint()..filterQuality = FilterQuality.medium);
  }

  @override
  bool shouldRepaint(_FramePainter old) => old.frame != frame || old.sheet != sheet;
}
