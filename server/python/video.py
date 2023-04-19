
import os, sys, json
import random
import matplotlib 
matplotlib.use('Agg') 
import subprocess
import moviepy.editor as mp


def verify_video(name):
    return os.path.isfile(name)


def generate_video(audio_path, gif_path, out_path):
    
    song = mp.AudioFileClip(audio_path)
    clip = mp.VideoFileClip(gif_path)
    song_len  = getSongLength(audio_path)
    if not song_len: 
        return False

    clip = clip.fx(mp.vfx.loop, duration=song_len+3)
    final = clip.set_audio(song)
    final.write_videofile(out_path)

    return True

def getSongLength(fn):
    if not os.path.exists(fn):
        return False

    command_str = "ffprobe -show_entries format=duration -i %s" % fn
    output = subprocess.check_output(command_str, shell=True)
    if not output:
        return False
    
    seconds = output.decode("utf-8").split("duration=")[1].split(".")[0]
    return int(seconds)

if __name__ == '__main__':
  if len(sys.argv) < 4:
    print("Usage: python audio.py <path_to_slowaudio_files> <path_to_gif_files> <path_to_output_files>")
    sys.exit(1)
  
  audio_files = os.listdir(sys.argv[1])
  gifs = [fn for fn in os.listdir(sys.argv[2]) if fn.endswith('.gif') ]
  random.shuffle(gifs)
  gif_ind = 0
  for f in audio_files:
    print(f"Generating Video {f}")
    path_a = os.path.join(sys.argv[1], f)
    path_g = os.path.join(sys.argv[2], gifs[gif_ind])
    path_o = os.path.join(sys.argv[3], f.replace('.mp3', '.mp4'))
    generate_video(path_a, path_g, path_o)
    gif_ind += 1
