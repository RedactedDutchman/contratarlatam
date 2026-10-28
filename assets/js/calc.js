/* ContratarLATAM employer-cost estimator. Pure functions; works in browser and Node. */
(function (root) {
  function ar(salary, rates, opts) {
    var it = rates.AR.items;
    var contrib = opts.large ? it.contrib_large.rate : it.contrib_other.rate;
    var art = Math.max(0, Number(opts.artRate || 0)) / 100; // user-supplied ART quote, no default
    var lines = [
      ["Gross monthly salary", salary, null],
      [it.sac_months.label, salary * it.sac_months.value / 12, it.sac_months.source],
    ];
    var base = salary * (12 + it.sac_months.value) / 12; // contributions also apply to SAC
    lines.push([(opts.large ? it.contrib_large.label : it.contrib_other.label) + " (" + (contrib * 100).toFixed(2) + "%)", base * contrib, (opts.large ? it.contrib_large : it.contrib_other).source]);
    lines.push([it.health.label + " (6%)", base * it.health.rate, it.health.source]);
    if (art > 0) lines.push(["ART work-risk insurance (your quote, " + (art * 100).toFixed(2) + "%)", base * art, null]);
    return finish(lines, rates.AR.currency);
  }
  function co(salary, rates, opts) {
    var c = rates.CO, it = c.items;
    var exempt = opts.exempt && salary < 10 * c.smmlv.value;
    var transport = salary <= 2 * c.smmlv.value ? c.transport_allowance.value : 0;
    var lines = [["Gross monthly salary", salary, null]];
    if (transport) lines.push([c.transport_allowance.label, transport, c.transport_allowance.source]);
    ["pension", "health", "arl", "caja", "icbf", "sena"].forEach(function (k) {
      if (exempt && it[k].exemptible) return;
      lines.push([it[k].label + " (" + +(it[k].rate * 100).toFixed(3) + "%)", salary * it[k].rate, it[k].source]);
    });
    // prestaciones: prima, cesantías and interest include transport allowance in base; vacation does not
    ["prima", "cesantias", "int_cesantias"].forEach(function (k) {
      lines.push([it[k].label, (salary + transport) * it[k].rate, it[k].source]);
    });
    lines.push([it.vacaciones.label, salary * it.vacaciones.rate, it.vacaciones.source]);
    var r = finish(lines, c.currency);
    r.exemptApplied = exempt;
    return r;
  }

  function mx(salary, rates, opts) {
    var m = rates.MX, q = m.imss, uma = m.uma_daily.value, days = 365 / 12;
    var daily = salary * 12 / 365;
    var factor = 1 + m.aguinaldo_days.value / 365 + m.vacation_days_year1.value * m.vacation_premium.rate / 365;
    var sbc = Math.min(daily * factor, 25 * uma);
    var risk = opts.riskRate == null || opts.riskRate === "" ? q.risk_min : Number(opts.riskRate) / 100;
    var isn = opts.isnRate == null || opts.isnRate === "" ? m.isn_example.rate : Number(opts.isnRate) / 100;
    var rcv = 0, units = sbc / uma, b = m.rcv_2026.bands;
    if (sbc <= m.min_wage_daily.value) rcv = b[0][1]; else for (var i = 1; i < b.length; i++) { if (units <= b[i][0]) { rcv = b[i][1]; break; } }
    var aguinaldo = daily * m.aguinaldo_days.value / 12, prima = daily * m.vacation_days_year1.value * m.vacation_premium.rate / 12;
    var S = q.source, pct = function (r) { return " (" + +(r * 100).toFixed(3) + "%)"; };
    var lines = [["Gross monthly salary", salary, null],
      ["Aguinaldo, 15 days a year (monthly accrual)", aguinaldo, m.aguinaldo_days.source],
      ["Vacation premium, 25% of 12 first-year vacation days (monthly accrual)", prima, m.vacation_premium.source],
      ["IMSS sickness & maternity fixed quota (20.40% of UMA per day)", q.fixed_quota_uma * uma * days, S],
      ["IMSS sickness & maternity, excess over 3 UMA" + pct(q.excess_over_3uma), q.excess_over_3uma * Math.max(0, sbc - 3 * uma) * days, S],
      ["IMSS cash benefits" + pct(q.cash_benefits), q.cash_benefits * sbc * days, S],
      ["IMSS pensioners' medical expenses" + pct(q.pensioners_medical), q.pensioners_medical * sbc * days, S],
      ["IMSS disability & life" + pct(q.disability_life), q.disability_life * sbc * days, S],
      ["IMSS childcare & social benefits" + pct(q.childcare), q.childcare * sbc * days, S],
      ["Retirement (retiro)" + pct(q.retiro), q.retiro * sbc * days, S],
      ["Old-age (cesantía y vejez), 2026 band" + pct(rcv), rcv * sbc * days, m.rcv_2026.source],
      ["INFONAVIT" + pct(q.infonavit), q.infonavit * sbc * days, S],
      ["Work-risk premium (your rate)" + pct(risk), risk * sbc * days, S],
      ["State payroll tax (your rate)" + pct(isn), isn * (salary + aguinaldo + prima), m.isn_example.source]];
    var r = finish(lines, m.currency); r.sbcDaily = sbc; r.rcvRate = rcv; return r;
  }
  function br(salary, rates, opts) {
    var b = rates.BR;
    var rat = opts.ratRate == null || opts.ratRate === "" ? 0.02 : Number(opts.ratRate) / 100;
    var terc = opts.tercRate == null || opts.tercRate === "" ? b.terceiros_example.rate : Number(opts.tercRate) / 100;
    var thirteenth = salary / 12, bonus = salary * b.vacation_bonus.rate / 12, base = salary + thirteenth + bonus;
    var pct = function (r) { return " (" + +(r * 100).toFixed(2) + "%)"; };
    return finish([["Gross monthly salary", salary, null],
      [b.decimo_terceiro.label + " (monthly accrual)", thirteenth, b.decimo_terceiro.source],
      [b.vacation_bonus.label + " (monthly accrual)", bonus, b.vacation_bonus.source],
      ["INSS employer" + pct(b.inss.rate), b.inss.rate * base, b.inss.source],
      ["RAT (your rate, before FAP)" + pct(rat), rat * base, b.rat.source],
      ["Third-party contributions (your rate)" + pct(terc), terc * base, b.terceiros_example.source],
      ["FGTS" + pct(b.fgts.rate), b.fgts.rate * base, b.fgts.source]], b.currency);
  }
  function cl(salary, rates, opts) {
    var c = rates.CL;
    var grat = opts.gratificacion === false ? 0 : Math.min(salary * c.gratificacion.rate, c.gratificacion.cap_imm_year * c.ingreso_minimo.value / 12);
    var imp = salary + grat, pBase = Math.min(imp, c.tope_afp.value), uBase = Math.min(imp, c.tope_cesantia.value);
    var ces = opts.fixedTerm ? c.cesantia_fixed : c.cesantia_indef;
    var extra = opts.mutualExtra == null || opts.mutualExtra === "" ? 0 : Number(opts.mutualExtra) / 100;
    var lines = [["Gross monthly salary", salary, null]];
    if (grat) lines.push([c.gratificacion.label, grat, c.gratificacion.source]);
    lines.push([c.employer_pension.label, pBase * c.employer_pension.rate, c.employer_pension.source]);
    lines.push([ces.label + " (" + ces.rate * 100 + "%)", uBase * ces.rate, ces.source]);
    lines.push(["Work-accident insurance, base 0.90%" + (extra ? " + your additional " + (extra * 100).toFixed(2) + "%" : ""), pBase * (c.ley16744_base.rate + extra), c.ley16744_base.source]);
    return finish(lines, c.currency);
  }
  function finish(lines, currency) {
    var total = lines.reduce(function (s, l) { return s + l[1]; }, 0);
    return { currency: currency, lines: lines.map(function (l) { return { label: l[0], monthly: l[1], source: l[2] }; }), monthlyTotal: total, annualTotal: total * 12 };
  }
  var api = { estimate: function (country, salary, rates, opts) {
    salary = Number(salary); opts = opts || {};
    if (!(salary > 0)) throw new Error("salary must be positive");
    if (country === "AR") return ar(salary, rates, opts);
    if (country === "CO") return co(salary, rates, opts);
    if (country === "MX") return mx(salary, rates, opts);
    if (country === "BR") return br(salary, rates, opts);
    if (country === "CL") return cl(salary, rates, opts);
    throw new Error("No calculator for " + country);
  } };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.CLCalc = api;
})(this);
