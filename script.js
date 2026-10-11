const tools = {
  sip: {
    title: 'SIP calculator',
    kicker: 'INVESTMENT PLANNER',
    symbol: '↗',
    description: 'Estimate how regular monthly investments may grow over time.',
    fields: [
      { id: 'monthly', label: 'Monthly investment', value: 5000, min: 0.01, max: 100000000, step: 0.01, hint: 'Amount invested each month' },
      { id: 'rate', label: 'Expected annual return (%)', value: 12, min: -100, max: 100, step: 0.1, hint: 'An assumption, not a guaranteed return' },
      { id: 'years', label: 'Investment period (years)', value: 10, min: 1, max: 80, step: 1, hint: 'How long you plan to invest' }
    ],
    calculate: ({ monthly, rate, years }) => {
      const monthlyRate = rate / 1200;
      let balance = 0;
      let invested = 0;
      const schedule = [];
      for (let month = 1; month <= years * 12; month++) {
        balance = balance * (1 + monthlyRate) + monthly;
        invested += monthly;
        if (month % 12 === 0) schedule.push({ year: month / 12, balance, invested });
      }
      return {
        label: 'Estimated future value',
        value: balance,
        breakdown: [['Total invested', invested], ['Estimated growth', balance - invested]],
        schedule,
        columns: ['Year', 'Total invested', 'Projected value'],
        chartTitle: 'Your contributions vs projected value',
        chartSeries: ['Projected value', 'Total invested'],
        start: { balance: 0, invested: 0 }
      };
    }
  },
  compound: {
    title: 'Compound interest calculator',
    kicker: 'GROWTH PLANNER',
    symbol: '∿',
    description: 'See how your starting balance could grow with monthly compounding.',
    fields: [
      { id: 'principal', label: 'Initial amount', value: 10000, min: 0.01, max: 1000000000, step: 0.01, hint: 'Your starting principal' },
      { id: 'rate', label: 'Annual interest rate (%)', value: 8, min: -100, max: 100, step: 0.1, hint: 'Assumed annual rate' },
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
        columns: ['Year', 'Starting amount', 'Projected value'],
        chartTitle: 'Starting amount vs projected value',
        chartSeries: ['Projected value', 'Starting amount'],
        start: { balance: principal, invested: principal }
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
      { id: 'fees', label: 'Total fees', value: 0, min: 0, max: 1000000000, step: 'any', hint: 'Trading and transaction fees' },
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
        breakdown: [['Sale proceeds', proceeds], ['Purchase cost', cost], ['Trading fees', fees], ['Tax estimate', tax]],
        schedule: [],
        columns: [],
        chartTitle: '',
        chartSeries: [],
        start: null
      };
    }
  },
  lumpsum: {
    title: 'Lump-sum investment calculator',
    kicker: 'ONE-TIME INVESTMENT',
    symbol: '◈',
    description: 'Project the potential growth of a one-time investment.',
    fields: [
      { id: 'principal', label: 'Investment amount', value: 10000, min: 0.01, max: 1000000000, step: 0.01, hint: 'One-time amount invested today' },
      { id: 'rate', label: 'Expected annual return (%)', value: 10, min: -100, max: 100, step: 0.1, hint: 'An assumption, not a guaranteed return' },
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
        columns: ['Year', 'Amount invested', 'Projected value'],
        chartTitle: 'Amount invested vs projected value',
        chartSeries: ['Projected value', 'Amount invested'],
        start: { balance: principal, invested: principal }
      };
    }
  },
  inflation: {
    title: 'Inflation impact calculator',
    kicker: 'PURCHASING POWER',
    symbol: '⌁',
    description: "Estimate what today's money may be worth after inflation.",
    fields: [
      { id: 'amount', label: 'Amount today', value: 10000, min: 0.01, max: 1000000000, step: 0.01, hint: 'Money whose future value you want to estimate' },
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
        columns: ['Year', 'Amount today', "Value in today's money"],
        chartTitle: 'Value today vs future purchasing power',
        chartSeries: ["Value in today's money", 'Amount today'],
        start: { balance: amount, invested: amount }
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

function compactMoney(value) {
  const currency = currencySelect.value;
  const locales = { USD: 'en-US', GBP: 'en-GB', AUD: 'en-AU', CAD: 'en-CA', EUR: 'en-IE' };
  return new Intl.NumberFormat(locales[currency] || 'en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
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

function renderChart(result) {
  const chartWrap = document.querySelector('#chart-wrap');
  const scheduleDetails = document.querySelector('#schedule-details');
  if (result.schedule.length === 0) {
    chartWrap.hidden = true;
    scheduleDetails.hidden = true;
    return;
  }

  chartWrap.hidden = false;
  scheduleDetails.hidden = false;
  document.querySelector('#chart-title').textContent = result.chartTitle;
  document.querySelector('#chart-caption').textContent = `${result.schedule.length} ${result.schedule.length === 1 ? 'year' : 'years'}`;
  document.querySelector('#chart-legend').innerHTML = result.chartSeries.map((label, index) => `
    <span><i class="legend-dot legend-dot-${index + 1}"></i>${label}</span>
  `).join('');

  const points = [result.start, ...result.schedule];
  const plot = { left: 82, right: 620, top: 20, bottom: 170 };
  const values = points.flatMap(point => [point.balance, point.invested]);
  const maxValue = Math.max(...values, 1);
  const x = index => plot.left + index / Math.max(points.length - 1, 1) * (plot.right - plot.left);
  const y = value => plot.bottom - value / maxValue * (plot.bottom - plot.top);
  const grid = [0, 0.5, 1].map(fraction => {
    const position = plot.bottom - fraction * (plot.bottom - plot.top);
    return `<line x1="${plot.left}" y1="${position}" x2="${plot.right}" y2="${position}" class="chart-grid-line"></line>
      <text x="${plot.left - 9}" y="${position + 4}" text-anchor="end" class="chart-axis-label">${compactMoney(maxValue * fraction)}</text>`;
  }).join('');
  const lines = [
    { key: 'balance', className: 'chart-line-primary' },
    { key: 'invested', className: 'chart-line-secondary' }
  ].map(series => {
    const coordinates = points.map((point, index) => `${x(index)},${y(point[series.key])}`).join(' ');
    const markerStep = Math.max(1, Math.ceil((points.length - 1) / 4));
    const markers = points.map((point, index) => {
      if (index !== 0 && index !== points.length - 1 && index % markerStep !== 0) return '';
      const label = index === 0 ? 'Start' : `Year ${point.year}`;
      return `<circle cx="${x(index)}" cy="${y(point[series.key])}" r="3.5" class="${series.className}-point"><title>${label}: ${money(point[series.key])}</title></circle>`;
    }).join('');
    return `<polyline points="${coordinates}" class="${series.className}"></polyline>${markers}`;
  }).join('');
  const middle = Math.floor((points.length - 1) / 2);
  const yearLabels = [...new Set([0, middle, points.length - 1])].map(index => {
    const label = index === 0 ? 'Start' : `Year ${points[index].year}`;
    return `<text x="${x(index)}" y="${plot.bottom + 22}" text-anchor="${index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}" class="chart-axis-label">${label}</text>`;
  }).join('');
  const chart = document.querySelector('#chart');
  chart.setAttribute('aria-label', `${result.chartTitle}. Final projected value ${money(result.schedule[result.schedule.length - 1].balance)}; ${result.chartSeries[1]} ${money(result.schedule[result.schedule.length - 1].invested)}.`);
  chart.innerHTML = `<svg viewBox="0 0 640 210" role="img" aria-hidden="true" focusable="false">${grid}${lines}${yearLabels}</svg>`;
}

function renderResult(result) {
  document.querySelector('#result-label').textContent = result.label;
  document.querySelector('#result-value').textContent = money(result.value);
  document.querySelector('#result-breakdown').innerHTML = result.breakdown.map(([label, amount]) => `
    <div class="breakdown-item"><span>${label}</span><strong>${money(amount)}</strong></div>
  `).join('');
  document.querySelector('#result-breakdown').classList.toggle('trade-breakdown', activeTool === 'crypto');
  renderChart(result);
  document.querySelector('#schedule-head').innerHTML = `<tr>${result.columns.map(column => `<th scope="col">${column}</th>`).join('')}</tr>`;
  document.querySelector('#schedule-body').innerHTML = result.schedule.map(row => `
    <tr><td>${row.year}</td><td>${money(row.invested)}</td><td>${money(row.balance)}</td></tr>
  `).join('');
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
