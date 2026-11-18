/* =========================================================
   Atuali Contabilidade — interações da landing page
   ---------------------------------------------------------
   Todos os contatos e mensagens ficam neste objeto.
   Campos vazios ficam ocultos na página.
   whatsapp: só números, com DDI e DDD. Ex.: "5591999999999"

   ATENÇÃO: ao instalar qualquer ferramenta de medição
   (Google Analytics, Clarity, Cloudflare Web Analytics, Zaraz…),
   atualize também a página /privacidade.
   ========================================================= */
const CONFIG = {
  whatsapp: "5591999852261",
  telefone: "",          // fixo (opcional)
  email: "marioelisio@gmail.com",
  instagram: "atualicontabilidade",
  endereco: "Belém · Pará",
  fundacao: 2006,
  registroCrc: "1991-09-04", // registro do responsável técnico no CRC-PA

  // Mensagem pré-preenchida do WhatsApp para cada botão (chave = data-cta)
  mensagens: {
    menu: "Olá! Vim pelo site da Atuali e gostaria de falar com um contador.",
    topo: "Olá! Vim pelo site da Atuali e gostaria de receber uma proposta para a minha empresa.",
    reforma: "Olá! Quero um diagnóstico de como a Reforma Tributária afeta a minha empresa.",
    "quem-somos": "Olá, Mario! Vim pelo site da Atuali e gostaria de conversar com você.",
    contato: "Olá! Vim pelo site da Atuali e gostaria de mais informações.",
    flutuante: "Olá! Vim pelo site da Atuali e tenho uma dúvida.",
    formulario: "Olá, Atuali Contabilidade! Vim pelo site."
  }
};

document.documentElement.classList.remove("no-js");

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Contatos ---------- */
  const onlyDigits = (v) => (v || "").replace(/\D/g, "");
  const formatPhone = (digits) => {
    const d = digits.replace(/^55/, "");
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return digits;
  };
  const waNumber = onlyDigits(CONFIG.whatsapp);
  const waLink = (text) =>
    `https://wa.me/${waNumber}?text=${encodeURIComponent(text || CONFIG.mensagens.contato)}`;

  if (waNumber) {
    $$("[data-whatsapp]").forEach((a) => {
      a.href = waLink(CONFIG.mensagens[a.dataset.cta]);
      a.target = "_blank";
      a.rel = "noopener";
    });
    const li = $('[data-contact="whatsapp"]');
    $("a", li).textContent = formatPhone(waNumber);
    li.hidden = false;
  }
  if (CONFIG.telefone) {
    const li = $('[data-contact="telefone"]');
    const a = $("a", li);
    a.href = `tel:+55${onlyDigits(CONFIG.telefone).replace(/^55/, "")}`;
    a.textContent = CONFIG.telefone;
    li.hidden = false;
  }
  if (CONFIG.email) {
    const li = $('[data-contact="email"]');
    const a = $("a", li);
    a.href = `mailto:${CONFIG.email}`;
    a.textContent = CONFIG.email;
    li.hidden = false;
  }
  if (CONFIG.instagram) {
    const li = $('[data-contact="instagram"]');
    const a = $("a", li);
    const user = CONFIG.instagram.replace(/^@/, "");
    a.href = `https://instagram.com/${user}`;
    a.textContent = `@${user}`;
    li.hidden = false;
  }
  if (CONFIG.endereco) $('[data-contact-text="endereco"]').textContent = CONFIG.endereco;

  /* ---------- Cliques nos botões de contato ----------
     Um único listener para todos os [data-cta].
     Dispara o evento "atuali:cta" na página e repassa para
     Zaraz ou Google Analytics somente se estiverem instalados
     (hoje nenhuma ferramenta de medição está instalada). */
  const trackCta = (cta) => {
    const detail = { cta };
    window.dispatchEvent(new CustomEvent("atuali:cta", { detail }));
    if (window.zaraz && typeof window.zaraz.track === "function") window.zaraz.track("cta_click", detail);
    if (typeof window.gtag === "function") window.gtag("event", "cta_click", detail);
  };
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-cta]");
    if (el) trackCta(el.dataset.cta);
  });

  /* ---------- Header + botão flutuante ---------- */
  const header = $(".header");
  const fab = $(".fab");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);
    fab.classList.toggle("is-visible", y > window.innerHeight * 0.6);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const burger = $(".burger");
  const menuLinks = $$("#menu a");
  const isOpen = () => document.body.classList.contains("menu-open");
  const setMenu = (open, { returnFocus = false } = {}) => {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    if (!open && returnFocus) burger.focus();
  };
  burger.addEventListener("click", () => setMenu(!isOpen()));
  menuLinks.forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") return setMenu(false, { returnFocus: true });
    // Com o menu aberto, o Tab circula só entre o botão de fechar e os links
    if (e.key === "Tab") {
      const items = [burger, ...menuLinks];
      const i = items.indexOf(document.activeElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i === -1 || i === items.length - 1 ? 0 : i + 1);
      e.preventDefault();
      items[next].focus();
    }
  });
  window.matchMedia("(min-width: 961px)").addEventListener("change", (e) => e.matches && setMenu(false));

  /* ---------- Animação ao rolar ---------- */
  const items = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const siblings = [...en.target.parentElement.children].filter((c) => c.classList.contains("reveal"));
          const i = Math.max(0, siblings.indexOf(en.target));
          en.target.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- FAQ: um aberto por vez ---------- */
  $$(".faq details").forEach((d) =>
    d.addEventListener("toggle", () => {
      if (d.open) $$(".faq details").forEach((o) => o !== d && (o.open = false));
    })
  );

  /* ---------- Formulário ---------- */
  const form = $("#form-contato");
  const msg = $(".form__msg", form);
  const tel = form.elements.telefone;

  tel.addEventListener("input", () => {
    const d = onlyDigits(tel.value).slice(0, 11);
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 6) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    tel.value = out;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    msg.classList.remove("is-error");
    let firstBad = null;
    ["nome", "telefone", "perfil"].forEach((n) => {
      const el = form.elements[n];
      const bad = n === "telefone" ? onlyDigits(el.value).length < 10 : !el.value.trim();
      el.classList.toggle("is-invalid", bad);
      el.setAttribute("aria-invalid", String(bad));
      if (bad && !firstBad) firstBad = el;
    });
    if (firstBad) {
      msg.textContent = "Preencha nome, telefone e o tipo da sua empresa.";
      msg.classList.add("is-error");
      firstBad.focus();
      return;
    }

    const servicos = $$('input[name="servico"]:checked', form).map((i) => i.value);
    const texto = [
      CONFIG.mensagens.formulario,
      "",
      `*Nome:* ${form.elements.nome.value.trim()}`,
      `*Telefone:* ${tel.value}`,
      `*Empresa:* ${form.elements.perfil.value}`,
      servicos.length ? `*Preciso de:* ${servicos.join(", ")}` : "",
      form.elements.mensagem.value.trim() ? `*Mensagem:* ${form.elements.mensagem.value.trim()}` : ""
    ].filter(Boolean).join("\n");

    trackCta("formulario");
    if (waNumber) {
      window.open(waLink(texto), "_blank", "noopener");
      msg.textContent = "Abrimos o WhatsApp com a sua mensagem. É só enviar!";
    } else if (CONFIG.email) {
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Proposta pelo site")}&body=${encodeURIComponent(texto.replace(/\*/g, ""))}`;
      msg.textContent = "Abrimos o seu e-mail com a mensagem pronta.";
    } else {
      msg.textContent = "Nosso canal de atendimento está sendo configurado. Tente novamente em breve.";
      msg.classList.add("is-error");
    }
  });

  /* ---------- Anos de empresa e de profissão ---------- */
  const hoje = new Date();
  $("#ano").textContent = hoje.getFullYear();
  $$("[data-anos]").forEach((el) => (el.textContent = hoje.getFullYear() - CONFIG.fundacao));

  const [cy, cm, cd] = CONFIG.registroCrc.split("-").map(Number);
  let anosCrc = hoje.getFullYear() - cy;
  if (hoje < new Date(hoje.getFullYear(), cm - 1, cd)) anosCrc--;
  $$("[data-anos-crc]").forEach((el) => (el.textContent = anosCrc));
})();
