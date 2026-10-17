import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../art/battle_art.dart';
import 'battle_grid_layers.dart';
import 'battle_marks_painter.dart';
import 'battle_shot_painter.dart';

/// Pinta la arena: suelo realista del terreno, cuadrícula con letras y
/// números, figuras 3D, marcas de los disparos y la animación del último.
class BattleGridPainter extends CustomPainter {
  final BattleGridLayers layers;
  final BattleArtPack? art;
  final double cell;
  final double label;

  /// Segundos que lleva abierta la arena: mueve el fuego y el humo.
  final double time;

  /// Avance de la animación del último disparo (0 a 1), o null si ya terminó.
  final double? shotT;

  BattleGridPainter(
      {required this.layers, required this.art, required this.cell, required this.label, this.time = 0, this.shotT});

  Rect cellRect(int c, int r, [int w = 1, int h = 1]) =>
      Rect.fromLTWH(label + c * cell, label + r * cell, w * cell, h * cell);

  Rect get board => cellRect(0, 0, layers.cols, layers.rows);

  @override
  void paint(Canvas canvas, Size size) {
    _labels(canvas);
    final shake = BattleShotPainter.shake(layers.lastShot, shotT, cell);
    canvas.save();
    canvas.translate(shake.dx, shake.dy);
    canvas.clipRRect(RRect.fromRectAndRadius(board, const Radius.circular(8)));
    _ground(canvas);
    for (final unit in layers.units) {
      _unit(canvas, unit);
    }
    BattleMarksPainter(this).paint(canvas);
    final shot = layers.lastShot;
    if (shot != null) BattleShotPainter(this).paint(canvas, shot, shotT);
    canvas.restore();
    final aim = layers.aim;
    if (aim != null) _aim(canvas, aim.$1, aim.$2);
  }

  void _ground(Canvas canvas) {
    final image = art?.ground;
    final paint = Paint()..color = layers.terrain.ground;
    if (image != null) {
      final scale = BattleArt.groundTileCells * cell / image.width;
      final matrix = Matrix4.identity()
        ..translateByDouble(label, label, 0, 1)
        ..scaleByDouble(scale, scale, 1, 1);
      paint.shader = ImageShader(image, TileMode.repeated, TileMode.repeated, matrix.storage);
    }
    canvas.drawRect(board, paint);
    final line = Paint()
      ..color = Colors.black.withValues(alpha: layers.terrain.isLight ? 0.22 : 0.3)
      ..strokeWidth = 0.7;
    for (var c = 1; c < layers.cols; c++) {
      canvas.drawLine(Offset(board.left + c * cell, board.top), Offset(board.left + c * cell, board.bottom), line);
    }
    for (var r = 1; r < layers.rows; r++) {
      canvas.drawLine(Offset(board.left, board.top + r * cell), Offset(board.right, board.top + r * cell), line);
    }
    // Viñeta suave: da profundidad, como una maqueta iluminada desde el centro.
    canvas.drawRect(
      board,
      Paint()
        ..shader = RadialGradient(
          radius: 0.85,
          colors: [Colors.transparent, Colors.black.withValues(alpha: 0.28)],
        ).createShader(board),
    );
  }

  void _labels(Canvas canvas) {
    final style =
        TextStyle(color: AppColors.textSecondary, fontSize: math.min(cell * 0.55, 13), fontWeight: FontWeight.w700);
    for (var c = 0; c < layers.cols; c++) {
      text(canvas, String.fromCharCode(65 + c), Offset(label + (c + 0.5) * cell, label / 2), style);
    }
    for (var r = 0; r < layers.rows; r++) {
      text(canvas, '${r + 1}', Offset(label / 2, label + (r + 0.5) * cell), style);
    }
  }

  void _unit(Canvas canvas, GridUnit u) {
    final rect = cellRect(u.col, u.row, u.width, u.height);
    if (u.selected || u.conflict) {
      final color = u.conflict ? AppColors.accentRose : AppColors.accentAmber;
      final rrect = RRect.fromRectAndRadius(rect.deflate(1), Radius.circular(cell * 0.2));
      canvas.drawRRect(rrect, Paint()..color = color.withValues(alpha: 0.28));
      canvas.drawRRect(
        rrect,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.4
          ..color = color,
      );
    }
    final image = art?.unit(u.typeId, wreck: u.destroyed, rotated: u.rotated);
    if (image == null) {
      canvas.drawRRect(RRect.fromRectAndRadius(rect.deflate(cell * 0.1), Radius.circular(cell * 0.2)),
          Paint()..color = const Color(0xFF3B4252).withValues(alpha: u.destroyed ? 0.5 : 0.9));
      return;
    }
    final src = Rect.fromLTWH(0, 0, image.width.toDouble(), image.height.toDouble());
    canvas.drawImageRect(image, src, rect, Paint()..filterQuality = FilterQuality.medium);
  }

  /// Mira de francotirador sobre la casilla elegida.
  void _aim(Canvas canvas, int c, int r) {
    final rect = cellRect(c, r);
    final center = rect.center;
    final pulseR = cell * (0.42 + 0.06 * math.sin(time * 6));
    final stroke = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..color = AppColors.accentAmber;
    canvas.drawCircle(center, pulseR, stroke);
    for (var i = 0; i < 4; i++) {
      final dir = Offset(math.cos(i * math.pi / 2), math.sin(i * math.pi / 2));
      canvas.drawLine(center + dir * pulseR * 0.45, center + dir * pulseR * 1.45, stroke);
    }
    canvas.drawCircle(center, 2, Paint()..color = AppColors.accentRose);
  }

  void text(Canvas canvas, String value, Offset center, TextStyle style) {
    final painter = TextPainter(text: TextSpan(text: value, style: style), textDirection: TextDirection.ltr)..layout();
    painter.paint(canvas, center - Offset(painter.width / 2, painter.height / 2));
  }

  @override
  bool shouldRepaint(covariant BattleGridPainter old) =>
      old.layers != layers || old.art != art || old.cell != cell || old.time != time || old.shotT != shotT;
}
