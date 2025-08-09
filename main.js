const $ = (id) => document.getElementById(id);
const SETTINGS_KEY = "tts_reader_settings_v1";
let voices = [],
  utterance = null;

function populateVoices() {
  voices = speechSynthesis.getVoices();
  const sel = $("voice");
  sel.innerHTML = "";

  const arabicVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith("ar")
  );
  const otherVoices = voices.filter(
    (v) => !v.lang.toLowerCase().startsWith("ar")
  );
  const allVoices = [...arabicVoices, ...otherVoices];

  allVoices.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = voices.indexOf(v);
    opt.textContent = `${v.name} (${v.lang})${v.default ? " — Default" : ""}`;
    sel.appendChild(opt);
  });

  if (arabicVoices.length > 0) {
    sel.value = voices.indexOf(arabicVoices[0]);
    $(
      "voice-note"
    ).textContent = `Arabic voice preselected — ${voices.length} voices total`;
    $("text").dir = "rtl";
  } else {
    $("voice-note").textContent = `${voices.length} voices available`;
    $("text").dir = "ltr";
  }
}

speechSynthesis.onvoiceschanged = populateVoices;
populateVoices();

$("voice").addEventListener("change", () => {
  const selectedVoice = voices[parseInt($("voice").value, 10)];
  if (selectedVoice && selectedVoice.lang.toLowerCase().startsWith("ar")) {
    $("text").dir = "rtl";
  } else {
    $("text").dir = "ltr";
  }
});

function speak(txt) {
  if (!txt.trim()) return;
  window.speechSynthesis.cancel();
  utterance = new SpeechSynthesisUtterance(txt);
  const idx = parseInt($("voice").value, 10);
  if (voices[idx]) utterance.voice = voices[idx];
  utterance.rate = parseFloat($("rate").value);
  utterance.pitch = parseFloat($("pitch").value);
  utterance.volume = parseFloat($("volume").value);
  utterance.onstart = () => {
    $("dot").className = "dot playing";
    $("status-text").textContent = "playing";
  };
  utterance.onend = () => {
    $("dot").className = "dot";
    $("status-text").textContent = "idle";
  };
  utterance.onpause = () => {
    $("dot").className = "dot paused";
    $("status-text").textContent = "paused";
  };
  speechSynthesis.speak(utterance);
}

$("rate").oninput = () => ($("rate-val").textContent = $("rate").value);
$("pitch").oninput = () => ($("pitch-val").textContent = $("pitch").value);
$("volume").oninput = () => ($("volume-val").textContent = $("volume").value);

$("play").onclick = () => {
  const txt =
    $("sel-only").checked && window.getSelection().toString()
      ? window.getSelection().toString()
      : $("text").value;
  speak(txt);
};
$("pause").onclick = () => speechSynthesis.pause();
$("resume").onclick = () => speechSynthesis.resume();
$("stop").onclick = () => {
  speechSynthesis.cancel();
  $("dot").className = "dot";
  $("status-text").textContent = "stopped";
};

$("save-settings").onclick = () => {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      voice: $("voice").value,
      rate: $("rate").value,
      pitch: $("pitch").value,
      volume: $("volume").value,
      sel: $("sel-only").checked,
    })
  );
  alert("Settings saved");
};
$("clear-settings").onclick = () => {
  localStorage.removeItem(SETTINGS_KEY);
  alert("Settings cleared");
};

const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
if (saved.voice) $("voice").value = saved.voice;
if (saved.rate) {
  $("rate").value = saved.rate;
  $("rate-val").textContent = saved.rate;
}
if (saved.pitch) {
  $("pitch").value = saved.pitch;
  $("pitch-val").textContent = saved.pitch;
}
if (saved.volume) {
  $("volume").value = saved.volume;
  $("volume-val").textContent = saved.volume;
}
if (saved.sel) $("sel-only").checked = saved.sel;
///
speechSynthesis.onvoiceschanged = () => {
  populateVoices();
  const arIndex = voices.findIndex((v) =>
    v.lang.toLowerCase().startsWith("ar")
  );
  if (arIndex >= 0) $("voice").value = arIndex;
};

function populateVoices() {
  voices = speechSynthesis.getVoices();
  const sel = $("voice");
  sel.innerHTML = "";

  // Arabic voices first, then the rest
  const sortedVoices = [
    ...voices.filter((v) => v.lang.toLowerCase().startsWith("ar")),
    ...voices.filter((v) => !v.lang.toLowerCase().startsWith("ar")),
  ];

  sortedVoices.forEach((v, i) => {
    const opt = document.createElement("option");
    opt.value = voices.indexOf(v);
    opt.textContent = `${v.name} (${v.lang})${v.default ? " — Default" : ""}`;
    sel.appendChild(opt);
  });

  const arabicCount = voices.filter((v) =>
    v.lang.toLowerCase().startsWith("ar")
  ).length;
  $(
    "voice-note"
  ).textContent = `${voices.length} voices available — ${arabicCount} Arabic`;
}
