import { useEffect, useState } from "react";

interface Props {
  onBack: () => void;
  onContinue: () => void;
  onPlayingChange: (playing: boolean) => void;
}

export function VideoStep({ onBack, onContinue, onPlayingChange }: Props) {
  const [ended, setEnded] = useState(false);

  // ao sair da tela, o vídeo deixa de "segurar" o timer de inatividade
  useEffect(() => () => onPlayingChange(false), [onPlayingChange]);

  return (
    <div className="card card--video step">
      <div className="video-frame">
        <video
          src="./Novo_video.mp4"
          controls
          autoPlay
          playsInline
          onPlay={() => onPlayingChange(true)}
          onPause={() => onPlayingChange(false)}
          onEnded={() => {
            setEnded(true);
            onPlayingChange(false);
          }}
        />
      </div>
      <div className="nav">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Voltar
        </button>
        <button type="button" className={`btn btn--primary ${ended ? "btn--pulse" : ""}`} onClick={onContinue}>
          Continuar para as perguntas
        </button>
      </div>
    </div>
  );
}

