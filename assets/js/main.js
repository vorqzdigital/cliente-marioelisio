/* =========================================================
   Atuali Contabilidade — interações da landing page
   ---------------------------------------------------------
   Preencha os contatos abaixo. Campos vazios ficam ocultos.
   whatsapp: só números, com DDI e DDD. Ex.: "5591999999999"
   ========================================================= */
const CONFIG = {
  whatsapp: "5591999852261",
  telefone: "",          // fixo (opcional)
  email: "marioelisio@gmail.com",
  instagram: "atualicontabilidade",
  endereco: "Belém · Pará",
  fundacao: 2006
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
    `https://wa.me/${waNumber}?text=${encodeURIComponent(text || "Olá! Vim pelo site da Atuali Contabilidade e gostaria de mais informações.")}`;

  if (waNumber) {
    $$("[data-whatsapp]").forEach((a) => {
      a.href = waLink();
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
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  };
  burger.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  $$("#menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
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
    let ok = true;
    ["nome", "telefone", "perfil"].forEach((n) => {
      const el = form.elements[n];
      const bad = n === "telefone" ? onlyDigits(el.value).length < 10 : !el.value.trim();
      el.classList.toggle("is-invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) {
      msg.textContent = "Preencha nome, telefone e o tipo da sua empresa.";
      msg.classList.add("is-error");
      return;
    }

    const servicos = $$('input[name="servico"]:checked', form).map((i) => i.value);
    const texto = [
      "Olá, Atuali Contabilidade! Vim pelo site.",
      "",
      `*Nome:* ${form.elements.nome.value.trim()}`,
      `*Telefone:* ${tel.value}`,
      `*Empresa:* ${form.elements.perfil.value}`,
      servicos.length ? `*Preciso de:* ${servicos.join(", ")}` : "",
      form.elements.mensagem.value.trim() ? `*Mensagem:* ${form.elements.mensagem.value.trim()}` : ""
    ].filter(Boolean).join("\n");

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

  const ano = new Date().getFullYear();
  $("#ano").textContent = ano;
  $$("[data-anos]").forEach((el) => (el.textContent = ano - CONFIG.fundacao));

  // Anos de profissão contados a partir do registro no CRC-PA (04/09/1991)
  const crc = new Date(1991, 8, 4), hoje = new Date();
  let anosCrc = hoje.getFullYear() - crc.getFullYear();
  if (hoje < new Date(hoje.getFullYear(), crc.getMonth(), crc.getDate())) anosCrc--;
  $$("[data-anos-crc]").forEach((el) => (el.textContent = anosCrc));
})();
