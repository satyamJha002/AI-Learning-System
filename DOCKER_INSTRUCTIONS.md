# Docker Setup and Usage Guide

It appears that Docker is not installed or not available in your system's PATH. Follow these steps to get everything running.

## 1. Install Docker Desktop

If you haven't installed Docker yet:

1.  **Download**: Go to [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) and download the installer.
2.  **Install**: Run the installer. Ensure you select the recommended settings (using WSL 2 is usually best for performance).
3.  **Restart**: You may need to log out and log back in, or restart your computer, after installation.

## 2. Verify Installation

1.  Open **Docker Desktop** application and wait for the engine to start (you'll see a green bar or "Engine running" status).
2.  Open a **new** command prompt or terminal window (closing the old one is important to update the PATH).
3.  Run:
    ```cmd
    docker --version
    ```
    You should see something like `Docker version 24.0.x, build ...`.

## 3. Run the Application

Once Docker is installed and running:

1.  Navigate to your project folder:
    ```cmd
    cd s:\Learning-AI-Assistant-App
    ```
2.  Start the application containers:
    ```cmd
    docker compose up --build
    ```
    *Note: Use `docker compose` (with a space) for newer versions, or `docker-compose` (with a hyphen) for older ones.*

## Troubleshooting

-   **"docker is not recognized"**: This means Docker is not in your PATH. If you just installed it, **restart your terminal** (VS Code, CMD, PowerShell). If it still fails, try adding `C:\Program Files\Docker\Docker\resources\bin` to your System PATH manually.
-   **Ports already in use**: If it says port 8000 or 5173 is busy, stop any locally running instances of the app (Ctrl+C in other terminal windows).
