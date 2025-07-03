#!/usr/bin/env python3

import asyncio
import subprocess
import sys
import webbrowser
import time
from pathlib import Path

def install_requirements():
    """Install required packages"""
    print("📦 Installing requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False

def check_dependencies():
    """Check if required packages are available"""
    required_packages = ["fastapi", "uvicorn", "aiohttp", "websockets"]
    missing = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing.append(package)
    
    return missing

def run_server():
    """Run the FastAPI server"""
    print("🚀 Starting Agentopia server...")
    print("📱 Web interface will be available at: http://127.0.0.1:8000")
    print("🛑 Press Ctrl+C to stop the server")
    
    # Open browser after a short delay
    def open_browser():
        time.sleep(2)
        try:
            webbrowser.open("http://127.0.0.1:8000")
        except:
            pass
    
    import threading
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Run server
    try:
        subprocess.run([sys.executable, "server.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")

def run_demo():
    """Run the command-line demo"""
    print("🎭 Running Agentopia demo...")
    try:
        subprocess.run([sys.executable, "mcp_rooms.py"])
    except KeyboardInterrupt:
        print("\n🛑 Demo stopped")

def main():
    print("🌟 Welcome to Agentopia!")
    print("=" * 50)
    
    # Check current directory
    if not Path("virtual_env.py").exists():
        print("❌ Please run this script from the agentopia directory")
        sys.exit(1)
    
    # Check dependencies
    missing = check_dependencies()
    if missing:
        print(f"📦 Missing packages: {', '.join(missing)}")
        if input("Install missing packages? (y/n): ").lower().startswith('y'):
            if not install_requirements():
                sys.exit(1)
        else:
            print("❌ Cannot proceed without required packages")
            sys.exit(1)
    
    # Menu
    while True:
        print("\nChoose an option:")
        print("1. Start web server (recommended)")
        print("2. Run command-line demo")
        print("3. Install/update requirements")
        print("4. Exit")
        
        choice = input("\nEnter choice (1-4): ").strip()
        
        if choice == "1":
            run_server()
            break
        elif choice == "2":
            run_demo()
        elif choice == "3":
            install_requirements()
        elif choice == "4":
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice, please try again")

if __name__ == "__main__":
    main()