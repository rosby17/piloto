#!/bin/bash
set -e

echo "Installing LivePortrait..."
cd /workspace
git clone https://github.com/KwaiVGI/LivePortrait || true
cd LivePortrait
rm -rf venv || true
python3.10 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install onnxruntime-gpu huggingface_hub

echo "Downloading LivePortrait weights..."
huggingface-cli download KwaiVGI/LivePortrait --local-dir pretrained_weights --exclude "*.git*" "README.md" "docs"

echo "LivePortrait Setup Complete!"
