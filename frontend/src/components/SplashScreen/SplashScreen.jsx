import { useEffect, useRef } from "react";
import "./SplashScreen.css";

import splash from "../../assets/splash/d4988b17-9ac3-4642-88ee-85913e4bbc81.png";
import splashSound from "../../assets/splash/WhatsApp Audio 2026-08-01 at 9.00.38 PM.mpeg";

function SplashScreen({ onFinish }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(splashSound);
    audioRef.current = audio;
    audio.volume = 1.0;
    audio.preload = "auto";

    // Play splash audio automatically
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.warn("Autoplay blocked by browser, awaiting interaction:", err);
        });
      }
    };

    playAudio();

    // Fallback: unlock audio on first touch/click if browser blocked autoplay
    const unlockAudio = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener("touchstart", unlockAudio, { once: true });
    window.addEventListener("click", unlockAudio, { once: true });

    const timer = setTimeout(() => {
      onFinish();
    }, 3200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("click", unlockAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [onFinish]);

  return (
    <div className="splash">
      <img src={splash} alt="Madhuram Cafe Splash Screen" className="splash-img" />
    </div>
  );
}

export default SplashScreen;