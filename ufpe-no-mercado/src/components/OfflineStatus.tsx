import { useEffect, useState } from "react";

type Status = "preparing" | "ready" | "error" | "unsupported";
interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function checkOffline(worker: ServiceWorker): Promise<boolean> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const finish = (ready: boolean) => {
      window.clearTimeout(timeout);
      channel.port1.close();
      resolve(ready);
    };
    const timeout = window.setTimeout(() => finish(false), 10_000);
    channel.port1.onmessage = (event) => finish(event.data?.ready === true);
    worker.postMessage({ type: "CHECK_OFFLINE" }, [channel.port2]);
  });
}

export function OfflineStatus({ visible }: { visible: boolean }) {
  const [status, setStatus] = useState<Status>("preparing");
  const [online, setOnline] = useState(navigator.onLine);
  const [install, setInstall] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(window.matchMedia("(display-mode: standalone)").matches);
  const [update, setUpdate] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const connection = () => setOnline(navigator.onLine);
    const prompt = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallPrompt);
    };
    const installedApp = () => { setInstalled(true); setInstall(null); };
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    window.addEventListener("beforeinstallprompt", prompt);
    window.addEventListener("appinstalled", installedApp);
    return () => {
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
      window.removeEventListener("beforeinstallprompt", prompt);
      window.removeEventListener("appinstalled", installedApp);
    };
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (!("serviceWorker" in navigator) || !window.isSecureContext) {
      setStatus("unsupported");
      return;
    }
    let cancelled = false;
    let verified = false;
    const cleanups: (() => void)[] = [];
    setStatus("preparing");
    const fail = () => { if (!cancelled && !verified) setStatus("error"); };
    const verify = async () => {
      const worker = navigator.serviceWorker.controller;
      if (!worker) return;
      const ready = await checkOffline(worker);
      if (cancelled) return;
      verified = ready;
      setStatus(ready ? "ready" : "error");
    };
    navigator.serviceWorker.addEventListener("controllerchange", verify);
    void verify();
    // O limite apenas altera o aviso; um download lento ainda pode concluir depois.
    const timer = window.setTimeout(fail, 180_000);
    const prepare = async () => {
      try {
        const base = new URL(import.meta.env.BASE_URL, document.baseURI);
        const registration = await navigator.serviceWorker.register(new URL("sw.js", base), {
          scope: base.href,
          updateViaCache: "none",
        });
        if (cancelled) return;
        setUpdate(Boolean(registration.waiting));
        const observe = () => {
          const worker = registration.installing;
          if (!worker) return;
          const change = () => {
            if (cancelled) return;
            if (worker.state === "redundant") fail();
            if (worker.state === "installed" && registration.active) setUpdate(true);
          };
          worker.addEventListener("statechange", change);
          cleanups.push(() => worker.removeEventListener("statechange", change));
        };
        observe();
        registration.addEventListener("updatefound", observe);
        cleanups.push(() => registration.removeEventListener("updatefound", observe));
        await navigator.serviceWorker.ready;
        await verify();
      } catch {
        // Uma falha ao procurar atualização não invalida uma cópia já salva.
        await verify();
        fail();
      }
    };
    void prepare();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      navigator.serviceWorker.removeEventListener("controllerchange", verify);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [attempt, online]);

  const installApp = async () => {
    if (!install) return;
    try {
      // Solicitação opcional para reduzir a chance de remoção automática do cache.
      void navigator.storage?.persist?.().catch(() => false);
      await install.prompt();
      await install.userChoice;
    } catch {
      // O menu do navegador continua disponível se o convite for recusado.
    } finally {
      setInstall(null);
    }
  };

  if (!import.meta.env.PROD || !visible) return null;
  const messages: Record<Status, string> = {
    preparing: "Baixando os arquivos para usar sem internet…",
    ready: online ? "Pronto para usar sem internet" : "Sem internet · pronto para usar",
    error: "O download offline não foi concluído. Conecte à internet e tente novamente.",
    unsupported: "Para salvar offline, abra o endereço HTTPS no Chrome do Android.",
  };

  return (
    <aside className={`offline-status offline-status--${status}`} aria-label="Uso sem internet">
      <p role="status">{messages[status]}</p>
      {status === "preparing" && <small>Mantenha o site aberto até terminar, inclusive o download do vídeo.</small>}
      {status === "error" && <button type="button" onClick={() => setAttempt((value) => value + 1)}>Tentar baixar novamente</button>}
      {status === "ready" && install && !installed && <button type="button" onClick={() => void installApp()}>Instalar no Android</button>}
      {status === "ready" && !install && !installed && <small>Para criar um atalho, use “Instalar app” ou “Adicionar à tela inicial” no menu do Chrome.</small>}
      {update && <small>Atualização baixada. Após o atendimento, feche todas as abas e janelas deste app e abra novamente.</small>}
    </aside>
  );
}
