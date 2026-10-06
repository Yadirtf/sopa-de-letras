import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/game_room_notifier.dart';
import '../widgets/room_created_card_widget.dart';

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
  bool _isPrivate = false;

  void _handleCreate() async {
    final notifier = ref.read(gameRoomNotifierProvider.notifier);
    await notifier.createRoom(
      wordSearchId: widget.wordSearchId,
      maxPlayers: _maxPlayers,
      timeLimitSeconds: _timeLimitMinutes * 60,
      isPrivate: _isPrivate,
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(gameRoomNotifierProvider);
    final room = state.room;

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        elevation: 0,
        title: Text('Crear Sala Multijugador', style: AppTypography.heading2.copyWith(fontSize: 18)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: room == null ? _buildConfigForm(state.isLoading) : RoomCreatedCardWidget(room: room),
      ),
    );
  }

  Widget _buildConfigForm(bool isLoading) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Sopa seleccionada', style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
              const SizedBox(height: 4),
              Text(widget.wordSearchTitle, style: AppTypography.heading2.copyWith(fontSize: 20)),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Text('Capacidad de Jugadores: $_maxPlayers', style: AppTypography.labelLarge),
        Slider(
          value: _maxPlayers.toDouble(),
          min: 2,
          max: 8,
          divisions: 6,
          activeColor: AppColors.accentViolet,
          inactiveColor: AppColors.bgCard,
          onChanged: (v) => setState(() => _maxPlayers = v.round()),
        ),
        const SizedBox(height: 12),
        Text('Tiempo Límite: $_timeLimitMinutes min', style: AppTypography.labelLarge),
        Slider(
          value: _timeLimitMinutes.toDouble(),
          min: 1,
          max: 5,
          divisions: 4,
          activeColor: AppColors.accentCyan,
          inactiveColor: AppColors.bgCard,
          onChanged: (v) => setState(() => _timeLimitMinutes = v.round()),
        ),
        const SizedBox(height: 12),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          activeThumbColor: AppColors.accentViolet,
          title: Text('Sala Privada', style: AppTypography.bodyLarge),
          subtitle: Text('Solo se puede ingresar con código', style: AppTypography.bodySmall),
          value: _isPrivate,
          onChanged: (v) => setState(() => _isPrivate = v),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.accentViolet,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          onPressed: isLoading ? null : _handleCreate,
          child: isLoading
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : Text('Generar Sala y Código QR', style: AppTypography.labelLarge.copyWith(color: Colors.white)),
        ),
      ],
    );
  }
}
