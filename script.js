const tools = {
  sip: {
    title: 'SIP calculator',
    kicker: 'MONTHLY INVESTING',
    symbol: '↗',
    description: 'Estimate the future value of regular monthly contributions.',
    fields: [
      { id: 'monthly', label: 'Monthly investment', value: 5000, min: 0.01, max: 100000000, step: 'any', hint: 'Your contribution each month' },
      { id: 'rate', label: 'Expected annual return (%)', value: 12, min: -100, max: 100, step: 0.1, hint: 'An assumption, not a guarantee' },
      { id: 'years', label: 'Investment period (years)', value: 10, min: 1, max: 80, step: 1, hint: 'How many years you invest' }
    ],
    calculate: ({ monthly, rate, years }) => {
      const monthlyRate = rate / 1200;
      const months = years * 12;
      const futureValue = monthlyRate === 0
        ? monthly * months
        : monthly * ((1 + monthlyRate) ** months - 1) / monthlyRate;
      const invested = monthly * months;
      return {
        label: 'Estimated future value',
        value: futureValue,
        breakdown: [['Total contributions', invested], ['Estimated growth', futureValue - invested]]
      };
    }
  },
  compound: {
    title: 'Compound interest calculator',
    kicker: 'INTEREST & GROWTH',
    symbol: '∿',
    description: 'See how an initial amount may grow when interest compounds annually.',
    fields: [
      { id: 'principal', label: 'Initial amount', value: 10000, min: 0.01, max: 1000000000, step: 'any', hint: 'Your starting balance' },
      { id: 'rate', label: 'Annual interest rate (%)', value: 6, min: 0, max: 100, step: 0.1, hint: 'Assumed rate, compounded yearly' },
      { id: 'years', label: 'Time period (years)', value: 10, min: 1, max: 100, step: 1, hint: 'How many years it compounds' }
    ],
    calculate: ({ principal, rate, years }) => {
      const futureValue = principal * (1 + rate / 100) ** years;
      return {
        label: 'Estimated future value',
        value: futureValue,
        breakdown: [['Initial amount', principal], ['Estimated interest', futureValue - principal]]
      };
    }
  },
  crypto: {
    title: 'Crypto profit & tax estimator',
    kicker: 'TRADE SCENARIO',
    symbol: '₿',
    description: 'Estimate one trade after fees and an optional tax assumption.',
    fields: [
      { id: 'buyPrice', label: 'Buy price per coin', value: 50000, min: 0, max: 1000000000, step: 'any', hint: 'Your purchase price per coin' },
      { id: 'sellPrice', label: 'Sell price per coin', value: 60000, min: 0, max: 1000000000, step: 'any', hint: 'Your sale price per coin' },
      { id: 'quantity', label: 'Quantity sold', value: 0.1, min: 0, max: 1000000000, step: 'any', hint: 'Number of coins or units' },
      { id: 'fees', label: 'Total fees', value: 20, min: 0, max: 1000000000, step: 'any', hint: 'Combined fees in your selected currency' },
      { id: 'taxRate', label: 'Assumed tax rate (%)', value: 0, min: 0, max: 100, step: 0.1, hint: 'Optional scenario only—not your tax rate' }
    ],
    calculate: ({ buyPrice, sellPrice, quantity, fees, taxRate }) => {
      const proceeds = sellPrice * quantity;
      const cost = buyPrice * quantity;
      const profitBeforeTax = proceeds - cost - fees;
      const estimatedTax = Math.max(0, profitBeforeTax) * taxRate / 100;
      return {
        label: 'Estimated net profit / loss',
        value: profitBeforeTax - estimatedTax,
        breakdown: [
          ['Sale proceeds', proceeds],
          ['Purchase cost', cost],
          ['Trading fees', fees],
          ['Profit / loss before tax', profitBeforeTax],
          ['Illustrative tax', estimatedTax]
        ]
      };
    }
  },
  lumpsum: {
    title: 'Lump-sum investment calculator',
    kicker: 'ONE-TIME INVESTMENT',
    symbol: '◈',
    description: 'Estimate growth on a single investment with annual compounding.',
    fields: [
      { id: 'principal', label: 'Investment amount', value: 10000, min: 0.01, max: 1000000000, step: 'any', hint: 'One-time amount invested today' },
      { id: 'rate', label: 'Expected annual return (%)', value: 7, min: -100, max: 100, step: 0.1, hint: 'An assumption, not a guarantee' },
      { id: 'years', label: 'Investment period (years)', value: 10, min: 1, max: 100, step: 1, hint: 'How long it stays invested' }
    ],
    calculate: ({ principal, rate, years }) => {
      const futureValue = principal * (1 + rate / 100) ** years;
      return {
        label: 'Estimated future value',
        value: futureValue,
        breakdown: [['Amount invested', principal], ['Estimated growth', futureValue - principal]]
      };
    }
  },
  inflation: {
    title: 'Inflation calculator',
    kicker: 'PURCHASING POWER',
    symbol: '⌁',
    description: 'Compare a future price with what the same money may buy.',
    fields: [
      { id: 'amount', label: 'Amount or price today', value: 1000, min: 0.01, max: 1000000000, step: 'any', hint: 'Enter an amount in your chosen currency' },
      { id: 'inflation', label: 'Assumed annual inflation (%)', value: 3, min: 0, max: 100, step: 0.1, hint: 'Constant rate used for this estimate' },
      { id: 'years', label: 'Time period (years)', value: 10, min: 1, max: 100, step: 1, hint: 'How many years in the future' }
    ],
    calculate: ({ amount, inflation, years }) => {
      const factor = (1 + inflation / 100) ** years;
      const futureCost = amount * factor;
      const purchasingPower = amount / factor;
      return {
        label: 'Estimated future cost',
        value: futureCost,
        breakdown: [
          ['Price increase', futureCost - amount],
          ["Today's money buying power", purchasingPower]
        ]
      };
    }
  }
};

const currencySelect = document.querySelector('#currency');
const form = document.querySelector('#calculator-form');
const inputGrid = document.querySelector('#input-grid');
const buttons = [...document.querySelectorAll('[data-tool]')];
let activeTool = document.body.dataset.calculator || 'sip';

form.querySelector('.calculate-button')?.remove();
document.querySelector('.chart-wrap')?.remove();
document.querySelector('.schedule-details')?.remove();
if (!document.querySelector('#calculator-error')) {
  form.insertAdjacentHTML('beforeend', '<p class="calculator-error" id="calculator-error" role="alert" hidden></p>');
}
if (!form.querySelector('.live-update-note')) {
  form.insertAdjacentHTML('beforeend', '<p class="live-update-note">Results update as you change an input.</p>');
}

function money(value) {
  const locales = { USD: 'en-US', GBP: 'en-GB', AUD: 'en-AU', CAD: 'en-CA', EUR: 'en-IE' };
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
  inputGrid.innerHTML = tool.fields.map(field => `
    <div class="field">
      <label for="${field.id}">${field.label}</label>
      <input id="${field.id}" name="${field.id}" type="number" min="${field.min}" max="${field.max}" step="${field.step}" value="${field.value}" required inputmode="decimal">
      <span class="field-hint">${field.hint}</span>
    </div>
  `).join('');
  buttons.forEach(button => {
    const isActive = button.dataset.tool === toolId;
    button.classList.toggle('active', isActive);
    if (isActive) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
  const count = Object.keys(tools).indexOf(toolId) + 1;
  const countElement = document.querySelector('.tool-count');
  if (countElement) countElement.innerHTML = `${String(count).padStart(2, '0')} <span>/ 05</span>`;
  updateCalculator();
}

function renderResult(result) {
  document.querySelector('#result-label').textContent = result.label;
  document.querySelector('#result-value').textContent = money(result.value);
  document.querySelector('#result-breakdown').innerHTML = result.breakdown.map(([label, amount]) => `
    <div class="breakdown-item"><span>${label}</span><strong>${money(amount)}</strong></div>
  `).join('');
  document.querySelector('#result-breakdown').classList.toggle('trade-breakdown', activeTool === 'crypto');
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
  document.querySelector('#result-panel').hidden = false;
  const values = Object.fromEntries(new FormData(form).entries());
  const inputs = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Number(value)]));
  renderResult(tools[activeTool].calculate(inputs));
}

buttons.forEach(button => button.addEventListener('click', () => renderTool(button.dataset.tool)));
form.addEventListener('input', updateCalculator);
form.addEventListener('submit', event => {
  event.preventDefault();
  updateCalculator();
});
currencySelect.addEventListener('change', updateCalculator);

renderTool(activeTool);
