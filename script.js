let tableData = {};

async function loadData() {
  const response = await fetch('data.json');
  tableData = await response.json();

  const bacteriaSelect = document.getElementById('bacteria');
  const drugSelect = document.getElementById('drug');

  // Populate bacteria dropdown
  Object.keys(tableData).forEach(bac => {
    const option = document.createElement('option');
    option.value = bac;
    option.textContent = bac.replace(/_/g, ' ');
    bacteriaSelect.appendChild(option);
  });

  // When bacteria changes, update drug dropdown
  bacteriaSelect.addEventListener('change', () => {
    const selected = bacteriaSelect.value;
    const drugs = Object.keys(tableData[selected]);

    drugSelect.innerHTML = ''; // clear old options

    drugs.forEach(drug => {
      const option = document.createElement('option');
      option.value = drug;
      option.textContent = drug;
      drugSelect.appendChild(option);
    });
  });

  // Trigger initial population
  bacteriaSelect.dispatchEvent(new Event('change'));
}

document.getElementById('submit').addEventListener('click', () => {
  const bac = document.getElementById('bacteria').value;
  const drug = document.getElementById('drug').value;

  const result = tableData?.[bac]?.[drug] ?? "No data found.";
  document.getElementById('result').textContent = result;
});

loadData();
