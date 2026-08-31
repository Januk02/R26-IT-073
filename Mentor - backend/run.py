#!/usr/bin/env python
"""
Convenience script to run the Flask backend
Handles venv activation and server startup
"""

import os
import sys
import subprocess
import platform

def check_venv():
    """Check if virtual environment is activated"""
    return hasattr(sys, 'real_prefix') or (
        hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix
    ) or os.environ.get('VIRTUAL_ENV') is not None

def activate_venv():
    """Activate virtual environment"""
    venv_path = os.path.join(os.path.dirname(__file__), 'venv')

    if not os.path.exists(venv_path):
        print("❌ Virtual environment not found. Creating one...")
        subprocess.check_call([sys.executable, '-m', 'venv', 'venv'])
        print("✅ Virtual environment created")

    # Install requirements
    print("📦 Installing requirements...")
    pip_cmd = os.path.join(venv_path, 'Scripts' if platform.system() == 'Windows' else 'bin', 'pip')
    subprocess.check_call([pip_cmd, 'install', '-r', 'requirements.txt'])
    print("✅ Requirements installed")

def main():
    """Main entry point"""
    print("🚀 Mentorship Matching API Server")
    print("=" * 50)

    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)

    # Check/activate venv
    if not check_venv():
        print("⚠️ Virtual environment not activated")
        activate_venv()
        print("\n⚠️ Please re-run this script after activation:")
        if platform.system() == 'Windows':
            print("   venv\\Scripts\\activate && python run.py")
        else:
            print("   source venv/bin/activate && python run.py")
        return 1

    print("✅ Virtual environment active")

    # Create necessary directories
    os.makedirs('models', exist_ok=True)
    os.makedirs('data', exist_ok=True)

    # Start the server
    print("\n🌐 Starting Flask server...")
    print("📍 API will be available at: http://localhost:5000")
    print("📍 Health check: http://localhost:5000/api/health")
    print("📍 API docs: http://localhost:5000/api/stats")
    print("\nPress Ctrl+C to stop the server\n")

    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except ImportError as e:
        print(f"❌ Error importing app: {e}")
        print("📦 Try installing requirements manually:")
        print("   pip install -r requirements.txt")
        return 1

    return 0

if __name__ == '__main__':
    sys.exit(main())
