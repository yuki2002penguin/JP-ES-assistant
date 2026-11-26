window.__JP_ES_CURRENT_FIELD__ = null;
window.__JP_ES_CURSOR_START__ = 0;
window.__JP_ES_CURSOR_END__ = 0;

function setActiveField(el) {
  if (window.__JP_ES_CURRENT_FIELD__ && window.__JP_ES_CURRENT_FIELD__ !== el) {
    window.__JP_ES_CURRENT_FIELD__.classList.remove("jp-es-active-field");
  }

  window.__JP_ES_CURRENT_FIELD__ = el;
  el.classList.add("jp-es-active-field");
}

function isEditable(el) {
  if (!el) return false;

  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    const type = (el.type || "").toLowerCase();
    return !["hidden", "button", "submit", "reset", "file", "checkbox", "radio"].includes(type)
      && !el.disabled
      && !el.readOnly;
  }

  return el.isContentEditable;
}

function rememberField(el) {
  if (!isEditable(el)) return;

  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    window.__JP_ES_CURSOR_START__ = el.selectionStart ?? el.value.length;
    window.__JP_ES_CURSOR_END__ = el.selectionEnd ?? el.value.length;
  }

  setActiveField(el);
}

document.addEventListener("focusin", e => rememberField(e.target), true);
document.addEventListener("mousedown", e => rememberField(e.target), true);
document.addEventListener("mouseup", e => rememberField(e.target), true);
document.addEventListener("keyup", e => rememberField(e.target), true);
document.addEventListener("selectionchange", () => {
  rememberField(document.activeElement);
}, true);
