window.FinanceCalculatorEngine = (() => {
  function finiteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function sip({ monthly, rate, years, inflation = 0 }) {
    monthly = finiteNumber(monthly);
    rate = finiteNumber(rate);
    years = finiteNumber(years);
    inflation = finiteNumber(inflation);
    if ([monthly, rate, years, inflation].includes(null)) throw new Error('Enter valid numeric values.');
    if (monthly < 0 || rate < -100 || rate > 100 || years < 0 || inflation < 0) {
      throw new Error('One or more SIP values are outside the supported range.');
    }

    const months = years * 12;
    const monthlyRate = rate / 1200;
    const invested = monthly * months;
    const futureValue = monthlyRate === 0
      ? invested
      : monthly * Math.expm1(months * Math.log1p(monthlyRate)) / monthlyRate;
    const inflationAdjusted = futureValue / ((1 + inflation / 100) ** years);

    return {
      label: 'Estimated future value',
      value: futureValue,
      breakdown: [
        ['Total contributions', invested],
        ['Estimated growth', futureValue - invested],
        ['Inflation-adjusted value', inflationAdjusted]
      ]
    };
  }

  function compound({ principal, rate, years }) {
    [principal, rate, years] = [principal, rate, years].map(finiteNumber);
    if ([principal, rate, years].includes(null)) throw new Error('Enter valid numeric values.');
    if (principal < 0 || rate < -100 || rate > 100 || years < 0) {
      throw new Error('One or more compound-interest values are outside the supported range.');
    }
    const futureValue = principal * ((1 + rate / 100) ** years);
    return {
      label: 'Estimated future value',
      value: futureValue,
      breakdown: [['Initial amount', principal], ['Estimated interest', futureValue - principal]]
    };
  }

  function crypto({ buyPrice, sellPrice, quantity, fees, taxRate }) {
    [buyPrice, sellPrice, quantity, fees, taxRate] = [buyPrice, sellPrice, quantity, fees, taxRate].map(finiteNumber);
    if ([buyPrice, sellPrice, quantity, fees, taxRate].includes(null)) throw new Error('Enter valid numeric values.');
    if ([buyPrice, sellPrice, quantity, fees].some(value => value < 0) || taxRate < 0 || taxRate > 100) {
      throw new Error('One or more crypto-trade values are outside the supported range.');
    }
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

  function lumpSum({ principal, rate, years }) {
    [principal, rate, years] = [principal, rate, years].map(finiteNumber);
    if ([principal, rate, years].includes(null)) throw new Error('Enter valid numeric values.');
    if (principal < 0 || rate < -100 || rate > 100 || years < 0) {
      throw new Error('One or more lump-sum values are outside the supported range.');
    }
    const futureValue = principal * ((1 + rate / 100) ** years);
    return {
      label: 'Estimated future value',
      value: futureValue,
      breakdown: [['Amount invested', principal], ['Estimated growth', futureValue - principal]]
    };
  }

  function inflation({ amount, inflation, years }) {
    [amount, inflation, years] = [amount, inflation, years].map(finiteNumber);
    if ([amount, inflation, years].includes(null)) throw new Error('Enter valid numeric values.');
    if (amount < 0 || inflation < 0 || inflation > 100 || years < 0) {
      throw new Error('One or more inflation values are outside the supported range.');
    }
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

  return { sip, compound, crypto, lumpSum, inflation };
})();
