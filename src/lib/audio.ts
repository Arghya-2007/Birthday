import { Howl } from 'howler';

let globalSound: Howl | null = null;

export const playBackgroundAudio = () => {
  if (typeof window === 'undefined') return;

  if (!globalSound) {
    globalSound = new Howl({
      src: ['/audio/background-music.mp3'],
      loop: true,
      volume: 1,
      html5: true, // Crucial for large audio files to stream and bypass some autoplay blocks
      autoplay: true,
    });
  }

  if (!globalSound.playing()) {
    globalSound.play();
  }

  const unlockAudio = () => {
    if (globalSound && !globalSound.playing()) {
      globalSound.play();
    }
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  };

  document.addEventListener('click', unlockAudio);
  document.addEventListener('touchstart', unlockAudio);

  return () => {
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  };
};
