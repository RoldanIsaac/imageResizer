from pytube import YouTube
from pytube.cli import on_progress

import yt_dlp
import sys
import urllib.parse

def download_video(url, type='video', quality='720p'):
   print('YOUTUBE VIDEO DOWNLOADER', url)
   # Configuración de opciones para yt-dlp
   if type == 'video':
      # Si se selecciona video, se filtra por quality (altura)
      ydl_opts = {
            'format': f'bestvideo[height<={quality}]' + '+bestaudio/best',  # Mejor video y audio
            'outtmpl': '%(title)s.%(ext)s',  # Plantilla para el nombre del archivo
            'progress_hooks': [show_progress],
      }
   else:
      # Si se selecciona audio, se descarga solo el mejor audio disponible
      ydl_opts = {
            'format': 'bestaudio/best',  # Mejor quality de audio
            'outtmpl': '%(title)s.%(ext)s',  # Plantilla para el nombre del archivo
            'progress_hooks': [show_progress],
      }

   # Usamos yt-dlp para descargar
   with yt_dlp.YoutubeDL(ydl_opts) as ydl:
      try: 
         print('Ready... Set... ')
         # Descargar el video o audio
         ydl.download([url])
         # ydl.download(['https://www.youtube.com/' + url])

         print('Download complete')
      except Exception as e:
         print(f"Error: {e}")
         return 1  # Retornamos 1 en caso de error
   #  return 0  # Retorno exitoso


def show_progress(d):
    if d['status'] == 'downloading':
        percent = d['_percent_str']
        print(f"Downloading... {percent}")


def yt_download(url):
   #  type = input("¿Quieres descargar solo 'audio' o 'video'? (audio/video): ").strip().lower()
   type = 'video'
   quality = '1080p'  # Valor predeterminado para quality de video

   #  if type == 'video':
   #      quality = input("¿Qué quality deseas? (720p/1080p/360p): ").strip()

   download_video(url, type, quality)

# if __name__ == "__main__":
#     main()

encoded_url = sys.argv[1]
decoded_url = urllib.parse.unquote(encoded_url)  # Decodifica la URL
print(decoded_url)
yt_download(decoded_url)



