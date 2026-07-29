#!/usr/bin/env bash
# FitX AI Platform - Shell Launcher
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
python3 "$SCRIPT_DIR/run.py" "$@"
