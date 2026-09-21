import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AVISO_SUGESTAO, JOVEM_NOTA, PORTAL_VAGAS } from "../data";
import { recommend } from "../recommend";
import type { Answers } from "../types";
import { shortUrl } from "../utils";

interface Props {
  answers: Answers;
  onRestart: () => void;
}

const QR_COLOR = "#14213F";

export function Result({ answers, onRestart }: Props) {
  const rec = useMemo(() => recommend(answers), [answers]);

  return (
    <div className="card step result">
      <div className="result__main">
        <div className="result__text">
          <div className="pills">
            <span className="pill">{rec.tipo === "vaga" ? "Sugestão de vaga" : "Portal de vagas"}</span>
            {rec.nivelLabel && <span className="pill pill--blue">{rec.nivelLabel}</span>}
            {rec.areaLabel && <span className="pill pill--blue">{rec.areaLabel}</span>}
          </div>
          <h2 className="result__title">{rec.principal.titulo}</h2>
          {rec.tipo === "vaga" && <p className="result__local">{rec.principal.local}</p>}
          <p className="result__desc">{rec.descricao}</p>
          {rec.motivos.length > 0 && (
            <ul className="reasons" aria-label="Por que sugerimos esta vaga">
              {rec.motivos.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}

          <div className="mascot">
            <img src="./image_1657a3.jpg" alt="Mascote Moura" onError={(e) => (e.currentTarget.style.display = "none")} />
            <p>
              {rec.tipo === "vaga"
                ? "Esta é uma sugestão de vaga para o seu perfil. Escaneie para conhecer os detalhes e, se fizer sentido, se inscrever."
                : "Escaneie para conhecer todas as vagas abertas."}
            </p>
          </div>
        </div>

        <div className="qr-panel">
          <div className="qr-frame">
            <QRCodeSVG value={rec.principal.url} size={256} level="M" fgColor={QR_COLOR} bgColor="#ffffff" />
          </div>
          <div className="qr-hint">Aponte a câmera do celular</div>
          <a className="link-box" href={rec.principal.url} target="_blank" rel="noreferrer">
            {shortUrl(rec.principal.url)}
          </a>
          {rec.tipo === "portal" && (
            <div className="qr-note">Este QR code abre o portal com as {rec.catalogTotal} vagas do catálogo.</div>
          )}
          {rec.principal.niveis.includes("jovem") && <div className="qr-note">{JOVEM_NOTA}</div>}
          {rec.principal.tipo === "busca" && rec.tipo === "vaga" && (
            <div className="qr-note">Abre a busca por esta vaga no portal Gupy.</div>
          )}
        </div>
      </div>

      {rec.tipo === "vaga" && (
        <p className="aviso" role="note">
          <strong>É uma sugestão.</strong> {AVISO_SUGESTAO}
        </p>
      )}

      {rec.relacionadas.length > 0 && (
        <section className="related">
          <h3 className="related__title">
            {rec.tipo === "portal" ? `Vagas abertas em ${rec.areaLabel ?? "sua área"}` : "Outras sugestões para você"}
          </h3>
          <p className="related__sub">
            {rec.tipo === "portal"
              ? `Encontramos ${rec.total} ${rec.total === 1 ? "vaga" : "vagas"} nessa área. Elas podem ter nível, formação ou local diferentes; confira os requisitos.`
              : `Encontramos ${rec.total} sugestões compatíveis com as suas respostas. Estas são as mais próximas do seu perfil.`}
          </p>
          <div className="related__grid">
            {rec.relacionadas.map((r) => (
              <div className="related-card" key={r.vaga.url}>
                <div className="related-card__qr">
                  <QRCodeSVG value={r.vaga.url} size={128} level="M" fgColor={QR_COLOR} bgColor="#ffffff" />
                </div>
                <div className="related-card__info">
                  <span className="related-card__tag">{r.tag}</span>
                  <span className="related-card__name">{r.vaga.titulo}</span>
                  <span className="related-card__local">{r.vaga.local}</span>
                  {r.motivos.length > 0 && (
                    <span className="related-card__why">{r.motivos.slice(0, 2).join(", ")}</span>
                  )}
                  <a className="related-card__link" href={r.vaga.url} target="_blank" rel="noreferrer">
                    {r.vaga.tipo === "busca" ? "Abre a busca no portal Gupy" : shortUrl(r.vaga.url, 34)}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="result__foot">
        <span>
          Todas as {rec.catalogTotal} vagas: <strong>{shortUrl(PORTAL_VAGAS)}</strong>
        </span>
        <button type="button" className="btn btn--link" onClick={onRestart}>
          Refazer o teste
        </button>
      </div>
    </div>
  );
}

