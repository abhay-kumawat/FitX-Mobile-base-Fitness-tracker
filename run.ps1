# FitX AI Platform - PowerShell Launcher
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
python "$scriptPath\run.py" $args
