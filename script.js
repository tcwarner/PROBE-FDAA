document.addEventListener('DOMContentLoaded', () => {
  let tableData = {};

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
  }

  document.getElementById('submit').addEventListener('click', () => {
    const b1 = document.getElementById('bacteria1').value;
    const b2 = document.getElementById('bacteria2').value;

    if (!b1 || !b2) return;

    const drugs = Object.keys(tableData[b1]);

    let html = `
      <table>
        <tr>
          <th>Drug</th>
          <th>${b1}</th>
          <th>${b2}</th>
        </tr>
    `;

    drugs.forEach(drug => {
      const v1 = Number(tableData[b1][drug]);
      const v2 = Number(tableData[b2][drug]);
      const diff = Math.abs(v1 - v2);
      const highlight = diff > 1 ? 'highlight' : '';

      html += `
        <tr class="${highlight}">
          <td>${drug}</td>
          <td>${v1}</td>
          <td>${v2}</td>
        </tr>
      `;
    });

    html += `</table>`;
    document.getElementById('result').innerHTML = html;
  });

  loadData();
});
