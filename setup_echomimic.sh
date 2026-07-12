#!/bin/bash
set -e

echo "🚀 Début de l'installation d'EchoMimicV3 sur RunPod..."

# Mettre à jour et installer les dépendances système
apt-get update && apt-get install -y git git-lfs ffmpeg wget libgl1 libglib2.0-0
git lfs install

# Cloner le dépôt officiel
cd /workspace
if [ ! -d "echomimic_v3" ]; then
    git clone https://github.com/antgroup/echomimic_v3.git
fi
cd echomimic_v3

# Créer un environnement virtuel
echo "📦 Configuration de l'environnement Python..."
apt-get install -y python3-venv
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances Python
sed -i 's/tensorflow==2.15.0/tensorflow/g' requirements.txt
pip install -r requirements.txt
pip install huggingface_hub

# Télécharger les modèles depuis Hugging Face
echo "🧠 Téléchargement des modèles (cela peut prendre du temps)..."
mkdir -p models
cd models

# Téléchargement des poids EchoMimicV3
hf download BadToBest/EchoMimicV3 --local-dir ./EchoMimicV3
# Téléchargement de Wan2.1
hf download alibaba-pai/Wan2.1-Fun-V1.1-1.3B-InP --local-dir ./Wan2.1-Fun-V1.1-1.3B-InP
# Téléchargement de l'encodeur audio
hf download TencentGameMate/chinese-wav2vec2-base --local-dir ./chinese-wav2vec2-base

cd ..

echo "✅ Installation terminée avec succès !"
pip install pyloudnorm imageio[ffmpeg]
