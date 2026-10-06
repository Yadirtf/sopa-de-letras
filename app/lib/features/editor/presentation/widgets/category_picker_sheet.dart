import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/category_entity.dart';
import '../../domain/services/category_key.dart';
import '../providers/category_providers.dart';
import 'category_result_tiles.dart';

/// Abre el buscador de temas y devuelve el elegido (o el recién creado).
Future<CategoryEntity?> showCategoryPicker(BuildContext context, {CategoryEntity? selected}) {
  return showModalBottomSheet<CategoryEntity>(
    context: context,
    useRootNavigator: true,
    isScrollControlled: true,
    backgroundColor: AppColors.bgSecondary,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
    builder: (_) => CategoryPickerSheet(selected: selected),
  );
}

class CategoryPickerSheet extends ConsumerStatefulWidget {
  final CategoryEntity? selected;

  const CategoryPickerSheet({super.key, this.selected});

  @override
  ConsumerState<CategoryPickerSheet> createState() => _CategoryPickerSheetState();
}

class _CategoryPickerSheetState extends ConsumerState<CategoryPickerSheet> {
  final _controller = TextEditingController();
  Timer? _debounce;
  String _term = '';
  bool _creating = false;
  String? _createError;

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      setState(() {
        _term = value.trim();
        _createError = null;
      });
    });
    setState(() {}); // refresca la fila "Crear tema" mientras se escribe
  }

  Future<void> _create(String name) async {
    setState(() {
      _creating = true;
      _createError = null;
    });
    final result = await ref.read(categoryRepositoryProvider).create(name);
    if (!mounted) return;
    result.fold(
      (err) => setState(() {
        _creating = false;
        _createError = err;
      }),
      (category) => Navigator.of(context).pop(category),
    );
  }

  @override
  Widget build(BuildContext context) {
    final typed = _controller.text.trim();
    final results = ref.watch(categorySearchProvider(_term));
    final list = results.valueOrNull ?? const <CategoryEntity>[];
    final exists = list.any((c) => c.key == categoryKeyOf(typed));
    final canCreate = typed == _term && categoryKeyOf(typed).length >= 2 && !exists && !results.isLoading;

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.75,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 10),
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(color: AppColors.textMuted, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
              child: Text('¿De qué trata tu sopa?', style: AppTypography.heading3),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text('Busca un tema o crea uno nuevo si no lo encuentras.',
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
              child: CategorySearchInput(controller: _controller, onChanged: _onChanged),
            ),
            if (canCreate) CreateCategoryTile(name: typed, busy: _creating, onTap: () => _create(typed)),
            if (_createError != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                child: Text(_createError!, style: AppTypography.caption.copyWith(color: AppColors.accentRose)),
              ),
            Expanded(
              child: results.when(
                skipLoadingOnReload: true,
                data: (items) => CategoryResultsList(
                  items: items,
                  selectedKey: widget.selected?.key,
                  onSelected: (c) => Navigator.of(context).pop(c),
                ),
                loading: () => const Center(child: CircularProgressIndicator(color: AppColors.accentCyan)),
                error: (err, _) => CategoryLoadError(
                  message: '$err',
                  onRetry: () => ref.invalidate(categorySearchProvider(_term)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
