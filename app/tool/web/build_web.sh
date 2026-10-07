#!/usr/bin/env bash
# Compila la version web de WordHive (Flutter) para publicarla en /jugar/ de
# la landing. Lo usa el build de Render (render.yaml), y sirve igual en local:
#
#   bash app/tool/web/build_web.sh web/dist
#
# Deja la app en <destino>/jugar/. Si no hay `flutter` en el PATH descarga el
# SDK estable indicado en FLUTTER_VERSION. Variables opcionales:
#   PLAY_URL, API_URL, SOCKET_URL     enlaces y servidor (por defecto, Render)
#   FIREBASE_WEB_CONFIG, FIREBASE_VAPID_KEY   avisos push con el navegador cerrado
set -euo pipefail

DEST="$(mkdir -p "${1:?Indica la carpeta de destino}" && cd "$1" && pwd)"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FLUTTER_VERSION="${FLUTTER_VERSION:-3.47.6}"

if ! command -v flutter >/dev/null 2>&1; then
  FLUTTER_HOME="${FLUTTER_HOME:-$HOME/.cache/flutter-$FLUTTER_VERSION}"
  if [ ! -x "$FLUTTER_HOME/bin/flutter" ]; then
    echo "Descargando Flutter $FLUTTER_VERSION..."
    mkdir -p "$FLUTTER_HOME"
    curl -fsSL "https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz" |
      tar -xJ -C "$FLUTTER_HOME" --strip-components=1
  fi
  export PATH="$FLUTTER_HOME/bin:$PATH"
  git config --global --add safe.directory "$FLUTTER_HOME" >/dev/null 2>&1 || true
fi

DEFINES=(--dart-define=PLAY_URL="${PLAY_URL:-https://wordhive-landing.onrender.com/jugar}")
[ -n "${API_URL:-}" ] && DEFINES+=(--dart-define=API_URL="$API_URL")
[ -n "${SOCKET_URL:-}" ] && DEFINES+=(--dart-define=SOCKET_URL="$SOCKET_URL")
if [ -n "${FIREBASE_WEB_CONFIG:-}" ] && [ -n "${FIREBASE_VAPID_KEY:-}" ]; then
  DEFINES+=(--dart-define=FIREBASE_WEB_CONFIG="$(printf '%s' "$FIREBASE_WEB_CONFIG" | base64 | tr -d '\n')")
  DEFINES+=(--dart-define=FIREBASE_VAPID_KEY="$FIREBASE_VAPID_KEY")
fi

cd "$APP_DIR"
flutter --disable-analytics >/dev/null 2>&1 || true
flutter pub get
# Sin CDN: CanvasKit y fuentes se sirven desde el propio sitio (redes de
# colegios u oficinas a veces bloquean gstatic.com).
flutter build web --release --no-web-resources-cdn --base-href /jugar/ "${DEFINES[@]}"

rm -rf "$DEST/jugar"
mkdir -p "$DEST/jugar"
cp -R build/web/. "$DEST/jugar/"

# Service worker de Firebase: el SDK lo busca en la raiz del sitio.
if [ -n "${FIREBASE_WEB_CONFIG:-}" ] && [ -n "${FIREBASE_VAPID_KEY:-}" ]; then
  for dir in "$DEST" "$DEST/jugar"; do
    sed "s|__FIREBASE_WEB_CONFIG__|$(printf '%s' "$FIREBASE_WEB_CONFIG" | tr -d '\n' | sed 's/[&|\\]/\\&/g')|" \
      tool/web/firebase-messaging-sw.template.js >"$dir/firebase-messaging-sw.js"
  done
fi
echo "WordHive web lista en $DEST/jugar"
