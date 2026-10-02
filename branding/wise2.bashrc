# WISE² shell integration (sourced from ~/.bashrc). Safe, reversible.
# Adds WISE² scripts to PATH and a one-line prompt tag. Banner is opt-in.

export WISE2_ROOT="/opt/wise2"
case ":$PATH:" in *":$WISE2_ROOT/scripts:"*) ;; *) export PATH="$WISE2_ROOT/scripts:$PATH";; esac

# Subtle WISE² prompt tag (electric green) for interactive shells.
if [ -n "${PS1:-}" ]; then
  __wise2_tag='\[\033[38;5;46m\]wise²\[\033[0m\]'
  case "$PS1" in *wise²*) ;; *) PS1="$__wise2_tag \u@\h:\w\$ ";; esac
fi

# Opt-in login banner: `export WISE2_BANNER=1` in ~/.bashrc (before this block) to enable.
if [ -n "${PS1:-}" ] && [ "${WISE2_BANNER:-0}" = "1" ] && [ -x "$WISE2_ROOT/scripts/wise2-fetch" ]; then
  "$WISE2_ROOT/scripts/wise2-fetch"
fi
