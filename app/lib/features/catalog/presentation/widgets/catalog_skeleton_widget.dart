import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import 'catalog_grid_delegate.dart';

/// Esqueleto con la misma forma que la cuadrícula de tarjetas, latiendo
/// suavemente mientras llega el catálogo.
class CatalogSkeletonWidget extends StatefulWidget {
  const CatalogSkeletonWidget({super.key});

  @override
  State<CatalogSkeletonWidget> createState() => _CatalogSkeletonWidgetState();
}

class _CatalogSkeletonWidgetState extends State<CatalogSkeletonWidget> with SingleTickerProviderStateMixin {
  late final AnimationController _pulse = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))
    ..repeat(reverse: true);

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SliverPadding(
      padding: catalogGridPadding,
      sliver: SliverGrid(
        gridDelegate: catalogGridDelegate,
        delegate: SliverChildBuilderDelegate(
          childCount: 6,
          (context, _) => FadeTransition(
            opacity: Tween(begin: 0.35, end: 0.8).animate(_pulse),
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 92,
                    decoration: const BoxDecoration(
                      color: AppColors.bgSecondary,
                      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _bar(width: 110),
                  const SizedBox(height: 8),
                  _bar(width: 70),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _bar({required double width}) => Container(
        margin: const EdgeInsets.symmetric(horizontal: 12),
        width: width,
        height: 12,
        decoration: BoxDecoration(color: AppColors.bgSecondary, borderRadius: BorderRadius.circular(6)),
      );
}
