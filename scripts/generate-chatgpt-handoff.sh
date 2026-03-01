#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$ROOT" ]; then
  echo "Error: run this script inside a git repository." >&2
  exit 1
fi

cd "$ROOT"
PROJECT_NAME="$(basename "$ROOT")"
WORKSPACE_PATH="$ROOT"
NOW="$(date '+%Y-%m-%d %H:%M:%S %z')"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
HEAD_SHORT="$(git rev-parse --short HEAD)"

STATUS_SHORT="$(git status --short)"
if [ -z "$STATUS_SHORT" ]; then
  STATUS_SHORT="(clean)"
fi

RECENT_COMMITS="$(git log --oneline -n 8)"

READ_FIRST=()
[ -f "$ROOT/AGENTS.md" ] && READ_FIRST+=("- AGENTS.md")
[ -f "$ROOT/docs/MASTERPLAN.md" ] && READ_FIRST+=("- docs/MASTERPLAN.md")
[ -f "$ROOT/docs/CHATGPT-HANDOFF.md" ] && READ_FIRST+=("- docs/CHATGPT-HANDOFF.md")

if [ "${#READ_FIRST[@]}" -eq 0 ]; then
  READ_FIRST+=("- (ingen faste handoff-filer fundet)")
fi

READ_FIRST_BLOCK="$(printf '%s\n' "${READ_FIRST[@]}")"

output_handoff() {
  cat <<EOF2
PROJEKT-HANDOFF (LÆS HELE FØR DU SVARER)

Projekt: $PROJECT_NAME
Workspace path: $WORKSPACE_PATH
Dato: $NOW

Læs først:
$READ_FIRST_BLOCK
Nuværende git-status:
- Branch: $BRANCH
- HEAD: $HEAD_SHORT
- git status --short:
$STATUS_SHORT

Seneste commits:
$RECENT_COMMITS

Aktuelt mål i denne chat:
[indsæt konkret mål]

Arbejdsregler:
1. Bekræft constraints kort.
2. Lav en kort plan før ændringer.
3. Implementér kun i scope.
4. Kør relevante checks.
5. Vis diff/changelog.
6. Commit først når jeg siger go (eller efter min instruktion).

Svarformat:
- Kort status
- Plan
- Ændringer
- Checks
- Eventuelle risici
EOF2
}

if [ "${1:-}" = "--save" ]; then
  OUT_PATH="${2:-$ROOT/docs/CHATGPT-HANDOFF-LATEST.txt}"
  output_handoff > "$OUT_PATH"
  echo "Saved handoff to: $OUT_PATH"
else
  output_handoff
fi
