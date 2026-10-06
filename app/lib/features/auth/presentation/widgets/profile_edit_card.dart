import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/user_entity.dart';
import '../providers/profile_actions.dart';
import 'avatar_selector_widget.dart';

/// "Mis datos": nombre y avatar. El botón Guardar solo se enciende cuando
/// hay algo distinto que guardar, así nadie duda de si ya se guardó.
class ProfileEditCard extends ConsumerStatefulWidget {
  final UserEntity user;

  const ProfileEditCard({super.key, required this.user});

  @override
  ConsumerState<ProfileEditCard> createState() => _ProfileEditCardState();
}

class _ProfileEditCardState extends ConsumerState<ProfileEditCard> {
  late final TextEditingController _name = TextEditingController(text: widget.user.name);
  late String? _avatar = widget.user.avatarUrl;
  bool _saving = false;
  String? _error;

  bool get _nameChanged => _name.text.trim() != widget.user.name;
  bool get _avatarChanged => _avatar != widget.user.avatarUrl;
  bool get _canSave => !_saving && (_nameChanged || _avatarChanged) && _name.text.trim().length >= 3;

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    FocusScope.of(context).unfocus();
    setState(() {
      _saving = true;
      _error = null;
    });
    final error = await ref.read(ProfileActions.provider).updateProfile(
          name: _nameChanged ? _name.text : null,
          avatarUrl: _avatarChanged ? _avatar : null,
        );
    if (!mounted) return;
    setState(() {
      _saving = false;
      _error = error;
    });
    if (error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('¡Listo! Guardamos tus cambios'), backgroundColor: AppColors.accentEmerald),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Mis datos', style: AppTypography.titleMedium.copyWith(fontSize: 18)),
          const SizedBox(height: 12),
          TextField(
            controller: _name,
            maxLength: 25,
            textCapitalization: TextCapitalization.words,
            onChanged: (_) => setState(() => _error = null),
            decoration: const InputDecoration(
              labelText: 'Tu nombre',
              prefixIcon: Icon(Icons.badge_rounded, color: AppColors.accentCyan),
              counterText: '',
            ),
          ),
          const SizedBox(height: 16),
          Text('Tu avatar', style: AppTypography.labelBold),
          const SizedBox(height: 8),
          AvatarSelectorWidget(selectedAvatar: _avatar, onAvatarSelected: (id) => setState(() => _avatar = id)),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: AppTypography.bodyMedium.copyWith(color: AppColors.accentRose)),
          ],
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: _canSave ? _save : null,
              icon: _saving
                  ? const SizedBox(
                      width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.check_rounded),
              label: Text(_saving ? 'Guardando…' : 'Guardar cambios'),
            ),
          ),
        ],
      ),
    );
  }
}
