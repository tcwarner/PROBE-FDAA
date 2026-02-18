document.addEventListener('DOMContentLoaded', () => {
  let tableData = {};
  let showAll = false;
  let lastRows = [];
  let lastDiffRows = [];

  async function loadData() {
    const response = await fetch('data.json');
    tableData = await response.json();

    const bac1 = document.getElementById('bacteria1');
    const bac2 = document.getElementById('bacteria2');
    const bacteriaList = Object.keys(tableData);

    bacteriaList.forEach(bac => {
      bac1.add(new Option(bac, bac));
      bac2.add(new Option(bac, bac));
    });

    // Prevent selecting the same species twice
    bac1.addEventListener('change', () => {
      if (bac1.value === bac2.value) {
        bac2.selectedIndex = (bac2.selectedIndex + 1) % bac2.options.length;
      }
    });

    bac2.addEventListener('change', () => {
      if (bac2.value === bac1.value) {
        bac1.selectedIndex = (bac1.selectedIndex + 1) % bac1.options.length;
      }
    });
  }

  function buildRows(b1, b2) {
    const drugs = Object.keys(tableData[b1]);

    const rows = drugs.map(drug => {
      const v1 = Number(tableData[b1][drug]);
      const v2 = Number(tableData[b2][drug]);
      const diff = Math.abs(v1 - v2);

      return {
        drug,
        v1,
        v2,
        diff,
        highlight: diff > 1 ? "highlight" : ""
      };
    });

    const diffRows = rows.filter(r => r.diff > 1);
    return { rows, diffRows };
  }

  function renderTable(b1, b2) {
    const resultDiv = document.getElementById('result');
    const toggleBtn = document.getElementById('toggle');

    let html = "";

    // If no differences exist, show message AND table
    if (lastDiffRows.length === 0) {
      html += `<p><strong>This set of compounds likely cannot distinguish these species.</strong></p>`;
    }

    const rowsToShow = showAll ? lastRows : lastDiffRows;

    html += `
      <table>
        <tr>
          <th>FDAA</th>
          <th>${b1} Incorporation</th>
          <th>${b2} Incorporation</th>
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

    // Update toggle button
    toggleBtn.style.display = "inline-block";
    toggleBtn.textContent = showAll ? "Show only differences" : "Show all compounds";
  }

  document.getElementById('submit').addEventListener('click', () => {
    const b1 = document.getElementById('bacteria1').value;
    const b2 = document.getElementById('bacteria2').value;

    const { rows, diffRows } = buildRows(b1, b2);
    lastRows = rows;
    lastDiffRows = diffRows;

    showAll = false; // default to differences-only
    renderTable(b1, b2);
  });

  document.getElementById('toggle').addEventListener('click', () => {
    const b1 = document.getElementById('bacteria1').value;
    const b2 = document.getElementById('bacteria2').value;

    showAll = !showAll;
    renderTable(b1, b2);
  });

  loadData();
});
