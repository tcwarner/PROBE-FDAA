let tableData = {};

async function loadData() {
  const response = await fetch('data.json');
  tableData = await response.json();
}

document.getElementById('submit').addEventListener('click', () => {
  const opt1 = document.getElementById('opt1').value;
  const opt2 = document.getElementById('opt2').value;

  const result = tableData?.[opt1]?.[opt2] ?? "No match found.";

  document.getElementById('result').textContent = result;
});

// Load data on page load
loadData();
