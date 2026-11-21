const tools = {
  sip: {
    title: 'SIP calculator',
    kicker: 'MONTHLY INVESTING',
    symbol: '↗',
    description: 'Estimate the future value of regular monthly contributions.',
    assumption: 'Assumes the annual rate divided by 12 is applied monthly, with each contribution added at month-end.',
    fields: [
      { id: 'monthly', label: 'Monthly investment', value: 5000, min: 0.01, max: 100000000, step: 'any', hint: 'Your contribution each month' },
      { id: 'rate', label: 'Expected annual return (%)', value: 12, min: -100, max: 100, step: 'any', hint: 'An assumption, not a guarantee' },
      { id: 'years', label: 'Investment period (years)', value: 10, min: 1, max: 80, step: 1, hint: 'How many years you invest' },
      { id: 'adjustInflation', label: 'Adjust for inflation?', type: 'select', value: 'no', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }], hint: 'Choose Yes to enter an inflation assumption' },
      { id: 'inflation', label: 'Annual inflation rate (%)', value: '', min: 0, max: 100, step: 'any', dependsOn: 'adjustInflation', dependsValue: 'yes', hint: 'Enter the annual rate to use for this estimate' }
    ],
    calculate: inputs => window.FinanceCalculatorEngine.sip(inputs)
  },
  compound: {
    title: 'Compound interest calculator',
    kicker: 'INTEREST & GROWTH',
    symbol: '∿',
    description: 'See how an initial amount may grow when interest compounds annually.',
    assumption: 'Assumes one compounding period per year. No extra deposits, fees, tax or inflation are included.',
    fields: [
      { id: 'principal', label: 'Initial amount', value: 10000, min: 0.01, max: 1000000000, step: 'any', hint: 'Your starting balance' },
      { id: 'rate', label: 'Annual interest rate (%)', value: 6, min: -100, max: 100, step: 'any', hint: 'Assumed rate, compounded yearly' },
      { id: 'years', label: 'Time period (years)', value: 10, min: 1, max: 100, step: 1, hint: 'How many years it compounds' }
    ],
    calculate: inputs => window.FinanceCalculatorEngine.compound(inputs)
  },
  crypto: {
    title: 'Crypto profit & tax estimator',
    kicker: 'TRADE SCENARIO',
    symbol: '₿',
    description: 'Estimate one trade after fees and an optional tax assumption.',
    assumption: 'Tax is only an illustration: the entered rate is applied to a positive gain after fees. Actual tax rules vary.',
    fields: [
      { id: 'buyPrice', label: 'Buy price per coin', value: 50000, min: 0, max: 1000000000, step: 'any', hint: 'Your purchase price per coin' },
      { id: 'sellPrice', label: 'Sell price per coin', value: 60000, min: 0, max: 1000000000, step: 'any', hint: 'Your sale price per coin' },
      { id: 'quantity', label: 'Quantity sold', value: 0.1, min: 0, max: 1000000000, step: 'any', hint: 'Number of coins or units' },
      { id: 'fees', label: 'Total fees', value: 20, min: 0, max: 1000000000, step: 'any', hint: 'Combined fees in your selected currency' },
      { id: 'taxRate', label: 'Assumed tax rate (%)', value: 0, min: 0, max: 100, step: 'any', hint: 'Optional scenario only—not your tax rate' }
    ],
    calculate: inputs => window.FinanceCalculatorEngine.crypto(inputs)
  },
  lumpsum: {
    title: 'Lump-sum investment calculator',
    kicker: 'ONE-TIME INVESTMENT',
    symbol: '◈',
    description: 'Estimate growth on a single investment with annual compounding.',
    assumption: 'Assumes one compounding period per year. No extra deposits, fees, tax or inflation are included.',
    fields: [
      { id: 'principal', label: 'Investment amount', value: 10000, min: 0.01, max: 1000000000, step: 'any', hint: 'One-time amount invested today' },
      { id: 'rate', label: 'Expected annual return (%)', value: 7, min: -100, max: 100, step: 'any', hint: 'An assumption, not a guarantee' },
      { id: 'years', label: 'Investment period (years)', value: 10, min: 1, max: 100, step: 1, hint: 'How long it stays invested' }
    ],
    calculate: inputs => window.FinanceCalculatorEngine.lumpSum(inputs)
  },
  inflation: {
    title: 'Inflation calculator',
    kicker: 'PURCHASING POWER',
    symbol: '⌁',
    description: 'Compare a future price with what the same money may buy.',
    assumption: 'Assumes the same inflation rate every year. The result is a scenario, not a price forecast.',
    fields: [
      { id: 'amount', label: 'Amount or price today', value: 1000, min: 0.01, max: 1000000000, step: 'any', hint: 'Enter an amount in your chosen currency' },
      { id: 'inflation', label: 'Assumed annual inflation (%)', value: 3, min: 0, max: 100, step: 'any', hint: 'Constant rate used for this estimate' },
      { id: 'years', label: 'Time period (years)', value: 10, min: 1, max: 100, step: 1, hint: 'How many years in the future' }
    ],
    calculate: inputs => window.FinanceCalculatorEngine.inflation(inputs)
  }
};

const currencySelect = document.querySelector('#currency');
const form = document.querySelector('#calculator-form');
const inputGrid = document.querySelector('#input-grid');
const buttons = [...document.querySelectorAll('[data-tool]')];
let activeTool = document.body.dataset.calculator || 'sip';
let lastResult = null;
let lastInputs = null;

try {
  const savedCurrency = localStorage.getItem('financehub-currency');
  if (savedCurrency && [...currencySelect.options].some(option => option.value === savedCurrency)) {
    currencySelect.value = savedCurrency;
  }
} catch (error) {
  // The site still works when browser storage is unavailable.
}

if (document.body.dataset.calculator !== 'sip') {
  document.querySelector('.chart-wrap')?.remove();
  document.querySelector('.schedule-details')?.remove();
}
if (!document.querySelector('#calculator-error')) {
  form.insertAdjacentHTML('beforeend', '<p class="calculator-error" id="calculator-error" role="alert" hidden></p>');
}
if (!form.querySelector('.live-update-note')) {
  form.insertAdjacentHTML('beforeend', '<p class="live-update-note">Enter your values, then click Calculate estimate to see your result.</p>');
}
if (!document.querySelector('#calculation-assumptions')) {
  form.insertAdjacentHTML('beforeend', '<p class="calculation-assumptions" id="calculation-assumptions"></p>');
}
if (!document.querySelector('#currency-note')) {
  form.insertAdjacentHTML('beforeend', '<p class="currency-note" id="currency-note">Enter amounts in the selected currency. Changing the currency changes the display label only; it does not convert amounts.</p>');
}

function money(value) {
  const locales = { PKR: 'en-PK', INR: 'en-IN', USD: 'en-US', GBP: 'en-GB', AUD: 'en-AU', CAD: 'en-CA', EUR: 'en-IE' };
  return new Intl.NumberFormat(locales[currencySelect.value] || 'en-US', {
    style: 'currency',
    currency: currencySelect.value,
    maximumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0);
}

function renderTool(toolId) {
  const tool = tools[toolId];
  if (!tool) throw new Error(`Unknown calculator: ${toolId}`);
  activeTool = toolId;
  document.querySelector('#tool-kicker').textContent = tool.kicker;
  document.querySelector('#tool-title').textContent = tool.title;
  document.querySelector('#tool-description').textContent = tool.description;
  document.querySelector('#tool-symbol').textContent = tool.symbol;
  document.querySelector('#calculation-assumptions').textContent = tool.assumption;
  inputGrid.innerHTML = tool.fields.map(field => `
    <div class="field"${field.dependsOn ? ` data-depends-on="${field.dependsOn}" data-depends-value="${field.dependsValue}" hidden` : ''}>
      <label for="${field.id}">${field.label}</label>
      ${field.type === 'select'
        ? `<select id="${field.id}" name="${field.id}">${field.options.map(option => `<option value="${option.value}"${option.value === field.value ? ' selected' : ''}>${option.label}</option>`).join('')}</select>`
        : `<input id="${field.id}" name="${field.id}" type="number" min="${field.min}" max="${field.max}" step="${field.step}" value="${field.value}" required inputmode="decimal">`}
      <span class="field-hint">${field.hint}</span>
    </div>
  `).join('');
  updateDependentFields();
  buttons.forEach(button => {
    const isActive = button.dataset.tool === toolId;
    button.classList.toggle('active', isActive);
    if (isActive) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
  const count = Object.keys(tools).indexOf(toolId) + 1;
  const countElement = document.querySelector('.tool-count');
  if (countElement) countElement.innerHTML = `${String(count).padStart(2, '0')} <span>/ 05</span>`;
  document.querySelector('#calculator-error').hidden = true;
  document.querySelector('#result-panel').hidden = true;
  lastResult = null;
  lastInputs = null;
}

function updateDependentFields() {
  document.querySelectorAll('.field[data-depends-on]').forEach(field => {
    const control = field.querySelector('input, select');
    const dependency = form.elements.namedItem(field.dataset.dependsOn);
    const isVisible = dependency.value === field.dataset.dependsValue;
    field.hidden = !isVisible;
    control.disabled = !isVisible;
    control.required = isVisible;
  });
}

function getCalculatorInputs() {
  const values = Object.fromEntries(new FormData(form).entries());
  const inputs = Object.fromEntries(Object.entries(values).map(([key, value]) => [
    key,
    key === 'adjustInflation' ? value : Number(value)
  ]));
  if (activeTool === 'sip' && inputs.adjustInflation !== 'yes') inputs.inflation = 0;
  return inputs;
}

function calculateEstimate(inputs) {
  const result = tools[activeTool].calculate(inputs);
  if (activeTool === 'sip' && inputs.adjustInflation !== 'yes') {
    result.breakdown = result.breakdown.filter(([label]) => label !== 'Inflation-adjusted value');
  }
  return result;
}

function resultExplanation(inputs, result) {
  switch (activeTool) {
    case 'sip': {
      const invested = result.breakdown[0][1];
      const growth = result.breakdown[1][1];
      const inflationNote = inputs.adjustInflation === 'yes'
        ? ` Inflation adjustment uses your entered rate of ${inputs.inflation}%.`
        : ' Inflation adjustment is off, so values are shown without an inflation adjustment.';
      return `Investing ${money(inputs.monthly)} each month for ${inputs.years} years means ${money(invested)} in total contributions. The estimate adds ${money(growth)} in projected growth.${inflationNote}`;
    }
    case 'compound':
    case 'lumpsum': {
      const startingAmount = result.breakdown[0][1];
      const growth = result.breakdown[1][1];
      const growthLabel = activeTool === 'compound' ? 'interest' : 'growth';
      return `Starting with ${money(startingAmount)} for ${inputs.years} years, this scenario estimates ${money(result.value)} in total, including ${money(growth)} in ${growthLabel}.`;
    }
    case 'crypto':
      return `After purchase cost, fees, and the optional tax assumption, your estimated net profit or loss is ${money(result.value)}.`;
    case 'inflation': {
      const buyingPower = result.breakdown[1][1];
      return `At ${inputs.inflation}% annual inflation for ${inputs.years} years, an item costing ${money(inputs.amount)} today could cost ${money(result.value)}. The unchanged amount would have about ${money(buyingPower)} in today's buying power.`;
    }
    default:
      return 'This estimate uses the values you entered. The table below shows how the result is calculated.';
  }
}

function renderResult(result, inputs) {
  document.querySelector('#result-label').textContent = result.label;
  document.querySelector('#result-value').textContent = money(result.value);
  const breakdown = document.querySelector('#result-breakdown');
  breakdown.setAttribute('aria-label', 'Calculation summary');
  let summaryHeading = document.querySelector('#summary-heading');
  if (!summaryHeading) {
    summaryHeading = document.createElement('h4');
    summaryHeading.id = 'summary-heading';
    summaryHeading.className = 'summary-heading';
    summaryHeading.textContent = 'Summary';
    document.querySelector('#result-panel').insertBefore(summaryHeading, breakdown);
  }
  let explanation = document.querySelector('#result-explanation');
  if (!explanation) {
    explanation = document.createElement('p');
    explanation.id = 'result-explanation';
    explanation.className = 'result-explanation';
    breakdown.before(explanation);
  }
  explanation.textContent = resultExplanation(inputs, result);
  breakdown.innerHTML = `
    <div class="result-table-wrap">
      <table class="result-table">
        <thead><tr><th scope="col">Breakdown</th><th scope="col">Amount</th></tr></thead>
        <tbody>${result.breakdown.map(([label, amount]) => `
          <tr><th scope="row">${label}</th><td>${money(amount)}</td></tr>
        `).join('')}</tbody>
      </table>
    </div>
  `;
}

function renderSipProjection(monthly, rate, years, inflation) {
  if (activeTool !== 'sip') return;

  const chart = document.querySelector('#chart');
  const chartCaption = document.querySelector('#chart-caption');
  const chartLegend = document.querySelector('#chart-legend');
  const scheduleHead = document.querySelector('#schedule-head');
  const scheduleBody = document.querySelector('#schedule-body');

  if (!chart || !scheduleHead || !scheduleBody) return;

  const points = [];
  const tableRows = [];
  const rowInterval = years > 30 ? 5 : years > 15 ? 2 : 1;

  for (let year = 1; year <= years; year++) {
    const yearlyResult = window.FinanceCalculatorEngine.sip({ monthly, rate, years: year, inflation });
    const futureValue = yearlyResult.value;
    const invested = yearlyResult.breakdown[0][1];
    points.push({ year, invested, futureValue });

    if (year === 1 || year === years || year % rowInterval === 0) {
      tableRows.push({ year, invested, futureValue, inflationAdjusted: futureValue / ((1 + inflation / 100) ** year) });
    }
  }

  const chartPoints = points.filter((_, index) => index % Math.max(1, Math.ceil(points.length / 12)) === 0);
  if (chartPoints[chartPoints.length - 1]?.year !== years) chartPoints.push(points[points.length - 1]);
  const maxValue = Math.max(...chartPoints.map(point => point.futureValue), 1);

  chart.innerHTML = chartPoints.map(point => {
    const investedHeight = (point.invested / maxValue) * 100;
    const futureHeight = (point.futureValue / maxValue) * 100;
    return `
      <div class="chart-column" title="Year ${point.year}: ${money(point.futureValue)}">
        <div class="chart-bars" aria-hidden="true">
          <span class="chart-growth" style="height:${futureHeight}%"></span>
          <span class="chart-contributions" style="height:${investedHeight}%"></span>
        </div>
        <span class="chart-year">Yr ${point.year}</span>
      </div>
    `;
  }).join('');
  chart.setAttribute('aria-label', `Illustrative monthly investment growth over ${years} years`);

  chartCaption.textContent = `${years} year projection`;
  chartLegend.innerHTML = '<span><i class="legend-contributions"></i>Contributions</span><span><i class="legend-growth"></i>Projected value</span>';

  const durationList = [1, 2, 3, 4, 5, 8, 10, 12, 15, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 35];
  const durationRows = durationList
    .filter(duration => duration <= 80)
    .map(duration => {
      const result = window.FinanceCalculatorEngine.sip({ monthly, rate, years: duration, inflation });
      return {
        duration,
        invested: monthly,
        futureValue: result.value
      };
    });
  if (!durationRows.some(row => row.duration === years)) {
    durationRows.push({ duration: years, invested: monthly, futureValue: window.FinanceCalculatorEngine.sip({ monthly, rate, years, inflation }).value });
    durationRows.sort((a, b) => a.duration - b.duration);
  }

  scheduleHead.innerHTML = '<tr><th>Duration</th><th>SIP amount</th><th>Future value</th></tr>';
  scheduleBody.innerHTML = durationRows.map(row => `
    <tr>
      <td>${row.duration} ${row.duration === 1 ? 'year' : 'years'}</td>
      <td>${money(row.invested)}</td>
      <td>${money(row.futureValue)}</td>
    </tr>
  `).join('');
}

function updateCalculator() {
  const error = document.querySelector('#calculator-error');
  if (!form.checkValidity()) {
    error.hidden = false;
    error.textContent = 'Check the highlighted values and enter a valid amount.';
    document.querySelector('#result-panel').hidden = true;
    return;
  }
  error.hidden = true;
  let inputs;
  try {
    inputs = getCalculatorInputs();
    const result = calculateEstimate(inputs);
    const hasInvalidResult = ![result.value, ...result.breakdown.map(([, amount]) => amount)].every(Number.isFinite);
    if (hasInvalidResult) throw new Error('The calculation is outside the supported range.');
    lastResult = result;
    lastInputs = inputs;
    renderResult(result, inputs);
    document.querySelector('#result-panel').hidden = false;
    const note = form.querySelector('.live-update-note');
    if (note) note.textContent = 'Estimate calculated. Change any value and calculate again to update it.';
  } catch (calculationError) {
    lastResult = null;
    lastInputs = null;
    error.hidden = false;
    error.textContent = calculationError.message || 'Enter valid values to calculate.';
    document.querySelector('#result-panel').hidden = true;
    return;
  }
  if (activeTool === 'sip') {
    renderSipProjection(inputs.monthly, inputs.rate, inputs.years, inputs.inflation || 0);
  }
}

buttons.forEach(button => button.addEventListener('click', () => renderTool(button.dataset.tool)));
form.addEventListener('input', () => {
  document.querySelector('#result-panel').hidden = true;
  document.querySelector('#calculator-error').hidden = true;
  lastResult = null;
  lastInputs = null;
  const note = form.querySelector('.live-update-note');
  if (note) note.textContent = 'Values changed. Click Calculate estimate to see the updated result.';
});
form.addEventListener('change', event => {
  if (event.target.name === 'adjustInflation') updateDependentFields();
});
form.addEventListener('submit', event => {
  event.preventDefault();
  updateCalculator();
});
currencySelect.addEventListener('change', () => {
  try {
    localStorage.setItem('financehub-currency', currencySelect.value);
  } catch (error) {
    // Calculator formatting remains available without persistent storage.
  }
  if (!document.querySelector('#result-panel').hidden && lastResult && lastInputs) {
    renderResult(lastResult, lastInputs);
  }
});

renderTool(activeTool);

function restoreSavedEstimate() {
  const estimateId = new URLSearchParams(window.location.search).get('saved');
  if (!estimateId) return;

  const estimate = getSavedEstimates().find(item => item.id === estimateId);
  if (!estimate || estimate.toolId !== activeTool) return;

  if (estimate.toolId === 'sip' && estimate.inputs.adjustInflation === undefined && Number(estimate.inputs.inflation) > 0) {
    const inflationToggle = form.elements.namedItem('adjustInflation');
    if (inflationToggle) inflationToggle.value = 'yes';
  }
  Object.entries(estimate.inputs).forEach(([key, value]) => {
    const input = document.querySelector(`[name="${key}"]`);
    if (input) input.value = value;
  });
  updateDependentFields();

  if ([...currencySelect.options].some(option => option.value === estimate.currency)) {
    currencySelect.value = estimate.currency;
  }

  updateCalculator();
  showSaveMessage('Saved estimate restored.');
}

const STORAGE_KEY = 'financehub-saved-estimates';

function getSavedEstimates() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

function saveEstimate() {
  if (!form.checkValidity()) {
    updateCalculator();
    return;
  }

  const inputs = getCalculatorInputs();
  let result;
  try {
    result = calculateEstimate(inputs);
    const hasInvalidResult = ![result.value, ...result.breakdown.map(([, amount]) => amount)].every(Number.isFinite);
    if (hasInvalidResult) throw new Error('The calculation is outside the supported range.');
  } catch (calculationError) {
    showSaveMessage(calculationError.message || 'Enter valid values before saving.');
    return;
  }

  const estimates = getSavedEstimates();
  estimates.unshift({
    id: `${Date.now()}-${activeTool}`,
    toolId: activeTool,
    title: tools[activeTool].title,
    currency: currencySelect.value,
    inputs,
    label: result.label,
    value: result.value,
    savedAt: new Date().toISOString()
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates.slice(0, 50)));
  } catch (error) {
    showSaveMessage('This browser could not save the estimate because local storage is unavailable.');
    return;
  }

  showSaveMessage('Estimate saved in this browser.');
  renderSavedEstimates();
}

function showSaveMessage(message) {
  const status = document.querySelector('#save-status');
  if (!status) return;
  status.textContent = message;
  status.hidden = false;
}

function ensureSaveControls() {
  const resultPanel = document.querySelector('#result-panel');
  if (!resultPanel || document.querySelector('#save-estimate')) return;

  const controls = document.createElement('div');
  controls.className = 'save-estimate-controls';
  controls.innerHTML = `
    <button class="save-estimate-button" id="save-estimate" type="button">Save estimate</button>
    <span class="save-status" id="save-status" role="status" hidden></span>
  `;
  resultPanel.appendChild(controls);
  controls.querySelector('#save-estimate').addEventListener('click', saveEstimate);
}

ensureSaveControls();

function formatSavedMoney(value, currency) {
  const locales = { PKR: 'en-PK', INR: 'en-IN', USD: 'en-US', GBP: 'en-GB', AUD: 'en-AU', CAD: 'en-CA', EUR: 'en-IE' };
  return new Intl.NumberFormat(locales[currency] || 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0);
}

function renderSavedEstimates() {
  const list = document.querySelector('#saved-estimate-list');
  if (!list) return;

  const estimates = getSavedEstimates();
  const empty = document.querySelector('#saved-estimate-empty');
  const clear = document.querySelector('#clear-saved-estimates');

  if (!estimates.length) {
    list.innerHTML = '';
    if (empty) empty.hidden = false;
    if (clear) clear.hidden = true;
    return;
  }

  if (empty) empty.hidden = true;
  if (clear) clear.hidden = false;

  list.innerHTML = estimates.map((estimate, index) => {
    const date = new Date(estimate.savedAt);
    const dateText = Number.isNaN(date.getTime())
      ? 'Saved estimate'
      : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const page = {
      sip: 'sip-calculator.html',
      compound: 'compound-interest-calculator.html',
      crypto: 'crypto-profit-calculator.html',
      lumpsum: 'lump-sum-calculator.html',
      inflation: 'inflation-calculator.html'
    }[estimate.toolId] || 'index.html';

    return `
      <article class="saved-estimate-card">
        <div>
          <p class="saved-estimate-date">${dateText}</p>
          <h3>${estimate.title}</h3>
          <p class="saved-estimate-label">${estimate.label}</p>
        </div>
        <strong class="saved-estimate-value">${formatSavedMoney(estimate.value, estimate.currency)}</strong>
        <a class="saved-estimate-link" href="${page}?saved=${encodeURIComponent(estimate.id)}" aria-label="Open ${estimate.title}">Open calculator →</a>
        <button class="remove-saved-estimate" type="button" data-estimate-index="${index}" aria-label="Remove this saved estimate">Remove</button>
      </article>
    `;
  }).join('');

  list.querySelectorAll('[data-estimate-index]').forEach(button => {
    button.addEventListener('click', () => {
      const estimates = getSavedEstimates();
      estimates.splice(Number(button.dataset.estimateIndex), 1);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates));
      } catch (error) {
        return;
      }
      renderSavedEstimates();
    });
  });
}

const clearSavedButton = document.querySelector('#clear-saved-estimates');
clearSavedButton?.addEventListener('click', () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    return;
  }
  renderSavedEstimates();
});

renderSavedEstimates();
restoreSavedEstimate();
