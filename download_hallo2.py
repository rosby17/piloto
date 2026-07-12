import os
from huggingface_hub import snapshot_download

# Download Hallo2 weights
print("Downloading Hallo2 base weights...")
snapshot_download(repo_id="fudan-generative-ai/hallo2", local_dir="/workspace/hallo2/pretrained_models")

print("All weights downloaded successfully!")
