import 'package:flutter/widgets.dart';

/// Medidas compartidas por la cuadrícula real y su esqueleto: dos columnas en
/// un teléfono, más en tablet o web, y una altura fija que cabe la tarjeta.
const catalogGridDelegate = SliverGridDelegateWithMaxCrossAxisExtent(
  maxCrossAxisExtent: 240,
  mainAxisExtent: 206,
  mainAxisSpacing: 12,
  crossAxisSpacing: 12,
);

const catalogGridPadding = EdgeInsets.fromLTRB(16, 4, 16, 24);
