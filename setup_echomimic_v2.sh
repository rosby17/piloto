#!/bin/bash
set -e
echo "Starting EchoMimicV2 setup..."

cd /workspace
if [ ! -d "echomimic_v2" ]; then
    git clone https://github.com/antgroup/echomimic_v2
fi

cd echomimic_v2

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

echo "Installing PyTorch..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

echo "Installing requirements..."
# Some requirements might conflict or fail, we'll try to install them gracefully
pip install -r requirements.txt || echo "Some requirements failed, continuing..."
pip install opencv-python-headless diffusers accelerate xformers librosa omegaconf decord imageio imageio-ffmpeg

echo "Installing apt dependencies..."
apt-get update -y && apt-get install -y git-lfs ffmpeg

git lfs install

echo "Downloading weights..."
if [ ! -d "pretrained_weights" ]; then
    git clone https://huggingface.co/BadToBest/EchoMimicV2 pretrained_weights
else
    echo "pretrained_weights already exists."
fi

echo "EchoMimicV2 Setup Complete!"
