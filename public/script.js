const webroot = document.querySelector("meta[name='webroot']").content;
const I18N = window.__I18N__ || {};
const fileInput = document.querySelector('input[type="file"]');
const dropZone = document.getElementById("dropzone");
const convertButton = document.querySelector("button[type='submit']");
const fileList = document.querySelector("#file-list");
const fileNames = [];
let fileType;
let pendingFiles = 0;
let formatSelected = false;

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

const ICON_FILE =
  '<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M13 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V9L13 3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M13 3V9H19" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
const ICON_IMAGE =
  '<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><rect x="3.5" y="4.5" width="17" height="15" rx="2.6" stroke="currentColor" stroke-width="1.7"/><circle cx="8.6" cy="9.6" r="1.6" fill="currentColor"/><path d="M4 16.5L9 12L12.6 15.2L16 12.4L20 16.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const IMAGE_EXT = ["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff", "heic", "svg"];

const formatSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
};

const iconFor = (name) => {
  const ext = name.split(".").pop().toLowerCase();
  return IMAGE_EXT.includes(ext) ? ICON_IMAGE : ICON_FILE;
};

if (dropZone) {
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const files = e.dataTransfer?.files;

    if (!files || files.length === 0) {
      console.warn("No files dropped — likely a URL or unsupported source.");
      return;
    }

    for (const file of files) {
      console.log("Handling dropped file:", file.name);
      handleFile(file);
    }
  });
}

// Extracted handleFile function for reusability in drag-and-drop and file input
function handleFile(file) {
  const row = document.createElement("div");
  row.className = "file-row flex items-center gap-3";
  row.innerHTML = `
    <span class="file-icon shrink-0 text-ink-secondary">${iconFor(file.name)}</span>
    <span class="name min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">${escapeHtml(file.name)}</span>
    <span class="size shrink-0 text-xs text-muted"><progress max="100" class="inline-block h-1 w-24 appearance-none overflow-hidden rounded-full border-0 bg-soft bg-none text-accent accent-accent [&::-moz-progress-bar]:bg-accent [&::-webkit-progress-bar]:bg-soft [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-accent"></progress></span>
    <button type="button" class="remove grid size-[26px] shrink-0 place-items-center rounded-full bg-surface text-muted cursor-pointer transition-colors hover:bg-soft" title="${escapeHtml(I18N.remove || "Remove")}" onclick="deleteRow(this)">
      <svg viewBox="0 0 24 24" fill="none" width="11" height="11"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
    </button>
  `;

  if (!fileType) {
    fileType = file.name.split(".").pop();
    fileInput.setAttribute("accept", `.${fileType}`);
    setTitle();

    fetch(`${webroot}/conversions`, {
      method: "POST",
      body: JSON.stringify({ fileType }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.text())
      .then((html) => {
        selectContainer.innerHTML = html;
        updateSearchBar();
      })
      .catch(console.error);
  }

  fileList.appendChild(row);
  file.htmlRow = row;
  fileNames.push(file.name);
  uploadFile(file);
}

const selectContainer = document.querySelector("form .select_container");

const updateSearchBar = () => {
  const convertToInput = document.querySelector("input[name='convert_to_search']");
  const convertToPopup = document.querySelector(".convert_to_popup");
  const convertToGroupElements = document.querySelectorAll(".convert_to_group");
  const convertToGroups = {};
  const convertToElement = document.querySelector("select[name='convert_to']");

  if (!convertToInput || !convertToPopup || !convertToElement) {
    return;
  }

  const showMatching = (search) => {
    for (const [targets, groupElement] of Object.values(convertToGroups)) {
      let matchingTargetsFound = 0;
      for (const target of targets) {
        if (target.dataset.target.toLowerCase().includes(search)) {
          matchingTargetsFound++;
          target.classList.remove("hidden");
          target.classList.add("flex");
        } else {
          target.classList.add("hidden");
          target.classList.remove("flex");
        }
      }

      if (matchingTargetsFound === 0) {
        groupElement.classList.add("hidden");
        groupElement.classList.remove("flex");
      } else {
        groupElement.classList.remove("hidden");
        groupElement.classList.add("flex");
      }
    }
  };

  for (const groupElement of convertToGroupElements) {
    const groupName = groupElement.dataset.converter;

    const targetElements = groupElement.querySelectorAll(".target");
    const targets = Array.from(targetElements);

    for (const target of targets) {
      target.onmousedown = () => {
        convertToElement.value = target.dataset.value;
        convertToInput.value = (I18N.usingFormat || "{target} using {converter}")
          .replace("{target}", target.dataset.target)
          .replace("{converter}", target.dataset.converter);
        formatSelected = true;
        if (pendingFiles === 0 && fileNames.length > 0) {
          convertButton.disabled = false;
        }
        showMatching("");
      };
    }

    convertToGroups[groupName] = [targets, groupElement];
  }

  convertToInput.addEventListener("input", (e) => {
    showMatching(e.target.value.toLowerCase());
  });

  convertToInput.addEventListener("search", () => {
    // when the user clears the search bar using the 'x' button
    convertButton.disabled = true;
    formatSelected = false;
  });

  convertToInput.addEventListener("blur", (e) => {
    // Keep the popup open even when clicking on a target button
    // for a split second to allow the click to go through
    if (e?.relatedTarget?.classList?.contains("target")) {
      convertToPopup.classList.add("hidden");
      convertToPopup.classList.remove("flex");
      return;
    }

    convertToPopup.classList.add("hidden");
    convertToPopup.classList.remove("flex");
  });

  convertToInput.addEventListener("focus", () => {
    convertToPopup.classList.remove("hidden");
    convertToPopup.classList.add("flex");
  });
};

// Add a 'change' event listener to the file input element
if (fileInput) {
  fileInput.addEventListener("change", (e) => {
    const files = e.target.files;
    for (const file of files) {
      handleFile(file);
    }
    fileInput.value = "";
  });
}

const setTitle = () => {
  const title = document.querySelector("h1");
  if (!title) return;
  const baseTitle = I18N.convertTitle || "Convert";
  title.textContent = fileType ? `${baseTitle} .${fileType}` : baseTitle;
};

// Add a onclick for the delete button
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const deleteRow = (target) => {
  const row = target.closest(".file-row");
  if (!row) return;

  const filename = row.querySelector(".name")?.textContent ?? "";
  row.remove();

  // remove from fileNames
  const index = fileNames.indexOf(filename);
  if (index > -1) {
    fileNames.splice(index, 1);
  }

  // reset fileInput
  if (fileInput) fileInput.value = "";

  // if fileNames is empty, reset fileType
  if (fileNames.length === 0) {
    fileType = null;
    fileInput.removeAttribute("accept");
    convertButton.disabled = true;
    setTitle();
  }

  fetch(`${webroot}/delete`, {
    method: "POST",
    body: JSON.stringify({ filename: filename }),
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((err) => console.log(err));
};

const uploadFile = (file) => {
  convertButton.disabled = true;
  convertButton.textContent = I18N.uploading || "Uploading...";
  pendingFiles += 1;

  const formData = new FormData();
  formData.append("file", file, file.name);

  let xhr = new XMLHttpRequest();

  xhr.open("POST", `${webroot}/upload`, true);

  xhr.onload = () => {
    let data = JSON.parse(xhr.responseText);

    pendingFiles -= 1;
    if (pendingFiles === 0) {
      if (formatSelected) {
        convertButton.disabled = false;
      }
      convertButton.textContent = I18N.convert || "Convert";
    }

    // 上传完成：把进度条换成文件大小
    const sizeCell = file.htmlRow.querySelector(".size");
    if (sizeCell) {
      sizeCell.textContent = formatSize(file.size);
    }
    console.log(data);
  };

  xhr.upload.onprogress = (e) => {
    let sent = e.loaded;
    let total = e.total;
    console.log(`upload progress (${file.name}):`, (100 * sent) / total);

    let progressbar = file.htmlRow.getElementsByTagName("progress");
    if (progressbar[0]) {
      progressbar[0].value = (100 * sent) / total;
    }
  };

  xhr.onerror = (e) => {
    console.log(e);
  };

  xhr.send(formData);
};

const formConvert = document.querySelector(`form[action='${webroot}/convert']`);

formConvert?.addEventListener("submit", () => {
  const hiddenInput = document.querySelector("input[name='file_names']");
  hiddenInput.value = JSON.stringify(fileNames);
});

updateSearchBar();
