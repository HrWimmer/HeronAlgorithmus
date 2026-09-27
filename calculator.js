/*
  Schwimmender Taschenrechner – wird per Skript-Tag eingebunden und baut
  sein DOM selbst auf. Trigger unten rechts, per CalculatorApp.showTrigger()
  sichtbar machen bzw. CalculatorApp.hideTrigger() wieder verstecken.
*/
(function (window, document) {
  "use strict";

  const state = { display: "0", stored: null, op: null, resetOnInput: false };

  function fmt(n) {
    if (!isFinite(n)) return "Fehler";
    const rounded = Math.round(n * 1e10) / 1e10;
    return rounded.toString();
  }

  function refresh() {
    const disp = document.getElementById("calc-display");
    if (disp) disp.textContent = state.display;
  }

  function inputDigit(d) {
    if (state.resetOnInput || state.display === "0") {
      state.display = d === "," ? "0," : d;
      state.resetOnInput = false;
    } else if (d === "," && state.display.includes(",")) {
      return;
    } else {
      state.display += d;
    }
    refresh();
  }

  function toNumber() {
    return parseFloat(state.display.replace(",", "."));
  }

  function setOp(op) {
    if (state.op && !state.resetOnInput) {
      compute();
    }
    state.stored = toNumber();
    state.op = op;
    state.resetOnInput = true;
  }

  function compute() {
    if (state.op === null || state.stored === null) return;
    const a = state.stored;
    const b = toNumber();
    let r = b;
    switch (state.op) {
      case "+": r = a + b; break;
      case "-": r = a - b; break;
      case "×": r = a * b; break;
      case "÷": r = b === 0 ? NaN : a / b; break;
      case "^": r = Math.pow(a, b); break;
    }
    state.display = fmt(r);
    state.op = null;
    state.stored = null;
    state.resetOnInput = true;
    refresh();
  }

  function unary(fn) {
    const v = fn(toNumber());
    state.display = fmt(v);
    state.resetOnInput = true;
    refresh();
  }

  function clearAll() {
    state.display = "0";
    state.stored = null;
    state.op = null;
    state.resetOnInput = false;
    refresh();
  }

  function buildDom() {
    const trigger = document.createElement("button");
    trigger.id = "calc-trigger";
    trigger.className = "bg-indigo-600 hover:bg-indigo-500 text-white";
    trigger.setAttribute("aria-label", "Taschenrechner öffnen");
    trigger.textContent = "🧮";
    trigger.addEventListener("click", () => CalculatorApp.toggle());
    document.body.appendChild(trigger);

    const panel = document.createElement("div");
    panel.id = "calc-panel";
    panel.className = "glass-panel rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/95";
    panel.innerHTML = `
      <div id="calc-header" class="flex items-center justify-between px-3 py-2 bg-slate-800/80 text-slate-200 text-sm font-medium">
        <span>Taschenrechner</span>
        <button id="calc-close" class="text-slate-400 hover:text-white px-1" aria-label="Schließen">✕</button>
      </div>
      <div class="p-3">
        <div id="calc-display" class="bg-slate-950 text-slate-100 text-right text-xl px-3 py-2 rounded-lg mb-2">0</div>
        <div class="grid grid-cols-4 gap-1.5 text-sm">
          <button data-a="clear" class="calc-btn col-span-2 rounded-lg bg-rose-700/70 hover:bg-rose-600 text-white">AC</button>
          <button data-u="inv" class="calc-btn rounded-lg bg-slate-700 hover:bg-slate-600 text-white">1/x</button>
          <button data-op="÷" class="calc-btn rounded-lg bg-amber-600 hover:bg-amber-500 text-white">÷</button>

          <button data-d="7" class="calc-btn rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">7</button>
          <button data-d="8" class="calc-btn rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">8</button>
          <button data-d="9" class="calc-btn rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">9</button>
          <button data-op="×" class="calc-btn rounded-lg bg-amber-600 hover:bg-amber-500 text-white">×</button>

          <button data-d="4" class="calc-btn rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">4</button>
          <button data-d="5" class="calc-btn rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">5</button>
          <button data-d="6" class="calc-btn rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">6</button>
          <button data-op="-" class="calc-btn rounded-lg bg-amber-600 hover:bg-amber-500 text-white">−</button>

          <button data-d="1" class="calc-btn rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">1</button>
          <button data-d="2" class="calc-btn rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">2</button>
          <button data-d="3" class="calc-btn rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">3</button>
          <button data-op="+" class="calc-btn rounded-lg bg-amber-600 hover:bg-amber-500 text-white">+</button>

          <button data-u="sign" class="calc-btn rounded-lg bg-slate-700 hover:bg-slate-600 text-white">±</button>
          <button data-d="0" class="calc-btn rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">0</button>
          <button data-d="," class="calc-btn rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">,</button>
          <button data-eq="1" class="calc-btn rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">=</button>

          <button data-u="sq" class="calc-btn rounded-lg bg-slate-700 hover:bg-slate-600 text-white">x²</button>
          <button data-u="sqrt" class="calc-btn rounded-lg bg-slate-700 hover:bg-slate-600 text-white">√x</button>
          <button data-op="^" class="calc-btn col-span-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white">xʸ</button>
        </div>
      </div>`;
    document.body.appendChild(panel);

    panel.querySelectorAll("[data-d]").forEach((b) =>
      b.addEventListener("click", () => inputDigit(b.dataset.d))
    );
    panel.querySelectorAll("[data-op]").forEach((b) =>
      b.addEventListener("click", () => setOp(b.dataset.op))
    );
    panel.querySelector("[data-eq]").addEventListener("click", compute);
    panel.querySelector('[data-a="clear"]').addEventListener("click", clearAll);
    panel.querySelector('[data-u="sign"]').addEventListener("click", () => unary((v) => -v));
    panel.querySelector('[data-u="sq"]').addEventListener("click", () => unary((v) => v * v));
    panel.querySelector('[data-u="sqrt"]').addEventListener("click", () => unary((v) => Math.sqrt(v)));
    panel.querySelector('[data-u="inv"]').addEventListener("click", () => unary((v) => 1 / v));
    panel.querySelector("#calc-close").addEventListener("click", () => CalculatorApp.close());

    makeDraggable(panel, panel.querySelector("#calc-header"));
  }

  function makeDraggable(panel, handle) {
    let dragging = false;
    let offX = 0;
    let offY = 0;

    function start(clientX, clientY) {
      dragging = true;
      const rect = panel.getBoundingClientRect();
      offX = clientX - rect.left;
      offY = clientY - rect.top;
      panel.style.right = "auto";
      panel.style.bottom = "auto";
    }
    function move(clientX, clientY) {
      if (!dragging) return;
      const maxX = window.innerWidth - panel.offsetWidth - 4;
      const maxY = window.innerHeight - panel.offsetHeight - 4;
      panel.style.left = `${Math.min(Math.max(0, clientX - offX), maxX)}px`;
      panel.style.top = `${Math.min(Math.max(0, clientY - offY), maxY)}px`;
    }
    function end() {
      dragging = false;
    }

    handle.addEventListener("mousedown", (e) => start(e.clientX, e.clientY));
    window.addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
    window.addEventListener("mouseup", end);

    handle.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches[0];
        start(t.clientX, t.clientY);
      },
      { passive: true }
    );
    window.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches[0];
        move(t.clientX, t.clientY);
      },
      { passive: true }
    );
    window.addEventListener("touchend", end);
  }

  const CalculatorApp = {
    showTrigger() {
      const t = document.getElementById("calc-trigger");
      if (t) t.classList.add("visible");
    },
    hideTrigger() {
      const t = document.getElementById("calc-trigger");
      if (t) t.classList.remove("visible");
      this.close();
    },
    toggle() {
      const p = document.getElementById("calc-panel");
      if (!p) return;
      p.classList.toggle("open");
    },
    close() {
      const p = document.getElementById("calc-panel");
      if (p) p.classList.remove("open");
    },
  };

  document.addEventListener("DOMContentLoaded", buildDom);
  window.CalculatorApp = CalculatorApp;
})(window, document);
