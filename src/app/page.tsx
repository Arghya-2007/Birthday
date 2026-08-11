'use client'

import { useEffect, useState } from 'react'
import LoadingScreen from '@/components/loading/LoadingScreen'
import { preloadCriticalAssets } from '@/lib/preload'
import { useLenis } from '@/hooks/useLenis'
import { Howl } from 'howler'
import Hero from '@/components/hero/Hero'
import ImageSequence from '@/components/sequence/ImageSequence'
import { TOTAL_FRAMES } from '@/lib/assets'

import { birthdayContent } from '@/data/birthdayContent'
import StorySection from '@/components/story/StorySection'
import MessageSection from '@/components/story/MessageSection'
import TraitsDisplay from '@/components/story/TraitsDisplay'
import BirthdayExperience from '@/components/birthday/BirthdayExperience'

export default function Page() {
  useLenis()

  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      const sound = new Howl({
        src: ['/audio/background-music.mp3'],
        loop: true,
        volume: 1,
        html5: true, // Crucial for large audio files to stream and bypass some autoplay blocks
        autoplay: true,
      });
      
      // We start the music when loading completes and the hero reveals.
      if (!sound.playing()) {
        sound.play();
      }

      // To guarantee it plays even if the browser blocked the initial autoplay,
      // we attach a one-time listener to the document to play on the first interaction.
      const unlockAudio = () => {
        if (!sound.playing()) {
          sound.play();
        }
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
      };

      document.addEventListener('click', unlockAudio);
      document.addEventListener('touchstart', unlockAudio);

      return () => {
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        sound.unload();
      };
    }
  }, [isLoading])

  useEffect(() => {
    // Suppress THREE.Clock deprecation warning from internal R3F/Drei components
    const originalWarn = console.warn
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('THREE.Clock')) return
      originalWarn(...args)
    }

    let isMounted = true

    preloadCriticalAssets((percent) => {
      if (isMounted) {
        setLoadProgress(percent)
      }
    }).then(() => {
      if (isMounted) {
        setLoadProgress(100)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      {isLoading && (
        <LoadingScreen
          progress={loadProgress}
          onComplete={() => setIsLoading(false)}
        />
      )}

      {!isLoading && (
        <main>
          <Hero onEntranceComplete={() => console.log('Hero entrance complete')} />
          <ImageSequence
            totalFrames={TOTAL_FRAMES}
          >
            {/* Scene 01 */}
            <StorySection scene={birthdayContent.scenes[0]} totalFrames={TOTAL_FRAMES} />

            {/* Scene 02 */}
            <StorySection scene={birthdayContent.scenes[1]} totalFrames={TOTAL_FRAMES} />

            {/* Scene 03 — Traits */}
            <TraitsDisplay
              traits={birthdayContent.traits}
              devReference={birthdayContent.devReference}
              frameStart={birthdayContent.scenes[2].frameStart}
              frameEnd={birthdayContent.scenes[2].frameEnd}
              totalFrames={TOTAL_FRAMES}
            />

            {/* Scene 04 — Personal Message */}
            <MessageSection
              text={birthdayContent.scenes[3].text ?? ''}
              frameStart={birthdayContent.scenes[3].frameStart}
              frameEnd={birthdayContent.scenes[3].frameEnd}
              totalFrames={TOTAL_FRAMES}
            />

            {/* Scene 05 — The Reveal */}
            <StorySection scene={birthdayContent.scenes[4]} totalFrames={TOTAL_FRAMES} />
          </ImageSequence>

          <BirthdayExperience />
        </main>
      )}
    </>
  )
}
