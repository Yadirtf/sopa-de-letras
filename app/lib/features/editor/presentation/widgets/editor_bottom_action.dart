import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/editor_state.dart';

/// Botón principal siempre visible: primero "Ver mi sopa" y, con la muestra
/// lista, "Publicar". Encima muestra lo que falta en palabras sencillas.
class EditorBottomAction extends StatelessWidget {
  final EditorState state;
  final VoidCallback onPreview;
  final VoidCallback onPublish;

  const EditorBottomAction({super.key, required this.state, required this.onPreview, required this.onPublish});

  @override
  Widget build(BuildContext context) {
    final hasPreview = state.preview != null;
    final busy = state.isGeneratingPreview || state.isSubmitting;
    final label = state.isGeneratingPreview
        ? 'Armando tu sopa…'
        : state.isSubmitting
            ? 'Publicando…'
            : hasPreview
                ? 'Publicar mi sopa'
                : 'Ver cómo queda';

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      decoration: const BoxDecoration(
        color: AppColors.bgPrimary,
        border: Border(top: BorderSide(color: AppColors.borderSubtle)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (state.errorMessage != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    const Icon(Icons.info_rounded, color: AppColors.accentRose, size: 18),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(state.errorMessage!,
                          style: AppTypography.bodySmall.copyWith(color: AppColors.accentRose)),
                    ),
                  ],
                ),
              ),
            FilledButton.icon(
              onPressed: busy ? null : (hasPreview ? onPublish : onPreview),
              icon: busy
                  ? const SizedBox(
                      width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                  : Icon(hasPreview ? Icons.rocket_launch_rounded : Icons.auto_awesome_rounded),
              label: Text(label),
              style: FilledButton.styleFrom(
                backgroundColor: hasPreview ? AppColors.accentEmerald : AppColors.accentViolet,
                foregroundColor: AppColors.textPrimary,
                disabledBackgroundColor: AppColors.bgCard,
                minimumSize: const Size.fromHeight(54),
                textStyle: AppTypography.labelBold.copyWith(fontSize: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
