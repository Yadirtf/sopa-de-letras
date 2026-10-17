import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../domain/entities/battle_coordinate.dart';

/// Escribir la coordenada como en papel ("H11", "11-H") y lanzar.
class CoordinateInput extends StatefulWidget {
  final int cols;
  final int rows;
  final bool enabled;
  final String weaponName;
  final Future<bool> Function(int col, int row) onFire;

  const CoordinateInput({
    super.key,
    required this.cols,
    required this.rows,
    required this.enabled,
    required this.weaponName,
    required this.onFire,
  });

  @override
  State<CoordinateInput> createState() => _CoordinateInputState();
}

class _CoordinateInputState extends State<CoordinateInput> {
  final _controller = TextEditingController();
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _fire() async {
    final parsed = BattleCoordinate.parse(_controller.text);
    final last = '${BattleCoordinate.column(widget.cols - 1)}${widget.rows}';
    if (parsed == null || parsed.$1 >= widget.cols || parsed.$2 >= widget.rows) {
      setState(() => _error = 'Escribe una letra y un número dentro de la arena (de A1 a $last).');
      return;
    }
    setState(() => _error = null);
    if (await widget.onFire(parsed.$1, parsed.$2)) _controller.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Expanded(
          child: TextField(
            key: const ValueKey('battle-coordinate'),
            controller: _controller,
            enabled: widget.enabled,
            textCapitalization: TextCapitalization.characters,
            style: AppTypography.pinKey.copyWith(fontSize: 20, letterSpacing: 2),
            decoration: const InputDecoration(hintText: 'Ej.: H11 o 11-H', isDense: true),
            onSubmitted: (_) => _fire(),
          ),
        ),
        const SizedBox(width: 10),
        FilledButton.icon(
          key: const ValueKey('battle-fire'),
          style: FilledButton.styleFrom(backgroundColor: AppColors.accentRose, minimumSize: const Size(0, 48)),
          onPressed: widget.enabled ? _fire : null,
          icon: const Icon(Icons.local_fire_department_rounded),
          label: Text('Lanzar ${widget.weaponName.toLowerCase()}'),
        ),
      ]),
      if (_error != null)
        Padding(
          padding: const EdgeInsets.only(top: 6),
          child: Text(_error!, style: AppTypography.bodySmall.copyWith(color: AppColors.accentRose)),
        ),
    ]);
  }
}
