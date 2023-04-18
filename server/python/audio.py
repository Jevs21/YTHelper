import os, sys, json
from pysndfx import AudioEffectsChain


def generate_filtered_song(in_p, out_p, fn, speed=0.80):
    in_fn  = os.path.join(in_p, fn)
    out_fn = os.path.join(out_p, fn)
    print(in_fn, out_fn)
    if not os.path.exists(in_fn):
        print("Input audio file doesn't exist")
        return False
    
    fx = (
        AudioEffectsChain()
        .speed(speed)
        .reverb()
    )

    fx(in_fn, out_fn)

    return True


if __name__ == '__main__':
  if len(sys.argv) < 3:
    print("Usage: python audio.py <path_to_audio_files> <path_to_output_files>")
    sys.exit(1)
  
  raw_files = os.listdir(sys.argv[1])
  for f in raw_files:
    print(f"Processing {f}")
    generate_filtered_song(sys.argv[1], sys.argv[2], f)
  
  sys.exit(0)
    # with open('INPUT.spotdl', 'r') as fp:
    #     urls = json.loads(fp.read().strip())
    #     for u in urls:
    #         # print(u)
    #         fn = f"{u['artist']}-{u['song_id']}".replace(" ", "")
    #         # print("Generating audio", fn)
    #         generate_filtered_song(fn)