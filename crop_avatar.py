from PIL import Image

img = Image.open('avatar2.png')
width, height = img.size

# Let's do a square center crop
min_dim = min(width, height)
left = (width - min_dim) / 2
top = (height - min_dim) / 2
right = (width + min_dim) / 2
bottom = (height + min_dim) / 2

# Crop it to a square
img_cropped = img.crop((left, top, right, bottom))

# Resize to 512x512 for Hallo2
img_resized = img_cropped.resize((512, 512), Image.Resampling.LANCZOS)
img_resized.save('avatar2_cropped.png')
print("Cropped and saved to avatar2_cropped.png")
