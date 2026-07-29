#!/usr/bin/env python3
"""
FitX AI Platform - Master Unified Launcher
Runs both FastAPI backend and Next.js frontend concurrently with clean log formatting and process management.
"""

import sys
import os
import shutil
import subprocess
import threading
import signal
import time
import argparse
from pathlib import Path

# Ensure UTF-8 output encoding for Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ANSI colors for nice terminal output
CYAN = "\033[96m"
MAGENTA = "\033[95m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

IS_WIN = sys.platform == "win32"
ROOT_DIR = Path(__file__).parent.resolve()
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

def print_banner():
    banner = f"""
{CYAN}{BOLD}=============================================================
             FitX AI Platform - Unified Runner
============================================================={RESET}
  Backend API:  {GREEN}http://localhost:8000{RESET} (Docs: {GREEN}http://localhost:8000/docs{RESET})
  Frontend Web: {GREEN}http://localhost:3000{RESET}
=============================================================
"""
    print(banner)


def setup_environment():
    """Ensure .env exists in project root."""
    env_file = ROOT_DIR / ".env"
    env_example = ROOT_DIR / ".env.example"
    if not env_file.exists() and env_example.exists():
        print(f"{YELLOW}[INIT] Copying .env.example -> .env{RESET}")
        shutil.copy(env_example, env_file)

def get_python_executable():
    """Locate the Python executable in virtualenv or current sys.executable."""
    if IS_WIN:
        venv_python = BACKEND_DIR / ".venv" / "Scripts" / "python.exe"
    else:
        venv_python = BACKEND_DIR / ".venv" / "bin" / "python"

    if venv_python.exists():
        return str(venv_python)
    return sys.executable

def clean_frontend_cache():
    """Clean Next.js build cache (.next) to prevent stale chunk errors (e.g. Cannot find module './925.js')."""
    next_dir = FRONTEND_DIR / ".next"
    if next_dir.exists():
        print(f"{YELLOW}[FRONTEND] Purging stale .next build cache to prevent chunk errors...{RESET}")
        try:
            shutil.rmtree(next_dir, ignore_errors=True)
            print(f"{GREEN}[FRONTEND] Cache purged successfully.{RESET}")
        except Exception as e:
            print(f"{YELLOW}[FRONTEND] Warning clearing .next cache: {e}{RESET}")

def check_frontend_deps():
    """Check if frontend node_modules exists, offer to install if missing."""
    node_modules = FRONTEND_DIR / "node_modules"
    if not node_modules.exists():
        print(f"{YELLOW}[FRONTEND] node_modules not found. Installing npm dependencies...{RESET}")
        npm_cmd = "npm.cmd" if IS_WIN else "npm"
        try:
            subprocess.run([npm_cmd, "install"], cwd=FRONTEND_DIR, check=True)
            print(f"{GREEN}[FRONTEND] npm install complete.{RESET}")
        except Exception as e:
            print(f"{RED}[FRONTEND] Failed to run npm install: {e}{RESET}")

def run_tests():
    """Run backend test suite."""
    print(f"{CYAN}[TEST] Running backend test suite...{RESET}")
    python_exe = get_python_executable()
    test_script = BACKEND_DIR / "test_backend.py"
    res = subprocess.run([python_exe, str(test_script)], cwd=ROOT_DIR)
    if res.returncode != 0:
        print(f"{RED}[TEST] Backend tests failed! Aborting startup.{RESET}")
        sys.exit(1)
    print(f"{GREEN}[TEST] All backend tests passed!{RESET}\n")

def stream_output(process, prefix, color):
    """Thread target to read process stdout/stderr and output with prefix."""
    try:
        for line in iter(process.stdout.readline, ''):
            if not line:
                break
            clean_line = line.rstrip()
            print(f"{color}{BOLD}[{prefix}]{RESET} {clean_line}", flush=True)
    except (ValueError, OSError):
        pass

def kill_process_tree(pid):
    """Kill process and all child processes cleanly."""
    if IS_WIN:
        subprocess.run(
            ["taskkill", "/F", "/T", "/PID", str(pid)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    else:
        try:
            os.killpg(os.getpgid(pid), signal.SIGTERM)
        except Exception:
            try:
                os.kill(pid, signal.SIGTERM)
            except Exception:
                pass

def main():
    parser = argparse.ArgumentParser(description="FitX AI Platform Unified Launcher")
    parser.add_argument("--test", action="store_true", help="Run test suite before launching servers")
    parser.add_argument("--docker", action="store_true", help="Launch using docker-compose")
    parser.add_argument("--backend-only", action="store_true", help="Launch backend server only")
    parser.add_argument("--frontend-only", action="store_true", help="Launch frontend dev server only")
    parser.add_argument("--port", type=int, default=8000, help="Backend port (default: 8000)")
    args = parser.parse_args()

    if args.docker:
        print(f"{CYAN}[DOCKER] Launching FitX stack using Docker Compose...{RESET}")
        docker_cmd = ["docker-compose", "up", "--build"]
        try:
            subprocess.run(docker_cmd, cwd=ROOT_DIR)
        except KeyboardInterrupt:
            print(f"\n{YELLOW}[DOCKER] Stopping Docker containers...{RESET}")
            subprocess.run(["docker-compose", "down"], cwd=ROOT_DIR)
        return

    print_banner()
    setup_environment()

    if args.test:
        run_tests()

    processes = []
    threads = []

    try:
        # 1. Start Backend
        if not args.frontend_only:
            python_exe = get_python_executable()
            backend_cmd = [
                python_exe, "-m", "uvicorn",
                "backend.main:app",
                "--reload",
                "--port", str(args.port)
            ]
            print(f"{CYAN}[BACKEND] Starting FastAPI server on port {args.port}...{RESET}")
            
            # Start process
            backend_proc = subprocess.Popen(
                backend_cmd,
                cwd=ROOT_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if IS_WIN else 0
            )
            processes.append(("BACKEND", backend_proc))

            t_back = threading.Thread(
                target=stream_output,
                args=(backend_proc, "BACKEND", CYAN),
                daemon=True
            )
            t_back.start()
            threads.append(t_back)

        # 2. Start Frontend
        if not args.backend_only:
            clean_frontend_cache()
            check_frontend_deps()
            npm_cmd = "npm.cmd" if IS_WIN else "npm"
            frontend_cmd = [npm_cmd, "run", "dev"]
            print(f"{MAGENTA}[FRONTEND] Starting Next.js dev server on port 3000...{RESET}")

            frontend_proc = subprocess.Popen(
                frontend_cmd,
                cwd=FRONTEND_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if IS_WIN else 0
            )
            processes.append(("FRONTEND", frontend_proc))

            t_front = threading.Thread(
                target=stream_output,
                args=(frontend_proc, "FRONTEND", MAGENTA),
                daemon=True
            )
            t_front.start()
            threads.append(t_front)

        print(f"{GREEN}{BOLD}[READY] All services initiated! Press Ctrl+C to stop.{RESET}\n")

        # Keep main thread alive watching processes
        while True:
            time.sleep(0.5)
            for name, proc in processes:
                if proc.poll() is not None:
                    print(f"{RED}[{name}] Process exited unexpectedly with code {proc.returncode}{RESET}")
                    raise KeyboardInterrupt

    except KeyboardInterrupt:
        print(f"\n{YELLOW}[SHUTDOWN] Shutting down all FitX services cleanly...{RESET}")
        for name, proc in processes:
            print(f"{YELLOW}[SHUTDOWN] Stopping {name} (PID: {proc.pid})...{RESET}")
            kill_process_tree(proc.pid)
        print(f"{GREEN}[SHUTDOWN] FitX stopped successfully.{RESET}")

if __name__ == "__main__":
    main()
