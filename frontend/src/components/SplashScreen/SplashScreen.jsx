import { useEffect } from "react";
import "./SplashScreen.css";

import splash from "../../assets/splash/d4988b17-9ac3-4642-88ee-85913e4bbc81.png";

function SplashScreen({ onFinish }) {

    useEffect(() => {

        // Play splash audio (uses Vite-compatible URL constructor)
        let splashAudio;
        try {
            const audioUrl = new URL(
                "../../assets/splash/WhatsApp Audio 2026-08-01 at 9.00.38 PM.mpeg",
                import.meta.url
            );
            splashAudio = new Audio(audioUrl);
            // best-effort play; browsers may block autoplay without user gesture
            splashAudio.volume = 0.9;
            const playPromise = splashAudio.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {
                    // ignore play errors (autoplay restrictions)
                });
            }
        } catch (e) {
            // ignore if file not found or URL construction fails
        }

        const timer = setTimeout(() => {
            onFinish();
        }, 3000);

        return () => {
            clearTimeout(timer);
            if (splashAudio) {
                splashAudio.pause();
                splashAudio.currentTime = 0;
                splashAudio.src = "";
            }
        };

    }, [onFinish]);

    return (

        <div className="splash">

            <picture>
                <source media="(max-width: 768px)" srcSet={splash} />
                <source media="(max-width: 1200px)" srcSet={splash} />
                <img src={splash} alt="Splash" />
            </picture>

        </div>

    );

}

export default SplashScreen;