document.addEventListener('DOMContentLoaded', async () => {

  let growthTimes = {};
  let tableData = {};
  let showAll = false;
  let lastRows = [];
  let lastDiffRows = [];

  // -----------------------------
  // Load JSON data
  // -----------------------------
  async function loadData() {
    const response = await fetch('data.json');
    const data = await response.json();

    growthTimes = data.growthTimes;
    tableData = data.fluorescence;

    const bac1 = document.getElementById('bacteria1');
    const bac2 = document.getElementById('bacteria2');
    const bacteriaList = Object.keys(tableData);

    bacteriaList.forEach(bac => {
      bac1.add(new Option(bac, bac));
      bac2.add(new Option(bac, bac));
    });
  }

  // -----------------------------
  // Build prediction input boxes
  // -----------------------------
  function buildPredictionInputs() {
    const container = document.getElementById('predictInputs');
    container.innerHTML = "";

    const firstSpecies = Object.keys(tableData)[0];
    const drugs = Object.keys(tableData[firstSpecies]);

    drugs.forEach(drug => {
      const row = document.createElement('div');
      row.style.marginBottom = "8px";

      row.innerHTML = `
        <label>${drug}:
          <input type="number" step="0.01" id="predict_${drug}" style="width:120px;">
        </label>
      `;

      container.appendChild(row);
    });
  }

  // -----------------------------
  // Convert minutes → H:MM
  // -----------------------------
  function formatHM(minutes) {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h}h ${m.toString().padStart(2, "0")}m`;
  }

  // -----------------------------
  // Build table rows + highlighting
  // -----------------------------
  function buildRows(b1, b2) {
    const drugs = Object.keys(tableData[b1]);

    const rows = drugs.map(drug => {
      const v1 = Number(tableData[b1][drug]);
      const v2 = Number(tableData[b2][drug]);

      const maxVal = Math.max(v1, v2);
      const minVal = Math.min(v1, v2);

      const foldChange = minVal === 0 ? Infinity : maxVal / minVal;

      const lowThreshold = 1.45;
      const highThreshold = 2.2;

      const hardHighlight =
        (v1 < lowThreshold && v2 > highThreshold) ||
        (v2 < lowThreshold && v1 > highThreshold);

      const highlight = (foldChange >= 3 || hardHighlight) ? "highlight" : "";

      return { drug, v1, v2, foldChange, highlight };
    });

    const diffRows = rows.filter(r => r.highlight === "highlight");

    return { rows, diffRows };
  }

  // -----------------------------
  // Render comparison table
  // -----------------------------
  function renderTable(b1, b2) {
    const resultDiv = document.getElementById('result');
    const toggleBtn = document.getElementById('toggle');

    let html = "";

    const gt1 = growthTimes[b1];
    const gt2 = growthTimes[b2];

    html += `
      <p><strong>Recommended individual growth times:</strong> 
        <em>${b1}</em> = ${formatHM(gt1)}, 
        <em>${b2}</em> = ${formatHM(gt2)}
      </p>
    `;

    const shorter = Math.min(gt1, gt2);
    const average = (gt1 + gt2) / 2;
    const coCulture = Math.min(2 * shorter, average);

    html += `
      <p><strong>Calculated co-culture growth time:</strong> ${formatHM(coCulture)}</p>
    `;

    if (lastDiffRows.length === 0) {
      html += `<p><strong>This set of compounds likely cannot distinguish these species.</strong></p>`;
    }

    const rowsToShow = showAll ? lastRows : lastDiffRows;

    html += `
      <table>
        <tr>
          <th>FDAA</th>
          <th>Relative labeling of <em>${b1}</em></th>
          <th>Relative labeling of <em>${b2}</em></th>
        </tr>
    `;

    rowsToShow.forEach(r => {
      html += `
        <tr class="${r.highlight}">
          <td>${r.drug}</td>
          <td>${r.v1}</td>
          <td>${r.v2}</td>
        </tr>
      `;
    });

    html += `</table>`;
    resultDiv.innerHTML = html;

    toggleBtn.textContent = showAll ? "Show only differences" : "Show all compounds";
  }

  // -----------------------------
  // Compare button
  // -----------------------------
  document.getElementById('submit').addEventListener('click', () => {
    const b1 = document.getElementById('bacteria1').value;
    const b2 = document.getElementById('bacteria2').value;
    const warning = document.getElementById('warning');

    if (b1 === b2) {
      warning.textContent = "Warning: You cannot compare a species to itself.";
      return;
    }

    warning.textContent = "";

    const { rows, diffRows } = buildRows(b1, b2);
    lastRows = rows;
    lastDiffRows = diffRows;

    showAll = false;
    renderTable(b1, b2);
  });

  // -----------------------------
  // Toggle button
  // -----------------------------
  document.getElementById('toggle').addEventListener('click', () => {
    const b1 = document.getElementById('bacteria1').value;
    const b2 = document.getElementById('bacteria2').value;

    showAll = !showAll;
    renderTable(b1, b2);
  });

  // -----------------------------
  // Species prediction engine
  // -----------------------------
  function predictSpecies(bindingValues) {
    const speciesList = Object.keys(tableData);
    let bestSpecies = null;
    let bestScore = Infinity;

    speciesList.forEach(species => {
      const speciesValues = Object.values(tableData[species]).map(Number);

      let sumSq = 0;
      let count = 0;

      for (let i = 0; i < speciesValues.length; i++) {
        if (bindingValues[i] === null) continue;

        const diff = bindingValues[i] - speciesValues[i];
        sumSq += diff * diff;
        count++;
      }

      if (count === 0) return;

      const distance = Math.sqrt(sumSq / count);

      if (distance < bestScore) {
        bestScore = distance;
        bestSpecies = species;
      }
    });

    return bestSpecies;
  }

  // -----------------------------
  // Prediction button
  // -----------------------------
  document.getElementById('predictBtn').addEventListener('click', () => {
    const speciesList = Object.keys(tableData);
    const firstSpecies = speciesList[0];
    const drugs = Object.keys(tableData[firstSpecies]);

    const values = drugs.map(drug => {
      const val = document.getElementById(`predict_${drug}`).value.trim();
      return val === "" ? null : Number(val);
    });

    if (values.every(v => v === null)) {
      document.getElementById('predictionResult').textContent =
        "Please enter at least one binding value.";
      return;
    }

    const species = predictSpecies(values);

    document.getElementById('predictionResult').innerHTML =
      `Closest match: <em>${species}</em>`;
  });

  // -----------------------------
  // Initialize
  // -----------------------------
  await loadData();
  buildPredictionInputs();

});
