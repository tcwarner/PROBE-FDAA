let tableData = {};

async function loadData() {
  const response = await fetch('data.json');
  tableData = await response.json();

  const bac1 = document.getElementById('bacteria1');
  const bac2 = document.getElementById('bacteria2');
  const drugSelect = document.getElementById('drug');

  const bacteriaList = Object.keys(tableData);

  // Populate bacteria dropdowns
  bacteriaList.forEach(bac => {
    const opt1 = document.createElement('option');
    opt1.value = bac;
    opt1.textContent = bac.replace(/_/g, ' ');
    bac1.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = bac;
    opt2.textContent = bac.replace(/_/g, ' ');
    bac2.appendChild(opt2);
  });

  // Populate drug dropdown based on first bacterium
  function updateDrugList() {
    const selected = bac1.value;
    const drugs = Object.keys(tableData[selected]);

    drugSelect.innerHTML = '';

    drugs.forEach(drug => {
      const option = document.createElement('option');
      option.value = drug;
      option.textContent = drug;
      drugSelect.appendChild(option);
    });
  }

  bac1.addEventListener('change', updateDrugList);

  // Trigger initial drug population
  updateDrugList();
}

document.getElementById('submit').addEventListener('click', () => {
  const b1 = document.getElementById('bacteria1').value;
  const b2 = document.getElementById('bacteria2').value;
  const drug = document.getElementById('drug').value;

  const bind1 = tableData?.[b1]?.[drug] ?? "No data";
  const bind2 = tableData?.[b2]?.[drug] ?? "No data";

  document.getElementById('result').innerHTML = `
    <strong>${b1.replace(/_/g, ' ')}:</strong> ${bind1}<br>
    <strong>${b2.replace(/_/g, ' ')}:</strong> ${bind2}
  `;
});

loadData();
