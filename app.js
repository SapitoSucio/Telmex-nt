(function () {
  "use strict";

  var state = {
    busy: false,
    records: [],
    file: null,
  };

  var fileInput = document.getElementById("file-input");
  var chooseButton = document.getElementById("choose-button");
  var dropzone = document.getElementById("dropzone");
  var fileSelected = document.getElementById("file-selected");
  var fileName = document.getElementById("file-name");
  var fileSize = document.getElementById("file-size");
  var processingState = document.getElementById("processing-state");
  var processingLabel = document.getElementById("processing-label");
  var processingStep = document.getElementById("processing-step");
  var errorState = document.getElementById("error-state");
  var errorMessage = document.getElementById("error-message");
  var uploadView = document.getElementById("upload-view");
  var resultsSection = document.getElementById("results-section");
  var credentialsList = document.getElementById("credentials-list");
  var copyAllButton = document.getElementById("copy-all-button");
  var downloadButton = document.getElementById("download-button");
  var resetButton = document.getElementById("reset-button");
  var statusText = document.getElementById("status-text");
  var credentialsCount = document.getElementById("credentials-count");
  var toast = document.getElementById("toast");
  var toastMessage = document.getElementById("toast-message");
  var guideButton = document.getElementById("backup-guide-button");
  var guideModal = document.getElementById("backup-guide-modal");
  var guideCloseButton = document.getElementById("guide-close-button");
  var toastTimer = 0;
  var guideReturnFocus = null;
  var guideCloseTimer = 0;

  var encoder = new TextEncoder();
  var decoder = new TextDecoder("utf-8");
  var FILE_KEY_MATERIAL = encoder.encode("hex:13395537D2730554A176799F6D56A239");
  var STRING_KEY = hexToBytes("6fc6e3436a53b6310dc09a475494ac774e7afb21b9e58fc8e58b5660e48e2498");
  var dropzoneBorder = document.querySelector(".dropzone-border");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var DASH_LENGTH = 8;
  var DASH_GAP = 6;
  var dashMotion = {
    currentSpeed: 0.15,
    targetSpeed: 0.15,
    offset: 0,
  };

  var ICONS = {
    "check-circle-2": '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"></path>',
    "shield-check": '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"></path><path d="m9 12 2 2 4-4"></path>',
    "file-lock-2": '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><rect width="8" height="5" x="8" y="13" rx="1"></rect><path d="M10 13v-2a2 2 0 1 1 4 0v2"></path>',
    "upload": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line>',
    "circle-help": '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 2-3 4"></path><path d="M12 18h.01"></path>',
    "file-code-2": '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m10 13-2 2 2 2"></path><path d="m14 17 2-2-2-2"></path>',
    "triangle-alert": '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>',
    "file-plus-2": '<path d="M4 22V4a2 2 0 0 1 2-2h8.5L20 7.5V22"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 13h6"></path><path d="M12 10v6"></path>',
    "copy": '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>',
    "download": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line>',
    "lock": '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    "eye": '<path d="M2.06 12.35a1 1 0 0 1 0-.7C3.63 7.79 7.18 5 12 5s8.37 2.79 9.94 6.65a1 1 0 0 1 0 .7C20.37 16.21 16.82 19 12 19s-8.37-2.79-9.94-6.65Z"></path><circle cx="12" cy="12" r="3"></circle>',
    "eye-off": '<path d="m2 2 20 20"></path><path d="M6.71 6.71C4.82 8 3.45 9.73 2.57 11.68a.8.8 0 0 0 0 .64C4.23 16.01 7.68 19 12 19c1.53 0 2.94-.37 4.18-.99"></path><path d="M10.73 5.08A9.6 9.6 0 0 1 12 5c4.32 0 7.77 2.99 9.43 6.68a.8.8 0 0 1 0 .64 12 12 0 0 1-1.25 2.1"></path><path d="M14.12 14.12A3 3 0 0 1 9.88 9.88"></path>',
    "x": '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>'
  };

  function iconSvg(name, className) {
    var body = ICONS[name];
    if (!body) {
      return "";
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="' +
      (className || "icon") +
      '" aria-hidden="true">' +
      body +
      "</svg>";
  }

  function renderIcons(root) {
    var scope = root || document;
    Array.prototype.slice.call(scope.querySelectorAll("[data-icon]")).forEach(function (node) {
      var name = node.getAttribute("data-icon");
      var markup = iconSvg(name, node.getAttribute("class") || "icon");
      if (markup) {
        node.outerHTML = markup;
      }
    });
  }

  function syncDropzoneDash() {
    if (!dropzoneBorder || !dropzone) {
      return;
    }

    var bounds = dropzone.getBoundingClientRect();
    var width = bounds.width - 2;
    var height = bounds.height - 2;
    if (width <= 0 || height <= 0) {
      return;
    }

    var radius = Math.min(12, width / 2, height / 2);
    var perimeter = 2 * (width + height - 4 * radius) + 2 * Math.PI * radius;
    var periods = Math.max(1, Math.round(perimeter / (DASH_LENGTH + DASH_GAP)));
    var gap = perimeter / periods - DASH_LENGTH;
    dropzoneBorder.style.strokeDasharray = DASH_LENGTH + "px " + gap.toFixed(3) + "px";
  }

  syncDropzoneDash();
  window.addEventListener("resize", syncDropzoneDash);

  function animateDropzoneBorder() {
    dashMotion.currentSpeed += (dashMotion.targetSpeed - dashMotion.currentSpeed) * 0.05;
    dashMotion.offset -= dashMotion.currentSpeed;
    dropzoneBorder.style.strokeDashoffset = dashMotion.offset + "px";
    window.requestAnimationFrame(animateDropzoneBorder);
  }

  if (dropzoneBorder && !reduceMotion.matches) {
    window.requestAnimationFrame(animateDropzoneBorder);
  }

  function tick() {
    return new Promise(function (resolve) {
      window.requestAnimationFrame(resolve);
    });
  }

  function concatBytes() {
    var arrays = Array.prototype.slice.call(arguments);
    var length = arrays.reduce(function (total, item) {
      return total + item.length;
    }, 0);
    var output = new Uint8Array(length);
    var offset = 0;
    arrays.forEach(function (item) {
      output.set(item, offset);
      offset += item.length;
    });
    return output;
  }

  async function sha256(bytes) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("Este navegador no permite usar Web Crypto en este contexto.");
    }
    return new Uint8Array(await window.crypto.subtle.digest("SHA-256", bytes));
  }

  async function aesCbcDecryptNoPadding(ciphertext, key, iv) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("Este navegador no permite usar Web Crypto en este contexto.");
    }
    if (ciphertext.length === 0 || ciphertext.length % 16 !== 0 || iv.length !== 16) {
      throw new Error("Los bloques AES del respaldo no tienen un tamaño válido.");
    }

    var cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      key,
      { name: "AES-CBC" },
      false,
      ["encrypt", "decrypt"]
    );

    // Web Crypto retira PKCS#7 automáticamente. Huawei usa CBC sin padding,
    // así que añadimos un bloque sintético que descifra a 0x10 * 16. El
    // navegador quita únicamente ese bloque y nos devuelve el plaintext real.
    var lastCipherBlock = ciphertext.slice(ciphertext.length - 16);
    var syntheticPlain = new Uint8Array(16);
    for (var i = 0; i < 16; i += 1) {
      syntheticPlain[i] = lastCipherBlock[i] ^ 0x10;
    }

    var encryptedSynthetic = new Uint8Array(
      await window.crypto.subtle.encrypt(
        { name: "AES-CBC", iv: new Uint8Array(16) },
        cryptoKey,
        syntheticPlain
      )
    );
    var syntheticCipher = encryptedSynthetic.slice(0, 16);
    var extendedCiphertext = concatBytes(ciphertext, syntheticCipher);

    return new Uint8Array(
      await window.crypto.subtle.decrypt(
        { name: "AES-CBC", iv: iv },
        cryptoKey,
        extendedCiphertext
      )
    );
  }

  function hexToBytes(hex) {
    if (hex.length % 2 !== 0) {
      throw new Error("La clave hexadecimal tiene longitud inválida.");
    }
    var output = new Uint8Array(hex.length / 2);
    for (var i = 0; i < output.length; i += 1) {
      output[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return output;
  }

  function bytesEqual(left, right) {
    if (left.length !== right.length) {
      return false;
    }
    var difference = 0;
    for (var i = 0; i < left.length; i += 1) {
      difference |= left[i] ^ right[i];
    }
    return difference === 0;
  }

  function getAttribute(element, names) {
    var attributes = Array.prototype.slice.call(element.attributes || []);
    for (var i = 0; i < attributes.length; i += 1) {
      var attribute = attributes[i];
      for (var j = 0; j < names.length; j += 1) {
        if (attribute.name.toLowerCase() === names[j].toLowerCase()) {
          return attribute.value;
        }
      }
    }
    return "";
  }

  async function decryptHuaweiContainer(source) {
    if (source.length <= 8) {
      throw new Error("El archivo es demasiado corto para ser un respaldo Huawei.");
    }

    var payload = source.slice(8);
    if (payload.length % 16 !== 0 || payload.length < 48) {
      throw new Error("El respaldo no tiene el tamaño esperado.");
    }

    var iv = payload.slice(0, 16);
    var lastBytes = iv[15] & 0x0f;
    var cipherLength = payload.length - 16 - 32;
    var ciphertext = payload.slice(16, 16 + cipherLength);
    var expectedMac = payload.slice(16 + cipherLength);
    var digest = new Uint8Array(32);
    digest.set(iv.slice(0, 16), 0);

    for (var round = 0; round < 8192; round += 1) {
      digest = await sha256(concatBytes(digest, FILE_KEY_MATERIAL));
      if (round % 256 === 0) {
        await tick();
      }
    }

    var ipad = new Uint8Array(64);
    var opad = new Uint8Array(64);
    for (var index = 0; index < 64; index += 1) {
      ipad[index] = 0x36;
      opad[index] = 0x5c;
    }
    for (var keyIndex = 0; keyIndex < 32; keyIndex += 1) {
      ipad[keyIndex] ^= digest[keyIndex];
      opad[keyIndex] ^= digest[keyIndex];
    }

    var innerMac = await sha256(concatBytes(ipad, ciphertext));
    var actualMac = await sha256(concatBytes(opad, innerMac));
    if (!bytesEqual(actualMac, expectedMac)) {
      throw new Error("La autenticación falló. El archivo puede estar dañado o usar otro formato.");
    }

    var plainFull = await aesCbcDecryptNoPadding(ciphertext, digest, iv);
    var plainLength = lastBytes === 0 ? cipherLength : cipherLength - 16 + lastBytes;
    return plainFull.slice(0, plainLength);
  }

  async function inflateGzip(bytes) {
    if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) {
      return bytes;
    }
    if (!("DecompressionStream" in window)) {
      throw new Error("Este navegador no soporta descompresión gzip local.");
    }
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function decryptHuaweiString(encoded) {
    var value = encoded.trim();
    if (!(value.indexOf("$2") === 0 && value.charAt(value.length - 1) === "$")) {
      throw new Error("El valor de contraseña no usa el formato Huawei $2.");
    }

    var visible = value.slice(2, -1);
    var unvisible = new Uint8Array(visible.length);
    for (var i = 0; i < visible.length; i += 1) {
      var code = visible.charCodeAt(i);
      unvisible[i] = code === 0x7e ? 0x1e : code - 0x21;
    }

    if (unvisible.length % 5 !== 0) {
      throw new Error("El valor Huawei $2 tiene longitud inválida.");
    }

    var binary = new Uint8Array((unvisible.length / 5) * 4);
    for (var outputOffset = 0, inputOffset = 0; outputOffset < binary.length; outputOffset += 4, inputOffset += 5) {
      var number = 0;
      var multiplier = 1;
      for (var blockIndex = 0; blockIndex < 5; blockIndex += 1) {
        number += multiplier * unvisible[inputOffset + blockIndex];
        multiplier *= 0x5d;
      }
      for (var byteIndex = 0; byteIndex < 4; byteIndex += 1) {
        binary[outputOffset + byteIndex] = (number / Math.pow(2, 8 * byteIndex)) & 0xff;
      }
    }

    if (binary.length < 32 || (binary.length - 16) % 16 !== 0) {
      throw new Error("El valor Huawei $2 no contiene bloques AES válidos.");
    }

    var iv = binary.slice(binary.length - 16);
    var ciphertext = binary.slice(0, binary.length - 16);
    var plaintext = await aesCbcDecryptNoPadding(ciphertext, STRING_KEY, iv);
    return decoder.decode(plaintext).replace(/\u0000+$/g, "");
  }

  async function extractCredentials(xmlBytes) {
    var xml = decoder.decode(xmlBytes);
    var document = new DOMParser().parseFromString(xml, "application/xml");
    if (document.getElementsByTagName("parsererror").length > 0) {
      throw new Error("El contenido descifrado no es XML válido.");
    }

    var records = [];
    var seen = new Set();
    var nodes = Array.prototype.slice.call(document.querySelectorAll("*"));
    for (var nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
      var node = nodes[nodeIndex];
      var username = getAttribute(node, ["Username", "UserName"]);
      var encryptedPassword = getAttribute(node, ["Password", "Passphrase", "AuthPassword"]);
      if (!username || !encryptedPassword || !/@prodigyweb\.com\.mx$/i.test(username)) {
        continue;
      }
      if (encryptedPassword.indexOf("$2") !== 0) {
        continue;
      }

      var password = await decryptHuaweiString(encryptedPassword);
      var recordKey = username + "\u0000" + password;
      if (!seen.has(recordKey)) {
        seen.add(recordKey);
        records.push({ username: username, password: password });
      }
    }

    if (records.length === 0) {
      throw new Error("No se encontró una cuenta PPPoE @prodigyweb.com.mx en el XML.");
    }
    return records;
  }

  async function decodeFile(file) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("Este navegador no ofrece el motor Web Crypto necesario para procesar el respaldo localmente.");
    }

    var source = new Uint8Array(await file.arrayBuffer());
    await setStage("Validando respaldo", "01 / 04");
    var compressed = await decryptHuaweiContainer(source);
    await setStage("Abriendo configuración", "02 / 04");
    var xmlBytes = await inflateGzip(compressed);
    await setStage("Buscando conexión PPPoE", "03 / 04");
    var records = await extractCredentials(xmlBytes);
    await setStage("Preparando salida", "04 / 04");
    return records;
  }

  function setStage(label, step) {
    processingLabel.textContent = label;
    processingStep.textContent = step;
    return tick();
  }

  function formatBytes(bytes) {
    if (bytes < 1024) {
      return bytes + " B";
    }
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function maskSecret(value) {
    return Array(Math.min(14, Math.max(8, value.length))).fill("•").join("");
  }

  function renderCredentials(records) {
    credentialsList.innerHTML = records
      .map(function (record, index) {
        return (
          '<article class="credential-card" data-credential-index="' +
          index +
          '">' +
          '<div class="credential-heading">' +
          '<div class="credential-heading-main"><span class="credential-dot" aria-hidden="true"></span><h3>Credencial ' +
          String(index + 1).padStart(2, "0") +
          '</h3></div>' +
          '<button type="button" class="button-secondary credential-copy" data-copy-index="' +
          index +
          '"><span data-icon="copy" class="icon icon-sm" aria-hidden="true"></span>Copiar</button></div>' +
          '<dl class="credential-grid">' +
          '<div class="credential-field"><dt>Usuario PPPoE</dt><dd class="credential-value"><span class="value-text">' +
          escapeHtml(record.username) +
          '</span><button type="button" class="value-action" data-copy-index="' +
          index +
          '" data-copy-kind="username" aria-label="Copiar usuario"><span data-icon="copy" class="icon icon-sm" aria-hidden="true"></span></button></dd></div>' +
          '<div class="credential-field"><dt>Contraseña descifrada</dt><dd class="credential-value"><span class="value-text secret-value" data-secret-value="' +
          index +
          '">' +
          maskSecret(record.password) +
          '</span><div class="value-actions"><button type="button" class="value-action" data-toggle-index="' +
          index +
          '" aria-label="Mostrar contraseña" aria-pressed="false"><span data-icon="eye" class="icon icon-sm" aria-hidden="true"></span></button><button type="button" class="value-action" data-copy-index="' +
          index +
          '" data-copy-kind="password" aria-label="Copiar contraseña"><span data-icon="copy" class="icon icon-sm" aria-hidden="true"></span></button></div></dd></div>' +
          "</dl></article>"
        );
      })
      .join("");

    renderIcons(credentialsList);
  }

  function recordText(record) {
    return [
      "Usuario: " + record.username,
      "Contraseña: " + record.password,
    ].join("\n");
  }

  function exportText() {
    return state.records.map(recordText).join("\n\n") + "\n";
  }

  function showToast(message) {
    if (!toast || !toastMessage) {
      return;
    }
    toastMessage.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.remove("toast-in");
    void toast.offsetWidth;
    toast.classList.add("toast-in");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.add("hidden");
    }, 2200);
  }

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      var helper = document.createElement("textarea");
      helper.value = text;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }

    if (button) {
      button.classList.add("is-copied");
      window.setTimeout(function () {
        button.classList.remove("is-copied");
      }, 1200);
    }
    showToast("Copiado al portapapeles");
  }

  function downloadText() {
    var blob = new Blob([exportText()], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "telmexnt-pppoe-credentials.txt";
    link.click();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 400);
    showToast("Archivo TXT descargado");
  }

  function setBusy(value) {
    state.busy = value;
    dropzone.dataset.state = value ? "busy" : "";
    processingState.classList.toggle("hidden", !value);
    chooseButton.disabled = value;
    dropzone.setAttribute("aria-busy", String(value));
    document.body.dataset.state = value ? "busy" : "ready";
    statusText.textContent = value ? "procesando localmente" : "ejecución local";
  }

  function showError(error) {
    var message = error && error.message ? error.message : "No se pudo procesar el archivo.";
    dropzone.classList.remove("dropzone-hidden");
    errorMessage.textContent = message;
    errorState.classList.remove("hidden");
    document.body.dataset.state = "error";
    statusText.textContent = "revisión necesaria";
  }

  function showResults(records) {
    state.records = records;
    renderCredentials(records);
    uploadView.classList.add("hidden");
    resultsSection.classList.remove("hidden");
    resultsSection.classList.remove("result-enter");
    void resultsSection.offsetWidth;
    resultsSection.classList.add("result-enter");
    if (credentialsCount) {
      credentialsCount.textContent = records.length + (records.length === 1 ? " cuenta encontrada" : " cuentas encontradas");
    }
    document.body.dataset.state = "ready";
    statusText.textContent = records.length + (records.length === 1 ? " cuenta encontrada" : " cuentas encontradas");
  }

  async function handleFile(file) {
    if (state.busy || !file) {
      return;
    }
    errorState.classList.add("hidden");
    resultsSection.classList.add("hidden");
    if (!/\.xml$/i.test(file.name)) {
      showError(new Error("Selecciona una copia con extensión .xml."));
      return;
    }
    state.file = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);
    fileSelected.classList.remove("hidden");
    dropzone.classList.add("dropzone-hidden");
    setBusy(true);

    try {
      var records = await decodeFile(file);
      showResults(records);
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    state.busy = false;
    state.records = [];
    state.file = null;
    fileInput.value = "";
    fileSelected.classList.add("hidden");
    processingState.classList.add("hidden");
    errorState.classList.add("hidden");
    uploadView.classList.remove("hidden");
    resultsSection.classList.add("hidden");
    dropzone.classList.remove("dropzone-hidden");
    credentialsList.innerHTML = "";
    if (credentialsCount) {
      credentialsCount.textContent = "";
    }
    dropzone.dataset.state = "";
    document.body.dataset.state = "ready";
    statusText.textContent = "ejecución local";
  }

  chooseButton.addEventListener("click", function () {
    if (!state.busy) {
      fileInput.click();
    }
  });

  dropzone.addEventListener("click", function (event) {
    var target = event.target instanceof Element ? event.target : null;
    if (!state.busy && !(target && target.closest("button"))) {
      fileInput.click();
    }
  });

  dropzone.addEventListener("keydown", function (event) {
    var target = event.target instanceof Element ? event.target : null;
    if (target && target.closest("button")) {
      return;
    }
    if (!state.busy && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", function () {
    handleFile(fileInput.files && fileInput.files[0]);
  });

  dropzone.addEventListener("mouseenter", function () {
    dashMotion.targetSpeed = 0.6;
  });

  dropzone.addEventListener("mouseleave", function () {
    if (dropzone.dataset.state !== "dragging") {
      dashMotion.targetSpeed = 0.15;
    }
  });

  ["dragenter", "dragover"].forEach(function (eventName) {
    dropzone.addEventListener(eventName, function (event) {
      event.preventDefault();
      if (!state.busy) {
        dropzone.dataset.state = "dragging";
        dashMotion.targetSpeed = 0.8;
      }
    });
  });

  ["dragleave", "drop"].forEach(function (eventName) {
    dropzone.addEventListener(eventName, function (event) {
      event.preventDefault();
      if (!state.busy) {
        dropzone.dataset.state = "";
        dashMotion.targetSpeed = 0.15;
      }
    });
  });

  dropzone.addEventListener("drop", function (event) {
    if (!state.busy) {
      handleFile(event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]);
    }
  });

  credentialsList.addEventListener("click", function (event) {
    var target = event.target instanceof Element ? event.target : null;
    if (!target) {
      return;
    }

    var copyButton = target.closest("[data-copy-index]");
    if (copyButton) {
      var copyRecord = state.records[Number(copyButton.dataset.copyIndex)];
      if (copyRecord) {
        var copyKind = copyButton.getAttribute("data-copy-kind");
        var copyValue = copyKind === "username" ? copyRecord.username : copyKind === "password" ? copyRecord.password : recordText(copyRecord);
        copyText(copyValue, copyButton);
      }
      return;
    }

    var toggleButton = target.closest("[data-toggle-index]");
    if (toggleButton) {
      var index = Number(toggleButton.dataset.toggleIndex);
      var record = state.records[index];
      var secret = document.querySelector('[data-secret-value="' + index + '"]');
      var visible = toggleButton.getAttribute("aria-pressed") === "true";
      if (record && secret) {
        secret.textContent = visible ? maskSecret(record.password) : record.password;
        toggleButton.setAttribute("aria-pressed", String(!visible));
        toggleButton.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña");
        toggleButton.innerHTML = '<span data-icon="' + (visible ? "eye" : "eye-off") + '" class="icon icon-md" aria-hidden="true"></span>';
        renderIcons(toggleButton);
      }
    }
  });

  copyAllButton.addEventListener("click", function () {
    if (state.records.length > 0) {
      copyText(exportText(), copyAllButton);
    }
  });

  downloadButton.addEventListener("click", function () {
    if (state.records.length > 0) {
      downloadText();
    }
  });

  resetButton.addEventListener("click", reset);

  function openGuide() {
    if (!guideModal) {
      return;
    }
    window.clearTimeout(guideCloseTimer);
    guideModal.classList.remove("is-closing");
    guideReturnFocus = document.activeElement;
    guideModal.classList.remove("hidden");
    guideModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.requestAnimationFrame(function () {
      if (guideCloseButton) {
        guideCloseButton.focus();
      }
    });
  }

  function finishGuideClose() {
    if (!guideModal) {
      return;
    }
    guideModal.classList.add("hidden");
    guideModal.classList.remove("is-closing");
    guideModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (guideReturnFocus && typeof guideReturnFocus.focus === "function") {
      guideReturnFocus.focus();
    }
  }

  function closeGuide() {
    if (!guideModal || guideModal.classList.contains("hidden") || guideModal.classList.contains("is-closing")) {
      return;
    }
    if (reduceMotion.matches) {
      finishGuideClose();
      return;
    }

    guideModal.classList.add("is-closing");
    guideCloseTimer = window.setTimeout(finishGuideClose, 170);
  }

  if (guideButton) {
    guideButton.addEventListener("click", function (event) {
      event.stopPropagation();
      openGuide();
    });
  }

  if (guideModal) {
    guideModal.addEventListener("click", function (event) {
      var target = event.target instanceof Element ? event.target : null;
      if (target && target.closest("[data-guide-close]")) {
        closeGuide();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && guideModal && !guideModal.classList.contains("hidden")) {
      closeGuide();
    }
  });

  renderIcons(document);
})();
