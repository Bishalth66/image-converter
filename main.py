from PIL import Image

def convert_to_webp(filename, path="images/"):
   extension = filename.split('.')[-1]
   fname = filename.split('.')[0]
   img = Image.open(path + filename)
   
   if extension == "png":
      img.save((path+fname+".webp"),"webp", lossless=True)
   else:
      img.save((path+fname+".webp"),"webp", quality=85)


if __name__ == "__main__":
   convert_to_webp("image.jpg")
