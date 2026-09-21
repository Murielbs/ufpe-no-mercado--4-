import { useCallback, useRef, useState } from "react";
import { Attract } from "./components/Attract";
import { BatteryProgress } from "./components/BatteryProgress";
import { Quiz } from "./components/Quiz";
import { Result } from "./components/Result";
import { Splash } from "./components/Splash";
import { VideoStep } from "./components/VideoStep";
import { IDLE_MS, INITIAL_ANSWERS, STEPS } from "./data";
import { useFitToScreen, useIdle } from "./hooks";
import type { Answers } from "./types";

type Phase = "attract" | "video" | "quiz" | "result";

export default function App() {
  const [booted, setBooted] = useState(false);
  const [phase, setPhase] = useState<Phase>("attract");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  const setAnswer = useCallback(
    <K extends keyof Answers>(key: K, value: Answers[K]) => setAnswers((prev) => ({ ...prev, [key]: value })),
    []
  );

  const onBooted = useCallback(() => setBooted(true), []);

  const reset = useCallback(() => {
    setAnswers(INITIAL_ANSWERS);
    setIndex(0);
    setVideoPlaying(false);
    setPhase("attract");
  }, []);

  // volta para a tela de atraÃ§Ã£o apÃ³s 2 min sem toque (exceto com vÃ­deo tocando)
  useIdle(IDLE_MS, reset, phase !== "attract" && !videoPlaying);
  useFitToScreen(shellRef, [phase, index], phase === "video");

  const last = STEPS.length - 1;
  const next = () => (index >= last ? setPhase("result") : setIndex((i) => i + 1));
  const back = () => (index === 0 ? setPhase("video") : setIndex((i) => i - 1));

  return (
    <>
      {!booted && <Splash onDone={onBooted} />}

      {phase !== "attract" && (
        <main className="stage">
          <div ref={shellRef} className={`shell ${phase === "quiz" ? "" : phase === "video" ? "shell--video" : "shell--wide"}`}>
            <header className="hud">
              <div className="hud__brand">
                <span className="hud__logo">
                  <img src="./Imagem2.png" alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
                </span>
                <span className="hud__name">UFPE no Mercado</span>
              </div>
              {(phase === "quiz" || phase === "result") && (
                <BatteryProgress done={phase === "result" ? STEPS.length : index} total={STEPS.length} />
              )}
            </header>

            {phase === "video" && (
              <VideoStep
                onBack={reset}
                onContinue={() => {
                  setIndex(0);
                  setPhase("quiz");
                }}
                onPlayingChange={setVideoPlaying}
              />
            )}

            {phase === "quiz" && (
              <Quiz
                key={STEPS[index].id}
                step={STEPS[index]}
                answers={answers}
                setAnswer={setAnswer}
                isLast={index === last}
                onNext={next}
                onBack={back}
              />
            )}

            {phase === "result" && <Result answers={answers} onRestart={reset} />}
          </div>
        </main>
      )}

      {phase === "attract" && <Attract onStart={() => setPhase("video")} />}
    </>
  );
}

