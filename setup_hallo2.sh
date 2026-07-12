#!/bin/bash
set -e

echo "Cleaning up corrupted venv..."
cd /workspace/hallo2
mv venv venv_old_$(date +%s) || true

echo "Creating new venv..."
python3.10 -m venv venv
source venv/bin/activate

echo "Upgrading pip..."
pip install --upgrade pip

echo "Installing PyTorch..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

echo "Installing requirements..."
pip install -r requirements.txt

echo "Installing ninja..."
pip install ninja

echo "Installation complete!"
