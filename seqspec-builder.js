// Add these constants at the top of the file
const SVG_WIDTH = 800;
const REGION_HEIGHT = 30;
const ARROW_HEIGHT = 20;

// Update these constants
const SVG_HEIGHT = 280;
const MIN_REGION_WIDTH = 10;
const SCALE = 10;
const REGION_GAP = 3;

// Global state
let seqspec = {
  assay_info: {},
  modalities: [],
  library_spec: [],
  sequence_spec: [],
};

// DOM Elements
const templateSelect = document.getElementById("template-select");
const assayForm = document.getElementById("assay-form");
const modalityForm = document.getElementById("modality-form");
const modalitiesList = document.getElementById("modalities-list");
const regionForm = document.getElementById("region-form");
const regionsList = document.getElementById("regions-list");
const readForm = document.getElementById("read-form");
const readsList = document.getElementById("reads-list");
const downloadYamlButton = document.getElementById("download-yaml");
const clearStorageButton = document.getElementById("clear-storage");
const structureSvg = document.getElementById("structure-svg");
const assayInfoDisplay = document.getElementById("assay-info-display");

// Event Listeners
templateSelect.addEventListener("change", loadTemplate);
assayForm.addEventListener("change", updateAssayInfo);
modalityForm.addEventListener("submit", handleModalitySubmit);
regionForm.addEventListener("submit", handleRegionSubmit);
readForm.addEventListener("submit", handleReadSubmit);
downloadYamlButton.addEventListener("click", downloadYaml);
clearStorageButton.addEventListener("click", clearStorage);
// assayForm.addEventListener("submit", updateAssayInfo);

// Functions

function handleModalitySubmit(event) {
  event.preventDefault();
  const modalityName = document.getElementById("modality-name").value;
  if (modalityName && !seqspec.modalities.includes(modalityName)) {
    seqspec.modalities.push(modalityName);
    renderModalities();
    updateModalityDropdown();
    saveToLocalStorage();
    modalityForm.reset();
  }
  updateVisualization();
}

function renderModalities() {
  modalitiesList.innerHTML = "";
  seqspec.modalities.forEach((modality, index) => {
    const modalityDiv = document.createElement("div");
    modalityDiv.textContent = modality;
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.onclick = () => removeModality(index);
    modalityDiv.appendChild(removeButton);
    modalitiesList.appendChild(modalityDiv);
  });
}

function removeModality(index) {
  seqspec.modalities.splice(index, 1);
  renderModalities();
  updateModalityDropdown();
  saveToLocalStorage();
  updateVisualization();
}

function handleRegionSubmit(event) {
  event.preventDefault();
  const formData = new FormData(regionForm);
  const region = Object.fromEntries(formData.entries());
  region.min_len = parseInt(region.min_len);
  region.max_len = parseInt(region.max_len);
  seqspec.library_spec.push(region);
  renderLibraryStructure();
  updatePrimerDropdown();
  saveToLocalStorage();
  regionForm.reset();
  updateVisualization();
}

let html = "<h3>Assay Information</h3>";
html += "<table>";
for (const [key, value] of Object.entries(seqspec.assay_info)) {
  html += `<tr><th>${key}</th><td>${value}</td></tr>`;
}
html += "</table>";
assayInfoDisplay.innerHTML = html;

function renderLibraryStructure() {
  regionsList.innerHTML = "";
  seqspec.library_spec.forEach((region, index) => {
    const regionDiv = document.createElement("div");
    let tab = "<table>";
    for (const [key, value] of Object.entries(region)) {
      tab += `<tr><th>${key}</th><td>${value}</td></tr>`;
    }
    tab += "</table>";
    regionDiv.innerHTML = tab;
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.onclick = () => removeRegion(index);
    regionDiv.appendChild(removeButton);
    regionsList.appendChild(regionDiv);
  });
}

function removeRegion(index) {
  seqspec.library_spec.splice(index, 1);
  renderLibraryStructure();
  updatePrimerDropdown();
  saveToLocalStorage();
  updateVisualization();
}

function handleReadSubmit(event) {
  event.preventDefault();
  const formData = new FormData(readForm);
  const read = Object.fromEntries(formData.entries());
  read.min_len = parseInt(read.min_len);
  read.max_len = parseInt(read.max_len);
  seqspec.sequence_spec.push(read);
  renderReadStructure();
  saveToLocalStorage();
  readForm.reset();
  updateVisualization();
}

function renderReadStructure() {
  readsList.innerHTML = "";
  seqspec.sequence_spec.forEach((read, index) => {
    const readDiv = document.createElement("div");
    let tab = "<table>";
    for (const [key, value] of Object.entries(read)) {
      tab += `<tr><th>${key}</th><td>${value}</td></tr>`;
    }
    tab += "</table>";
    readDiv.innerHTML = tab;
    // readDiv.textContent = `${read.read_id} (${read.modality}): ${read.primer_id}`;
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.onclick = () => removeRead(index);
    readDiv.appendChild(removeButton);
    readsList.appendChild(readDiv);
  });
}

function removeRead(index) {
  seqspec.sequence_spec.splice(index, 1);
  renderReadStructure();
  saveToLocalStorage();
  updateVisualization();
}

function updateModalityDropdown() {
  const modalitySelect = document.getElementById("read-modality");
  modalitySelect.innerHTML = "";
  seqspec.modalities.forEach((modality) => {
    const option = document.createElement("option");
    option.value = modality;
    option.textContent = modality;
    modalitySelect.appendChild(option);
  });
}

function updatePrimerDropdown() {
  const primerSelect = document.getElementById("primer-id");
  primerSelect.innerHTML = "";
  seqspec.library_spec.forEach((region) => {
    const option = document.createElement("option");
    option.value = region.region_id;
    option.textContent = region.region_id;
    primerSelect.appendChild(option);
  });
}

function loadTemplate() {
  const selectedTemplate = templateSelect.value;
  if (selectedTemplate in templates) {
    seqspec = JSON.parse(JSON.stringify(templates[selectedTemplate])); // Deep copy
    renderAssayInfo();
    renderModalities();
    renderLibraryStructure();
    renderReadStructure();
    updateVisualization();
    saveToLocalStorage();
  } else {
    // Reset to blank state
    seqspec = {
      assay_info: {},
      modalities: [],
      library_spec: [],
      sequence_spec: [],
    };
    renderAssayInfo();
    renderModalities();
    renderLibraryStructure();
    renderReadStructure();
    updateVisualization();
  }
}

function updateAssayInfo(event) {
  event.preventDefault(); // Prevent form submission
  const formData = new FormData(assayForm);
  seqspec.assay_info = Object.fromEntries(formData.entries());
  renderAssayInfo();
  saveToLocalStorage();
}

function renderAssayInfo() {
  let html = "<h3>Assay Information</h3>";
  html += "<table>";
  for (const [key, value] of Object.entries(seqspec.assay_info)) {
    html += `<tr><th>${key.replace(/_/g, " ")}</th><td>${value}</td></tr>`;
  }
  html += "</table>";
  assayInfoDisplay.innerHTML = html;
}

function addModality() {
  const modality = prompt("Enter modality name:");
  if (modality) {
    seqspec.modalities.push(modality);
    renderModalities();
    saveToLocalStorage();
  }
}

function renderModalities() {
  modalitiesList.innerHTML = "";
  seqspec.modalities.forEach((modality, index) => {
    const modalityDiv = document.createElement("div");
    modalityDiv.textContent = modality;
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.onclick = () => removeModality(index);
    modalityDiv.appendChild(removeButton);
    modalitiesList.appendChild(modalityDiv);
  });
}

function removeModality(index) {
  seqspec.modalities.splice(index, 1);
  renderModalities();
  saveToLocalStorage();
  updateVisualization();
}

function addRegion(modalityIndex) {
  // Add new region to a specific modality
}

function addRead() {
  // Add new read to the seqspec
}

function updateVisualization() {
  const svg = document.getElementById("structure-svg");
  svg.innerHTML = ""; // Clear existing content

  let totalLength = seqspec.library_spec.reduce(
    (sum, region) => sum + region.max_len * MIN_REGION_WIDTH,
    0
  );
  let svgWidth = Math.max(
    totalLength + (seqspec.library_spec.length - 1) * REGION_GAP,
    800
  );

  svg.setAttribute("width", svgWidth);
  svg.setAttribute("height", SVG_HEIGHT);

  let xOffset = 0;
  const regionPositions = {};

  // Draw regions
  seqspec.library_spec.forEach((region, index) => {
    const regionWidth = region.max_len * MIN_REGION_WIDTH; //Math.max(region.max_len, MIN_REGION_WIDTH);
    const regionGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", xOffset);
    rect.setAttribute("y", SVG_HEIGHT / 2 - REGION_HEIGHT / 2);
    rect.setAttribute("width", regionWidth);
    rect.setAttribute("height", REGION_HEIGHT);
    rect.setAttribute("fill", getRegionColor(region.region_type));
    regionGroup.appendChild(rect);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", xOffset + regionWidth / 2);
    text.setAttribute("y", SVG_HEIGHT / 2 + REGION_HEIGHT / 2 + 15);
    text.setAttribute("text-anchor", "middle");
    text.textContent = region.region_id;
    regionGroup.appendChild(text);

    svg.appendChild(regionGroup);

    // Store region positions for arrow calculations
    regionPositions[region.region_id] = {
      start: xOffset,
      end: xOffset + regionWidth,
    };

    xOffset += regionWidth + REGION_GAP;
  });

  // Draw read arrows
  seqspec.sequence_spec.forEach((read, index) => {
    const primerRegion = seqspec.library_spec.find(
      (r) => r.region_id === read.primer_id
    );
    if (!primerRegion) return;

    const primerPos = regionPositions[read.primer_id];
    let startX, endX;
    const arrowLength = read.min_len * (svgWidth / totalLength) * SCALE; // Scale arrow length

    if (read.strand === "pos") {
      startX = primerPos.end;
      endX = startX + arrowLength;
    } else {
      endX = primerPos.start;
      startX = endX - arrowLength;
    }

    const arrow = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    const yOffset =
      read.strand === "pos" ? -ARROW_HEIGHT - 10 : REGION_HEIGHT + 10;
    const y = SVG_HEIGHT / 2 + yOffset;

    let arrowPath;
    if (read.strand === "pos") {
      arrowPath = `M ${startX},${y} L ${endX},${y} l -5,-5 m 5,5 l -5,5`;
    } else {
      arrowPath = `M ${startX},${y} L ${endX},${y} l 5,-5 m -5,5 l 5,5`;
    }

    arrow.setAttribute("d", arrowPath);
    arrow.setAttribute("stroke", "black");
    arrow.setAttribute("fill", "none");

    // Set the markers based on the read strand
    if (read.strand === "pos") {
      arrow.setAttribute("marker-end", "url(#arrowhead-right)");
      arrow.setAttribute("marker-start", "url(#dot)");
    } else if (read.strand === "neg") {
      arrow.setAttribute("marker-start", "url(#arrowhead-left)");
      arrow.setAttribute("marker-end", "url(#dot)");
    }

    svg.appendChild(arrow);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", (startX + endX) / 2);
    text.setAttribute("y", y + (read.strand === "pos" ? -5 : 15));
    text.setAttribute("text-anchor", "middle");
    text.textContent = read.read_id;
    svg.appendChild(text);
  });

  // Add arrowhead marker definitions
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  const markerRight = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "marker"
  );
  markerRight.setAttribute("id", "arrowhead-right");
  markerRight.setAttribute("markerWidth", "10");
  markerRight.setAttribute("markerHeight", "7");
  markerRight.setAttribute("refX", "9");
  markerRight.setAttribute("refY", "3.5");
  markerRight.setAttribute("orient", "auto");
  const polygonRight = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polygon"
  );
  polygonRight.setAttribute("points", "0 0, 10 3.5, 0 7");
  markerRight.appendChild(polygonRight);

  const markerLeft = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "marker"
  );
  markerLeft.setAttribute("id", "arrowhead-left");
  markerLeft.setAttribute("markerWidth", "10");
  markerLeft.setAttribute("markerHeight", "7");
  markerLeft.setAttribute("refX", "1");
  markerLeft.setAttribute("refY", "3.5");
  markerLeft.setAttribute("orient", "auto");
  const polygonLeft = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polygon"
  );
  polygonLeft.setAttribute("points", "10 0, 0 3.5, 10 7");
  markerLeft.appendChild(polygonLeft);

  const dotMarker = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "marker"
  );
  dotMarker.setAttribute("id", "dot");
  dotMarker.setAttribute("markerWidth", "4");
  dotMarker.setAttribute("markerHeight", "4");
  dotMarker.setAttribute("refX", "2");
  dotMarker.setAttribute("refY", "2");
  dotMarker.setAttribute("orient", "auto");
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", "2");
  circle.setAttribute("cy", "2");
  circle.setAttribute("r", "2");
  circle.setAttribute("fill", "black");
  dotMarker.appendChild(circle);

  defs.appendChild(markerRight);
  defs.appendChild(markerLeft);
  defs.appendChild(dotMarker);
  svg.appendChild(defs);
}

// Add this helper function to get colors for different region types
function getRegionColor(regionType) {
  const colorMap = {
    barcode: "#FFA07A",
    umi: "#98FB98",
    cdna: "#87CEFA",
    primer: "#DDA0DD",
  };
  return colorMap[regionType] || "#D3D3D3";
}

function downloadYaml() {
  const yamlString = jsyaml.dump(seqspec);
  const blob = new Blob([yamlString], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "seqspec.yaml";
  a.click();
  URL.revokeObjectURL(url);
}

function clearStorage() {
  localStorage.removeItem("seqspec");
  location.reload();
}

function saveToLocalStorage() {
  localStorage.setItem("seqspec", JSON.stringify(seqspec));
}

function loadFromLocalStorage() {
  const storedSeqspec = localStorage.getItem("seqspec");
  if (storedSeqspec) {
    seqspec = JSON.parse(storedSeqspec);
    renderAssayInfo();
    renderModalities();
    renderLibraryStructure();
    renderReadStructure();
    updateModalityDropdown();
    updatePrimerDropdown();
    updateVisualization();
  }
}

// Initialize
function init() {
  loadFromLocalStorage();
}

init();
