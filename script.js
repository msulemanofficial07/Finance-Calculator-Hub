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
  inputGrid.innerHTML = `
    <h4 class="input-section-heading">Your details</h4>
    ${tool.fields.map(field => `
      <div class="field"${field.dependsOn ? ` data-depends-on="${field.dependsOn}" data-depends-value="${field.dependsValue}" hidden` : ''}>
        <label for="${field.id}">${field.label}</label>
        ${field.type === 'select'
          ? `<select id="${field.id}" name="${field.id}">${field.options.map(option => `<option value="${option.value}"${option.value === field.value ? ' selected' : ''}>${option.label}</option>`).join('')}</select>`
          : `<input id="${field.id}" name="${field.id}" type="number" min="${field.min}" max="${field.max}" step="${field.step}" value="${field.value}" required inputmode="decimal">`}
        <span class="field-hint">${field.hint}</span>
      </div>
    `).join('')}
  `;
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

function getResultInputRows(inputs) {
  return tools[activeTool].fields.flatMap(field => {
    const value = inputs[field.id];
    if (field.dependsOn && inputs[field.dependsOn] !== field.dependsValue) return [];
    if (value === undefined || value === null || value === '') return [];

    let formattedValue;
    if (field.type === 'select') {
      formattedValue = field.options.find(option => option.value === value)?.label || value;
    } else if (field.id === 'years') {
      formattedValue = `${value} ${Number(value) === 1 ? 'year' : 'years'}`;
    } else if (['rate', 'inflation', 'taxRate'].includes(field.id)) {
      formattedValue = `${value}%`;
    } else if (field.id === 'quantity') {
      formattedValue = new Intl.NumberFormat(undefined, { maximumFractionDigits: 8 }).format(value);
    } else {
      formattedValue = money(value);
    }

    return [{ label: field.label, value: formattedValue }];
  });
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
  const breakdownRows = result.breakdown.map(([label, amount]) => `
    <tr><th scope="row">${label}</th><td>${money(amount)}</td></tr>
  `).join('');
  const inputRows = getResultInputRows(inputs).map(({ label, value }) => `
    <tr><th scope="row">${label}</th><td>${value}</td></tr>
  `).join('');
  breakdown.innerHTML = `
    <section class="result-table-section" aria-labelledby="breakdown-title">
      <h5 id="breakdown-title">Calculation breakdown</h5>
      <div class="result-table-wrap">
        <table class="result-table">
          <thead><tr><th scope="col">Item</th><th scope="col">Amount</th></tr></thead>
          <tbody>${breakdownRows}</tbody>
          <tfoot><tr><th scope="row">${result.label}</th><td>${money(result.value)}</td></tr></tfoot>
        </table>
      </div>
    </section>
    <details class="result-inputs-details">
      <summary>View inputs used</summary>
      <div class="result-table-wrap">
        <table class="result-table">
          <thead><tr><th scope="col">Input</th><th scope="col">Value</th></tr></thead>
          <tbody>${inputRows}</tbody>
        </table>
      </div>
    </details>
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
  status.classList.remove('is-error');
}

function showActionError(message) {
  showSaveMessage(message);
  document.querySelector('#save-status')?.classList.add('is-error');
}

function getShareSummary() {
  const lines = [
    `${tools[activeTool].title} — illustrative estimate`,
    `${lastResult.label}: ${money(lastResult.value)}`,
    resultExplanation(lastInputs, lastResult),
    '',
    'Calculation breakdown:',
    ...lastResult.breakdown.map(([label, amount]) => `${label}: ${money(amount)}`),
    '',
    'Inputs used:',
    ...getResultInputRows(lastInputs).map(({ label, value }) => `${label}: ${value}`),
    '',
    'For learning only; not financial, investment, or tax advice.'
  ];
  if (['http:', 'https:'].includes(window.location.protocol)) {
    const calculatorUrl = new URL(window.location.href);
    calculatorUrl.search = '';
    calculatorUrl.hash = '';
    lines.push('', `Calculator: ${calculatorUrl.href}`);
  }
  return lines.join('\n');
}

function showShareFallback(text) {
  const field = document.querySelector('#share-copy-text');
  field.value = text;
  field.hidden = false;
  field.focus();
  field.select();
}

async function shareEstimate() {
  if (!lastResult || !lastInputs) {
    showActionError('Calculate an estimate before sharing it.');
    return;
  }

  const text = getShareSummary();
  const copyField = document.querySelector('#share-copy-text');
  copyField.hidden = true;

  if (typeof navigator.share === 'function') {
    try {
      const shareData = { title: `${tools[activeTool].title} estimate`, text };
      if (['http:', 'https:'].includes(window.location.protocol)) {
        const calculatorUrl = new URL(window.location.href);
        calculatorUrl.search = '';
        calculatorUrl.hash = '';
        shareData.url = calculatorUrl.href;
      }
      await navigator.share(shareData);
      showSaveMessage('Share options opened.');
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }

  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable.');
    await navigator.clipboard.writeText(text);
    showSaveMessage('Estimate summary copied. Paste it into a message to share.');
  } catch (error) {
    showShareFallback(text);
    showActionError('Could not copy automatically. The summary is selected so you can copy it manually.');
  }
}

function wrapCanvasText(context, text, maxWidth) {
  const lines = [];
  let line = '';

  for (const word of String(text).split(/\s+/)) {
    if (context.measureText(word).width > maxWidth) {
      if (line) lines.push(line);
      line = '';
      for (const character of word) {
        if (line && context.measureText(line + character).width > maxWidth) {
          lines.push(line);
          line = character;
        } else {
          line += character;
        }
      }
      continue;
    }

    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function downloadResultImage() {
  if (!lastResult || !lastInputs) {
    showActionError('Calculate an estimate before downloading an image.');
    return;
  }

  const width = 1100;
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = 1800 * scale;
  const context = canvas.getContext('2d');
  if (!context) {
    showActionError('This browser could not create the result image.');
    return;
  }
  if (typeof canvas.toBlob !== 'function') {
    showActionError('PNG image downloads are not supported by this browser.');
    return;
  }
  context.scale(scale, scale);

  const padding = 64;
  const innerWidth = width - padding * 2;
  const leftColumn = 690;
  const rightColumn = innerWidth - leftColumn;
  let y = 60;

  context.fillStyle = '#f0f6f2';
  context.fillRect(0, 0, width, canvas.height / scale);
  context.fillStyle = '#ffffff';
  context.fillRect(30, 30, width - 60, canvas.height / scale - 60);
  context.fillStyle = '#176f4c';
  context.fillRect(30, 30, width - 60, 12);

  context.fillStyle = '#176f4c';
  context.fillRect(padding, y, 44, 44);
  context.fillStyle = '#ffffff';
  context.font = '800 26px system-ui, sans-serif';
  context.textAlign = 'center';
  context.fillText('F', padding + 22, y + 31);
  context.textAlign = 'left';
  context.fillStyle = '#163d2d';
  context.font = '800 23px system-ui, sans-serif';
  context.fillText('FinanceHub', padding + 58, y + 21);
  context.fillStyle = '#596b60';
  context.font = '16px system-ui, sans-serif';
  context.fillText(tools[activeTool].title, padding + 58, y + 43);
  context.textAlign = 'right';
  context.fillStyle = '#176f4c';
  context.font = '700 13px system-ui, sans-serif';
  context.fillText('ILLUSTRATIVE ESTIMATE', width - padding, y + 27);
  context.textAlign = 'left';
  y += 86;

  context.fillStyle = '#405b4c';
  context.font = '700 15px system-ui, sans-serif';
  context.fillText(lastResult.label.toUpperCase(), padding, y);
  y += 60;
  context.fillStyle = '#0c4a31';
  let valueFont = 52;
  const resultValue = money(lastResult.value);
  context.font = `800 ${valueFont}px system-ui, sans-serif`;
  while (context.measureText(resultValue).width > innerWidth && valueFont > 28) {
    valueFont -= 2;
    context.font = `800 ${valueFont}px system-ui, sans-serif`;
  }
  context.fillText(resultValue, padding, y);
  y += 40;

  context.fillStyle = '#344b40';
  context.font = '19px system-ui, sans-serif';
  const summaryLines = wrapCanvasText(context, resultExplanation(lastInputs, lastResult), innerWidth);
  summaryLines.forEach(line => {
    y += 30;
    context.fillText(line, padding, y);
  });
  y += 34;

  function drawTable(title, headers, rows, includeTotal) {
    context.fillStyle = '#173c2c';
    context.font = '800 21px system-ui, sans-serif';
    context.fillText(title, padding, y);
    y += 20;

    context.fillStyle = '#176f4c';
    context.fillRect(padding, y, innerWidth, 48);
    context.fillStyle = '#ffffff';
    context.font = '700 14px system-ui, sans-serif';
    context.textAlign = 'left';
    context.fillText(headers[0].toUpperCase(), padding + 16, y + 30);
    context.textAlign = 'right';
    context.fillText(headers[1].toUpperCase(), width - padding - 16, y + 30);
    context.textAlign = 'left';
    y += 48;

    rows.forEach((row, index) => {
      context.font = '16px system-ui, sans-serif';
      const labelLines = wrapCanvasText(context, row.label, leftColumn - 28);
      const valueLines = wrapCanvasText(context, row.value, rightColumn - 28);
      const lineCount = Math.max(labelLines.length, valueLines.length, 1);
      const rowHeight = lineCount * 25 + 20;
      context.fillStyle = index % 2 ? '#f5f8f6' : '#ffffff';
      context.fillRect(padding, y, innerWidth, rowHeight);
      context.strokeStyle = '#e2eae5';
      context.beginPath();
      context.moveTo(padding, y + rowHeight);
      context.lineTo(width - padding, y + rowHeight);
      context.stroke();
      context.fillStyle = '#344b40';
      context.textAlign = 'left';
      labelLines.forEach((line, lineIndex) => context.fillText(line, padding + 16, y + 21 + lineIndex * 25));
      context.fillStyle = '#183d2d';
      context.textAlign = 'right';
      valueLines.forEach((line, lineIndex) => context.fillText(line, width - padding - 16, y + 21 + lineIndex * 25));
      context.textAlign = 'left';
      y += rowHeight;
    });

    if (includeTotal) {
      const total = { label: lastResult.label, value: money(lastResult.value) };
      context.font = '800 17px system-ui, sans-serif';
      const labelLines = wrapCanvasText(context, total.label, leftColumn - 28);
      const valueLines = wrapCanvasText(context, total.value, rightColumn - 28);
      const rowHeight = Math.max(labelLines.length, valueLines.length, 1) * 26 + 22;
      context.fillStyle = '#e4f3e9';
      context.fillRect(padding, y, innerWidth, rowHeight);
      context.fillStyle = '#124a32';
      labelLines.forEach((line, index) => context.fillText(line, padding + 16, y + 22 + index * 26));
      context.textAlign = 'right';
      valueLines.forEach((line, index) => context.fillText(line, width - padding - 16, y + 22 + index * 26));
      context.textAlign = 'left';
      y += rowHeight + 30;
    } else {
      y += 30;
    }
  }

  drawTable(
    'Calculation breakdown',
    ['Item', 'Amount'],
    lastResult.breakdown.map(([label, amount]) => ({ label, value: money(amount) })),
    true
  );
  drawTable('Inputs used', ['Input', 'Value'], getResultInputRows(lastInputs), false);

  context.fillStyle = '#526174';
  context.font = '14px system-ui, sans-serif';
  const disclaimerLines = wrapCanvasText(
    context,
    'For learning only; actual returns, fees, inflation and taxes may differ. This is not financial, investment, or tax advice.',
    innerWidth
  );
  disclaimerLines.forEach(line => {
    y += 22;
    context.fillText(line, padding, y);
  });

  const imageHeight = Math.ceil((y + 60) * scale);
  const imageData = context.getImageData(0, 0, canvas.width, imageHeight);
  canvas.height = imageHeight;
  context.putImageData(imageData, 0, 0);
  canvas.toBlob(blob => {
    if (!blob) {
      showActionError('The result image could not be created.');
      return;
    }
    const imageUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `financehub-${activeTool}-estimate.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
    showSaveMessage('Result image downloaded.');
  }, 'image/png');
}

function ensureSaveControls() {
  const resultPanel = document.querySelector('#result-panel');
  if (!resultPanel || document.querySelector('#save-estimate')) return;

  const controls = document.createElement('div');
  controls.className = 'save-estimate-controls';
  controls.innerHTML = `
    <button class="save-estimate-button" id="save-estimate" type="button">Save estimate</button>
    <button class="download-image-button" id="download-result-image" type="button">Download image</button>
    <button class="share-result-button" id="share-result" type="button">Share result</button>
    <span class="save-status" id="save-status" role="status" hidden></span>
    <textarea class="share-copy-text" id="share-copy-text" aria-label="Shareable estimate summary" readonly hidden></textarea>
  `;
  const chart = resultPanel.querySelector('.chart-wrap');
  if (chart) resultPanel.insertBefore(controls, chart);
  else resultPanel.appendChild(controls);
  controls.querySelector('#save-estimate').addEventListener('click', saveEstimate);
  controls.querySelector('#download-result-image').addEventListener('click', downloadResultImage);
  controls.querySelector('#share-result').addEventListener('click', shareEstimate);
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
