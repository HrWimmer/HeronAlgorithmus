/*
  Fortschrittstracking – schlanke Variante (nur LocalStorage, kein Firebase).
  Wird von jedem Modul separat mit ProgressTracker.init(moduleKey) initialisiert.
  Erwartet im HTML: window.TOTAL_TASKS, Elemente #progress-bar-fill, #progress-count.
*/
(function (window) {
  "use strict";

  const ProgressTracker = {
    _moduleKey: "modul",
    _solved: new Set(),

    init(moduleKey) {
      this._moduleKey = moduleKey;
      this.restore();
      this._bindSecretSolveAll();
      return this;
    },

    _storageKey() {
      return `progress::${this._moduleKey}`;
    },

    restore() {
      try {
        const raw = localStorage.getItem(this._storageKey());
        this._solved = new Set(raw ? JSON.parse(raw) : []);
      } catch (e) {
        this._solved = new Set();
      }
      this._solved.forEach((key) => this._applySolvedVisuals(key));
      this._updateBar();
      return this._solved;
    },

    _persist() {
      localStorage.setItem(this._storageKey(), JSON.stringify([...this._solved]));
    },

    solve(taskKey) {
      if (this._solved.has(taskKey)) return;
      this._solved.add(taskKey);
      this._persist();
      this._applySolvedVisuals(taskKey);
      this._updateBar();
      document.dispatchEvent(new CustomEvent("task-solved", { detail: { taskKey } }));
    },

    isSolved(taskKey) {
      return this._solved.has(taskKey);
    },

    count() {
      return this._solved.size;
    },

    _applySolvedVisuals(taskKey) {
      document.querySelectorAll(`[data-task="${taskKey}"]`).forEach((el) => {
        el.classList.add("task-solved");
      });
      const badge = document.querySelector(`[data-task-badge="${taskKey}"]`);
      if (badge) {
        badge.textContent = "erledigt";
        badge.classList.remove("bg-slate-700", "text-slate-300");
        badge.classList.add("bg-emerald-600", "text-white");
      }
    },

    _updateBar() {
      const total = window.TOTAL_TASKS || 1;
      const solved = this._solved.size;
      const pct = Math.min(100, Math.round((solved / total) * 100));
      const fill = document.getElementById("progress-bar-fill");
      const count = document.getElementById("progress-count");
      if (fill) fill.style.width = `${pct}%`;
      if (count) count.textContent = `${Math.min(solved, total)} / ${total}`;
    },

    // Geheime Schnelllöse-Taste für Lehrer-Demonstrationen.
    _bindSecretSolveAll() {
      if (this._boundSecret) return;
      this._boundSecret = true;
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "Enter") {
          document.dispatchEvent(new CustomEvent("solve-all-tasks"));
        } else if (e.ctrlKey && e.shiftKey && (e.key === "R" || e.key === "r")) {
          e.preventDefault();
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.includes(this._moduleKey)) keysToRemove.push(k);
          }
          keysToRemove.forEach((k) => localStorage.removeItem(k));
          location.reload();
        }
      });
    },
  };

  // Genereller Helfer zum Freischalten der nächsten Sektion.
  window.unlockSection = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("hidden");
    requestAnimationFrame(() => {
      el.classList.add("section-visible");
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  window.ProgressTracker = ProgressTracker;
})(window);
