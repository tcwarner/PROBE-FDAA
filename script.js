document.addEventListener('DOMContentLoaded', () => {
  let tableData = {};
  let showAll = false; // toggle state

  async function loadData() {
    try {
      const response = await fetch('data.json');
      tableData = await response.json();
    } catch (err) {
      console.error("Error loading JSON:", err);
      return;
    }

    const bac1 = document.getElementById('bacteria1');
    const bac2 = document.getElementById('bacteria2');

    const bacteriaList = Object.keys(tableData);

    bacteriaList.forEach(bac => {
      const opt1 = document.createElement('option');
      opt1.value = bac;
      opt1.textContent = bac;
      bac1.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = bac;
      opt2.textContent = bac;
      bac2.appendChild(opt2);
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

  function renderTable() {
    const b1 = document.getElementById('bacteria1').value;
    const b2 = document.getElementById('bacteria2').value;

    if (!b1 || !b2) return;

    const drugs = Object.keys(tableData[b1]);

    let rows = [];

    drugs.forEach(drug => {
      const v1 = Number(tableData[b1][drug]);
      const v2 = Number(tableData[b2][drug]);
      const diff = Math.abs(v1 - v2);

      const highlight = diff > 1 ? 'highlight' : '';

      rows.push({
        drug,
        v1,
        v2,
        diff,
        highlight
      });
    });

    // Filter to only differences unless toggled
    const filteredRows = showAll ? rows : rows.filter(r => r.diff > 1);

    let html = "";

    if (filteredRows.length === 0) {
      html = `<p>No differential incorporation found.</p>`;
    } else {
      html = `
        <table>
          <tr>
            <th>Drug</th>
            <th>${b1}</th>
            <th>${b2}</th>
          </tr>
      `;

      filteredRows.forEach(r => {
        html += `
          <tr class="${r.highlight}">
            <td>${r.drug}</td>
            <td>${r.v1}</td>
            <td>${r.v2}</td>
          </tr>
        `;
      });

      html += `</table>`;
    }

    document.getElementById('result').innerHTML = html;
  }

  document.getElementById('submit').addEventListener('click', () => {
    showAll = false; // reset to differences-only
    document.getElementById('toggle').textContent = "Show all compounds";
    renderTable();
  });

  document.getElementById('toggle').addEventListener('click', () => {
    showAll = !showAll;
    document.getElementById('toggle').textContent =
      showAll ? "Show only differences" : "Show all compounds";
    renderTable();
  });

  loadData();
});
