#!/bin/bash
set -e

echo "Installing SadTalker..."
cd /workspace
git clone https://github.com/OpenTalker/SadTalker.git || true
cd SadTalker
rm -rf venv || true
python3.10 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
echo "Downloading SadTalker weights..."
bash scripts/download_models.sh
echo "SadTalker Setup Complete!"
