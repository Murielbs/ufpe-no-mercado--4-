import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AVISO_SUGESTAO, BUSCA_LABEL, EMAIL_ENDPOINT, JOVEM_NOTA, PORTAL_VAGAS } from "../data";
import { recommend } from "../recommend";
import type { Answers } from "../types";
import { EMAIL_RE, firstName, shortUrl } from "../utils";

interface Props {
  answers: Answers;
  onRestart: () => void;
}

type EmailStatus = "idle" | "sending" | "sent" | "error";

const QR_COLOR = "#14213F";

export function Result({ answers, onRestart }: Props) {
  const rec = useMemo(() => recommend(answers), [answers]);
  const [status, setStatus] = useState<EmailStatus>("idle");
  const autoSent = useRef(false);

  const email = answers.email.trim();
  const canEmail = EMAIL_ENDPOINT !== "" && EMAIL_RE.test(email);
  const nome = firstName(answers.nome) || "participante";

  const send = useCallback(async () => {
    setStatus("sending");
    try {
      await fetch(EMAIL_ENDPOINT, {
        method: "POST",
        mode: "no-cors", // o Apps Script não devolve resposta legível ao navegador
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          nome: answers.nome,
          email,
          curso: answers.curso,
          periodo: answers.periodo,
          escolaridade: answers.escolaridade,
          instituicao: answers.instituicao,
          cidade: answers.cidade,
          uf: answers.uf,
          busca: answers.busca ? BUSCA_LABEL[answers.busca] : "",
          area: rec.areaLabel ?? "",
          outrasVagas: rec.relacionadas.map((r) => ({ titulo: r.vaga.titulo, url: r.vaga.url })),
          aviso: AVISO_SUGESTAO,
          vagaTitulo: rec.principal.titulo,
          vagaUrl: rec.principal.url,
          portalUrl: PORTAL_VAGAS,
        }),
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }, [answers, email, rec]);

  // envio automático (a trava evita e-mail duplicado no StrictMode)
  useEffect(() => {
    if (canEmail && !autoSent.current) {
      autoSent.current = true;
      void send();
    }
  }, [canEmail, send]);

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
            <img src="/image_1657a3.jpg" alt="Mascote Moura" onError={(e) => (e.currentTarget.style.display = "none")} />
            <p>
              {rec.tipo === "vaga"
                ? `${nome}, esta é uma sugestão de vaga para o seu perfil. Escaneie para conhecer os detalhes e, se fizer sentido, se inscrever.`
                : `${nome}, escaneie para conhecer todas as vagas abertas.`}
            </p>
          </div>
        </div>

        <div className="qr-panel">
          <div className="qr-frame">
            <QRCodeSVG value={rec.principal.url} size={256} level="M" fgColor={QR_COLOR} bgColor="#ffffff" />
          </div>
          <div className="qr-hint">Aponte a câmera do celular</div>
          <div className="link-box">{shortUrl(rec.principal.url)}</div>
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

      {canEmail && (
        <div className={`email-status is-${status}`} aria-live="polite">
          {status === "sending" && <>Enviando a vaga para {email}…</>}
          {status === "sent" && <>✓ Enviamos a vaga para {email}. Confira também o spam.</>}
          {status === "error" && (
            <>
              Não foi possível enviar o e-mail agora. Use o QR code acima.
              <button type="button" className="btn btn--link" onClick={() => void send()}>
                Tentar de novo
              </button>
            </>
          )}
        </div>
      )}

      {rec.relacionadas.length > 0 && (
        <section className="related">
          <h3 className="related__title">Outras sugestões para você</h3>
          <p className="related__sub">
            Encontramos {rec.total} sugestões compatíveis com as suas respostas. Estas são as mais próximas do seu perfil.
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
                  <span className="related-card__link">
                    {r.vaga.tipo === "busca" ? "Abre a busca no portal Gupy" : shortUrl(r.vaga.url, 34)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="result__foot">
        <span>
          Todas as vagas: <strong>{shortUrl(PORTAL_VAGAS)}</strong>
        </span>
        <button type="button" className="btn btn--link" onClick={onRestart}>
          Refazer o teste
        </button>
      </div>
    </div>
  );
}
