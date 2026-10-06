import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../catalog/presentation/providers/catalog_notifier.dart';
import '../providers/game_room_notifier.dart';
import '../providers/game_room_state.dart';
import '../widgets/room_created_card_widget.dart';
import '../widgets/room_info_card_widget.dart';

class CreateRoomPage extends ConsumerStatefulWidget {
  final String wordSearchId;
  final String wordSearchTitle;

  const CreateRoomPage({
    super.key,
    required this.wordSearchId,
    required this.wordSearchTitle,
  });

  @override
  ConsumerState<CreateRoomPage> createState() => _CreateRoomPageState();
}

class _CreateRoomPageState extends ConsumerState<CreateRoomPage> {
  int _maxPlayers = 4;
  int _timeLimitMinutes = 3;
  bool _hasTimeLimit = true;
  bool _isPrivate = false;

  void _handleCreate(String wordSearchId) async {
    if (wordSearchId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Selecciona una sopa de letras primero')),
      );
      return;
    }
    await ref.read(gameRoomNotifierProvider.notifier).createRoom(
      wordSearchId: wordSearchId,
      maxPlayers: _maxPlayers,
      timeLimitSeconds: _hasTimeLimit ? _timeLimitMinutes * 60 : null,
      isPrivate: _isPrivate,
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(gameRoomNotifierProvider);
    final catalog = ref.watch(catalogNotifierProvider);
    final targetId = widget.wordSearchId.isNotEmpty
        ? widget.wordSearchId
        : (catalog.items.isNotEmpty ? catalog.items.first.id : '');
    final targetTitle = widget.wordSearchId.isNotEmpty
        ? widget.wordSearchTitle
        : (catalog.items.isNotEmpty ? catalog.items.first.title : 'Sopa de letras');

    ref.listen<GameRoomState>(gameRoomNotifierProvider, (prev, next) {
      if (next.errorMessage != null && next.errorMessage != prev?.errorMessage) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: AppColors.accentRose, content: Text(next.errorMessage!)),
        );
      }
    });

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        elevation: 0,
        title: Text('Crear Sala Multijugador', style: AppTypography.heading2.copyWith(fontSize: 18)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: state.room == null
            ? _buildForm(targetId, targetTitle, state)
            : RoomCreatedCardWidget(room: state.room!),
      ),
    );
  }

  Widget _buildForm(String targetId, String targetTitle, GameRoomState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        RoomInfoCardWidget(title: targetTitle),
        const SizedBox(height: 16),
        Text('Capacidad de Jugadores: $_maxPlayers (Máx 20)', style: AppTypography.labelLarge),
        Slider(
          value: _maxPlayers.toDouble(),
          min: 2,
          max: 20,
          divisions: 18,
          activeColor: AppColors.accentViolet,
          inactiveColor: AppColors.bgCard,
          onChanged: (v) => setState(() => _maxPlayers = v.round()),
        ),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          activeThumbColor: AppColors.accentCyan,
          title: Text('Límite de Tiempo', style: AppTypography.bodyLarge),
          subtitle: Text(_hasTimeLimit ? '$_timeLimitMinutes min' : 'Sin límite (Libre)', style: AppTypography.bodySmall),
          value: _hasTimeLimit,
          onChanged: (v) => setState(() => _hasTimeLimit = v),
        ),
        if (_hasTimeLimit)
          Slider(
            value: _timeLimitMinutes.toDouble(),
            min: 1,
            max: 10,
            divisions: 9,
            activeColor: AppColors.accentCyan,
            inactiveColor: AppColors.bgCard,
            onChanged: (v) => setState(() => _timeLimitMinutes = v.round()),
          ),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          activeThumbColor: AppColors.accentViolet,
          title: Text('Sala Privada', style: AppTypography.bodyLarge),
          subtitle: Text('Solo se puede ingresar con código', style: AppTypography.bodySmall),
          value: _isPrivate,
          onChanged: (v) => setState(() => _isPrivate = v),
        ),
        if (state.errorMessage != null) ...[
          const SizedBox(height: 8),
          Text(state.errorMessage!, style: const TextStyle(color: AppColors.accentRose, fontSize: 13)),
        ],
        const SizedBox(height: 16),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.accentViolet,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          onPressed: state.isLoading ? null : () => _handleCreate(targetId),
          child: state.isLoading
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : Text('Generar Sala y Código QR', style: AppTypography.labelLarge.copyWith(color: Colors.white)),
        ),
      ],
    );
  }
}
