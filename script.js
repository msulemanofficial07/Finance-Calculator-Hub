const tools = {
  sip: {
    title: 'SIP calculator',
    kicker: 'INVESTMENT PLANNER',
    symbol: '↗',
    description: 'Estimate how regular monthly investments may grow over time.',
    fields: [
      { id: 'monthly', label: 'Monthly investment', value: 5000, min: 500, max: 100000000, step: 500, hint: 'Amount invested each month' },
      { id: 'rate', label: 'Expected annual return (%)', value: 12, min: 0, max: 100, step: 0.1, hint: 'An assumption, not a guaranteed return' },
      { id: 'years', label: 'Investment period (years)', value: 10, min: 1, max: 80, step: 1, hint: 'How long you plan to invest' }
    ],
    calculate: ({ monthly, rate, years }) => {
      const monthlyRate = rate / 1200;
      let balance = 0;
      let invested = 0;
      const schedule = [];
      for (let month = 1; month <= years * 12; month++) {
        balance = (balance + monthly) * (1 + monthlyRate);
        invested += monthly;
        if (month % 12 === 0) schedule.push({ year: month / 12, balance, invested });
      }
      return {
        label: 'Estimated future value',
        value: balance,
        breakdown: [['Total invested', invested], ['Estimated growth', balance - invested]],
        schedule,
        columns: ['Year', 'Invested', 'Projected value']
      };
    }
  },
  compound: {
    title: 'Compound interest calculator',
    kicker: 'GROWTH PLANNER',
    symbol: '∿',
    description: 'See how your starting balance could grow with monthly compounding.',
    fields: [
      { id: 'principal', label: 'Initial amount', value: 100000, min: 1000, max: 1000000000, step: 1000, hint: 'Your starting principal' },
      { id: 'rate', label: 'Annual interest rate (%)', value: 8, min: 0, max: 100, step: 0.1, hint: 'Assumed annual rate' },
      { id: 'years', label: 'Time period (years)', value: 10, min: 1, max: 80, step: 1, hint: 'How long interest compounds' }
    ],
    calculate: ({ principal, rate, years }) => {
      const monthlyRate = rate / 1200;
      const schedule = [];
      for (let year = 1; year <= years; year++) {
        schedule.push({ year, balance: principal * (1 + monthlyRate) ** (year * 12), invested: principal });
      }
      const balance = principal * (1 + monthlyRate) ** (years * 12);
      return {
        label: 'Estimated future value',
        value: balance,
        breakdown: [['Starting amount', principal], ['Estimated interest', balance - principal]],
        schedule,
        columns: ['Year', 'Starting amount', 'Projected value']
      };
    }
  },
  crypto: {
    title: 'Crypto profit & tax estimator',
    kicker: 'TRADE ESTIMATOR',
    symbol: '₿',
    description: 'Estimate a trade outcome after fees and an optional tax assumption.',
    fields: [
      { id: 'buyPrice', label: 'Buy price per coin', value: 30000, min: 0, max: 1000000000, step: 'any', hint: 'Price paid for each coin' },
      { id: 'sellPrice', label: 'Sell price per coin', value: 40000, min: 0, max: 1000000000, step: 'any', hint: 'Price received for each coin' },
      { id: 'quantity', label: 'Quantity sold', value: 0.1, min: 0, max: 1000000000, step: 'any', hint: 'Number of coins or units' },
      { id: 'fees', label: 'Total fees', value: 0, min: 0, max: 1000000000, step: 1, hint: 'Trading and transaction fees' },
      { id: 'taxRate', label: 'Estimated tax rate (%)', value: 0, min: 0, max: 100, step: 0.1, hint: 'Enter a rate that applies to your situation' }
    ],
    calculate: ({ buyPrice, sellPrice, quantity, fees, taxRate }) => {
      const cost = buyPrice * quantity;
      const proceeds = sellPrice * quantity;
      const profit = proceeds - cost - fees;
      const tax = Math.max(0, profit) * taxRate / 100;
      return {
        label: 'Estimated profit after fees & tax',
        value: profit - tax,
        breakdown: [['Sale proceeds', proceeds], ['Purchase cost', cost], ['Fees', fees], ['Estimated tax', tax]],
        schedule: [{ year: 'Trade', balance: profit - tax, invested: cost }],
        columns: ['Trade', 'Cost basis', 'Net profit']
      };
    }
  },
  lumpsum: {
    title: 'Lump-sum investment calculator',
    kicker: 'ONE-TIME INVESTMENT',
    symbol: '◈',
    description: 'Project the potential growth of a one-time investment.',
    fields: [
      { id: 'principal', label: 'Investment amount', value: 100000, min: 1000, max: 1000000000, step: 1000, hint: 'One-time amount invested today' },
      { id: 'rate', label: 'Expected annual return (%)', value: 10, min: 0, max: 100, step: 0.1, hint: 'An assumption, not a guaranteed return' },
      { id: 'years', label: 'Investment period (years)', value: 10, min: 1, max: 80, step: 1, hint: 'How long the investment stays invested' }
    ],
    calculate: ({ principal, rate, years }) => {
      const monthlyRate = rate / 1200;
      const schedule = [];
      for (let year = 1; year <= years; year++) {
        schedule.push({ year, balance: principal * (1 + monthlyRate) ** (year * 12), invested: principal });
      }
      const balance = principal * (1 + monthlyRate) ** (years * 12);
      return {
        label: 'Estimated future value',
        value: balance,
        breakdown: [['Amount invested', principal], ['Estimated growth', balance - principal]],
        schedule,
        columns: ['Year', 'Amount invested', 'Projected value']
      };
    }
  },
  inflation: {
    title: 'Inflation impact calculator',
    kicker: 'PURCHASING POWER',
    symbol: '⌁',
    description: "Estimate what today's money may be worth after inflation.",
    fields: [
      { id: 'amount', label: 'Amount today', value: 100000, min: 1000, max: 1000000000, step: 1000, hint: 'Money whose future value you want to estimate' },
      { id: 'inflation', label: 'Annual inflation rate (%)', value: 6, min: 0, max: 100, step: 0.1, hint: 'Your assumed average annual inflation' },
      { id: 'years', label: 'Time period (years)', value: 10, min: 1, max: 80, step: 1, hint: 'Number of years in the future' }
    ],
    calculate: ({ amount, inflation, years }) => {
      const schedule = [];
      for (let year = 1; year <= years; year++) {
        schedule.push({ year, balance: amount / (1 + inflation / 100) ** year, invested: amount });
      }
      const realValue = amount / (1 + inflation / 100) ** years;
      return {
        label: "Estimated value in today's money",
        value: realValue,
        breakdown: [['Amount today', amount], ['Purchasing power lost', amount - realValue]],
        schedule,
        columns: ['Year', 'Amount today', 'Value in today’s money']
      };
    }
  }
};

const currencySelect = document.querySelector('#currency');
const form = document.querySelector('#calculator-form');
const inputGrid = document.querySelector('#input-grid');
const buttons = [...document.querySelectorAll('.tool-button')];
let activeTool = 'sip';

function money(value) {
  const currency = currencySelect.value;
  const locales = { USD: 'en-US', GBP: 'en-GB', AUD: 'en-AU', CAD: 'en-CA', EUR: 'en-IE' };
  return new Intl.NumberFormat(locales[currency] || 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0);
}

function renderTool(toolId) {
  activeTool = toolId;
  const tool = tools[toolId];
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
  const countElement = document.querySelector('.tool-count');
  if (countElement) {
    const count = Object.keys(tools).indexOf(toolId) + 1;
    countElement.innerHTML = `${String(count).padStart(2, '0')} <span>/ 05</span>`;
  }
  form.requestSubmit();
}

function renderResult(result) {
  document.querySelector('#result-label').textContent = result.label;
  document.querySelector('#result-value').textContent = money(result.value);
  document.querySelector('#result-breakdown').innerHTML = result.breakdown.map(([label, amount]) => `
    <div class="breakdown-item"><span>${label}</span><strong>${money(amount)}</strong></div>
  `).join('');
  const maxValue = Math.max(...result.schedule.map(row => Math.abs(row.balance)), 1);
  const bars = result.schedule.length > 60
    ? result.schedule.filter((_, index) => index % Math.ceil(result.schedule.length / 60) === 0 || index === result.schedule.length - 1)
    : result.schedule;
  document.querySelector('#chart').innerHTML = bars.map(row => {
    const height = Math.max(2, Math.abs(row.balance) / maxValue * 100);
    return `<span class="chart-bar" style="height:${height}%" data-label="${typeof row.year === 'number' ? `Year ${row.year}` : row.year}: ${money(row.balance)}"></span>`;
  }).join('');
  document.querySelector('#chart-caption').textContent = `${result.schedule.length} ${result.schedule.length === 1 ? 'period' : 'years'}`;
  document.querySelector('#schedule-head').innerHTML = `<tr>${result.columns.map(column => `<th scope="col">${column}</th>`).join('')}</tr>`;
  document.querySelector('#schedule-body').innerHTML = result.schedule.map(row => `
    <tr><td>${row.year}</td><td>${money(row.invested)}</td><td>${money(row.balance)}</td></tr>
  `).join('');
  document.querySelector('#chart-wrap').hidden = result.schedule.length === 0;
}

buttons.forEach(button => button.addEventListener('click', () => renderTool(button.dataset.tool)));
currencySelect.addEventListener('change', () => form.requestSubmit());
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form).entries());
  const inputs = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Number(value)]));
  const result = tools[activeTool].calculate(inputs);
  renderResult(result);
});

renderTool(document.body.dataset.calculator || activeTool);
