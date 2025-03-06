// Color code mappings
const colorCodes = {
  black: { value: 0, multiplier: 1, tolerance: null },
  brown: { value: 1, multiplier: 10, tolerance: 1 },
  red: { value: 2, multiplier: 100, tolerance: 2 },
  orange: { value: 3, multiplier: 1000, tolerance: null },
  yellow: { value: 4, multiplier: 10000, tolerance: null },
  green: { value: 5, multiplier: 100000, tolerance: 0.5 },
  blue: { value: 6, multiplier: 1000000, tolerance: 0.25 },
  violet: { value: 7, multiplier: 10000000, tolerance: 0.1 },
  gray: { value: 8, multiplier: 100000000, tolerance: 0.05 },
  white: { value: 9, multiplier: 1000000000, tolerance: null },
  gold: { value: null, multiplier: 0.1, tolerance: 5 },
  silver: { value: null, multiplier: 0.01, tolerance: 10 },
};

// Band options
const bandTypes = [
  { id: 'band1-select', type: 'digit', label: 'Band 1 (1st Digit)' },
  { id: 'band2-select', type: 'digit', label: 'Band 2 (2nd Digit)' },
  { id: 'band3-select', type: 'digit', label: 'Band 3 (3rd Digit)' },
  { id: 'band4-select', type: 'multiplier', label: 'Band 4 (Multiplier)' },
  { id: 'band5-select', type: 'tolerance', label: 'Band 5 (Tolerance)' },
  { id: 'band6-select', type: 'temp-coefficient', label: 'Band 6 (Temp Coefficient)' },
];

// Generate dropdowns for bands
function generateBandDropdowns(numBands) {
  const controls = document.querySelector('.controls');
  controls.innerHTML = ''; // Clear existing dropdowns

  for (let i = 0; i < numBands; i++) {
    const band = bandTypes[i];
    const label = document.createElement('label');
    label.setAttribute('for', band.id);
    label.textContent = band.label;

    const select = document.createElement('select');
    select.id = band.id;

    for (const [color, data] of Object.entries(colorCodes)) {
      if (
        (band.type === 'digit' && data.value !== null) ||
        (band.type === 'multiplier' && data.multiplier !== null) ||
        (band.type === 'tolerance' && data.tolerance !== null) ||
        (band.type === 'temp-coefficient' && data.tempCoefficient !== null)
      ) {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = color.charAt(0).toUpperCase() + color.slice(1);
        select.appendChild(option);
      }
    }

    controls.appendChild(label);
    controls.appendChild(select);
  }

  // Add event listeners to new dropdowns
  for (let i = 0; i < numBands; i++) {
    document.getElementById(bandTypes[i].id).addEventListener('change', updateResistor);
  }
}

// Convert resistance value to appropriate unit (Ω, KΩ, MΩ)
function formatResistance(value) {
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)} MΩ`; // Mega-ohms
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)} KΩ`; // Kilo-ohms
  } else {
    return `${value.toFixed(2)} Ω`; // Ohms
  }
}

// Update resistor bands and calculate resistance
function updateResistor() {
  const numBands = parseInt(document.getElementById('num-bands').value);
  const bands = [];

  for (let i = 1; i <= numBands; i++) {
    const bandColor = document.getElementById(`band${i}-select`).value;
    bands.push(bandColor);
    document.getElementById(`band${i}`).style.backgroundColor = bandColor;
    document.getElementById(`band${i}`).style.display = 'block';
  }

  // Hide unused bands
  for (let i = numBands + 1; i <= 6; i++) {
    document.getElementById(`band${i}`).style.display = 'none';
  }

  // Calculate resistance value
  let resistance = 0;
  let tolerance = 0;

  if (numBands === 4) {
    const digit1 = colorCodes[bands[0]].value;
    const digit2 = colorCodes[bands[1]].value;
    const multiplier = colorCodes[bands[2]].multiplier;
    tolerance = colorCodes[bands[3]].tolerance;
    resistance = (digit1 * 10 + digit2) * multiplier;
  } else if (numBands === 5) {
    const digit1 = colorCodes[bands[0]].value;
    const digit2 = colorCodes[bands[1]].value;
    const digit3 = colorCodes[bands[2]].value;
    const multiplier = colorCodes[bands[3]].multiplier;
    tolerance = colorCodes[bands[4]].tolerance;
    resistance = (digit1 * 100 + digit2 * 10 + digit3) * multiplier;
  } else if (numBands === 6) {
    const digit1 = colorCodes[bands[0]].value;
    const digit2 = colorCodes[bands[1]].value;
    const digit3 = colorCodes[bands[2]].value;
    const multiplier = colorCodes[bands[3]].multiplier;
    tolerance = colorCodes[bands[4]].tolerance;
    resistance = (digit1 * 100 + digit2 * 10 + digit3) * multiplier;
  }

  // Format resistance value
  const formattedResistance = formatResistance(resistance);

  // Update display
  document.getElementById('resistance-value').textContent = `${resistance.toLocaleString()} Ω (${formattedResistance})`;
  document.getElementById('tolerance-value').textContent = tolerance;
}

// Reverse calculator: Generate color code from resistor value
function generateColorCode() {
  const resistorValue = parseFloat(document.getElementById('resistor-value').value);
  const resistorUnit = document.getElementById('resistor-unit').value;

  // Convert input value to ohms
  let valueInOhms = resistorValue;
  if (resistorUnit === 'kΩ') {
    valueInOhms *= 1e3;
  } else if (resistorUnit === 'MΩ') {
    valueInOhms *= 1e6;
  }

  // Determine the number of bands
  const numBands = parseInt(document.getElementById('num-bands').value);

  // Extract digits and multiplier
  let digits = [];
  let multiplier = 1;

  if (numBands === 4) {
    digits = [Math.floor(valueInOhms / 10), Math.floor(valueInOhms % 10)];
    multiplier = valueInOhms / (digits[0] * 10 + digits[1]);
  } else if (numBands === 5) {
    digits = [Math.floor(valueInOhms / 100), Math.floor((valueInOhms % 100) / 10), Math.floor(valueInOhms % 10)];
    multiplier = valueInOhms / (digits[0] * 100 + digits[1] * 10 + digits[2]);
  } else if (numBands === 6) {
    digits = [Math.floor(valueInOhms / 100), Math.floor((valueInOhms % 100) / 10), Math.floor(valueInOhms % 10)];
    multiplier = valueInOhms / (digits[0] * 100 + digits[1] * 10 + digits[2]);
  }

  // Find the closest multiplier in the colorCodes
  const multiplierColors = Object.entries(colorCodes).filter(([_, data]) => data.multiplier !== null);
  const closestMultiplier = multiplierColors.reduce((prev, curr) => {
    return Math.abs(curr[1].multiplier - multiplier) < Math.abs(prev[1].multiplier - multiplier) ? curr : prev;
  });

  // Set band colors
  for (let i = 0; i < digits.length; i++) {
    const color = Object.keys(colorCodes).find((key) => colorCodes[key].value === digits[i]);
    document.getElementById(`reverse-band${i + 1}`).style.backgroundColor = color;
    document.getElementById(`reverse-band${i + 1}`).style.display = 'block';
  }

  // Set multiplier band
  document.getElementById(`reverse-band${digits.length + 1}`).style.backgroundColor = closestMultiplier[0];
  document.getElementById(`reverse-band${digits.length + 1}`).style.display = 'block';

  // Set tolerance band (default to gold for 4-band, silver for 5/6-band)
  const toleranceColor = numBands === 4 ? 'gold' : 'silver';
  document.getElementById(`reverse-band${digits.length + 2}`).style.backgroundColor = toleranceColor;
  document.getElementById(`reverse-band${digits.length + 2}`).style.display = 'block';

  // Hide unused bands
  for (let i = digits.length + 3; i <= 6; i++) {
    document.getElementById(`reverse-band${i}`).style.display = 'none';
  }

  // Update display
  updateResistor();
}

// Initialize
document.getElementById('num-bands').addEventListener('change', () => {
  const numBands = parseInt(document.getElementById('num-bands').value);
  generateBandDropdowns(numBands);
  updateResistor();
});

// Generate initial dropdowns for 4 bands
generateBandDropdowns(4);
updateResistor();

// Add event listener for reverse calculator button
document.getElementById('generate-colors').addEventListener('click', generateColorCode);