import os
import subprocess
import glob
import shutil

# Paths
WORKSPACE = "/workspace"
AUDIO_FILE = os.path.join(WORKSPACE, "Dr_Hillman_15s.wav")
CROPPED_IMAGE = os.path.join(WORKSPACE, "avatar2_cropped.png")
ORIGINAL_IMAGE = os.path.join(WORKSPACE, "avatar2.png")
SADTALKER_DIR = os.path.join(WORKSPACE, "SadTalker")
LIVEPORTRAIT_DIR = os.path.join(WORKSPACE, "LivePortrait")
SADTALKER_OUT = os.path.join(WORKSPACE, "sadtalker_output")
FINAL_OUT_DIR = os.path.join(WORKSPACE, "liveportrait_output")
FINAL_VIDEO = os.path.join(WORKSPACE, "final_liveportrait_15s.mp4")

# 1. Run SadTalker
print("=============================")
print("STEP 1: Generating driving video with SadTalker...")
print("=============================")
os.makedirs(SADTALKER_OUT, exist_ok=True)
sadtalker_cmd = f"cd {SADTALKER_DIR} && source venv/bin/activate && python3 inference.py --driven_audio {AUDIO_FILE} --source_image {CROPPED_IMAGE} --result_dir {SADTALKER_OUT} --still --preprocess crop"
subprocess.run(sadtalker_cmd, shell=True, executable='/bin/bash', check=True)

# Find the generated mp4
generated_videos = glob.glob(os.path.join(SADTALKER_OUT, "*/*.mp4"))
if not generated_videos:
    print("Error: SadTalker did not generate a video.")
    exit(1)
driving_video = generated_videos[0]
print(f"Driving video generated: {driving_video}")

# 2. Run LivePortrait
print("=============================")
print("STEP 2: Rendering photorealistic video with LivePortrait...")
print("=============================")
os.makedirs(FINAL_OUT_DIR, exist_ok=True)
liveportrait_cmd = f"cd {LIVEPORTRAIT_DIR} && source venv/bin/activate && python3 inference.py -s {ORIGINAL_IMAGE} -d {driving_video} -o {FINAL_OUT_DIR}"
subprocess.run(liveportrait_cmd, shell=True, executable='/bin/bash', check=True)

# Find the final video
final_videos = glob.glob(os.path.join(FINAL_OUT_DIR, "*.mp4"))
if not final_videos:
    print("Error: LivePortrait did not generate a video.")
    exit(1)
output_video = final_videos[0]

# Add audio properly just in case
print("=============================")
print("STEP 3: Muxing final audio...")
print("=============================")
ffmpeg_cmd = f"ffmpeg -y -i {output_video} -i {AUDIO_FILE} -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest {FINAL_VIDEO}"
subprocess.run(ffmpeg_cmd, shell=True, executable='/bin/bash', check=True)

print(f"PIPELINE COMPLETE! Final video is at {FINAL_VIDEO}")
