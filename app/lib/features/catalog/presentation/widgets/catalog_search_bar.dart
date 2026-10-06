import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class CatalogSearchBar extends StatefulWidget {
  final ValueChanged<String> onSearchChanged;
  final String initialValue;

  const CatalogSearchBar({
    super.key,
    required this.onSearchChanged,
    this.initialValue = '',
  });

  @override
  State<CatalogSearchBar> createState() => _CatalogSearchBarState();
}

class _CatalogSearchBarState extends State<CatalogSearchBar> {
  late final TextEditingController _controller;
  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialValue);
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      widget.onSearchChanged(value);
    });
    setState(() {});
  }

  void _onClear() {
    _controller.clear();
    _debounceTimer?.cancel();
    widget.onSearchChanged('');
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.bgCard.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: _controller.text.isNotEmpty
              ? AppColors.accentCyan
              : AppColors.borderSubtle,
        ),
        boxShadow: [
          if (_controller.text.isNotEmpty)
            BoxShadow(
              color: AppColors.accentCyan.withValues(alpha: 0.15),
              blurRadius: 12,
              spreadRadius: 1,
            ),
        ],
      ),
      child: TextField(
        controller: _controller,
        onChanged: _onChanged,
        style: AppTypography.bodyMedium.copyWith(color: AppColors.textPrimary),
        cursorColor: AppColors.accentCyan,
        decoration: InputDecoration(
          hintText: 'Buscar sopas por título o tema...',
          hintStyle: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
          prefixIcon: const Icon(
            Icons.search_rounded,
            color: AppColors.accentCyan,
            size: 22,
          ),
          suffixIcon: _controller.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.close_rounded, size: 18),
                  color: AppColors.textSecondary,
                  onPressed: _onClear,
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
        ),
      ),
    );
  }
}
