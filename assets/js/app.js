(function () {
  var BASE = document.documentElement.getAttribute("data-base") || "/contratarlatam/";
  function fmt(n, cur) { return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n) + " " + cur; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function getJSON(p) { return fetch(BASE + p).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }

  var form = document.getElementById("calc");
  if (form) getJSON("data/rates.json").then(function (rates) {
    var out = document.getElementById("calc-out");
    function sync() {
      var c = form.country.value;
      form.querySelectorAll("[data-only]").forEach(function (el) { el.hidden = el.getAttribute("data-only") !== c; });
    }
    function run(e) {
      if (e) e.preventDefault(); sync();
      try {
        var r = CLCalc.estimate(form.country.value, form.salary.value, rates, { large: form.large.checked, artRate: form.art.value, exempt: form.exempt.checked, riskRate: form.risk.value, isnRate: form.isn.value, ratRate: form.rat.value, tercRate: form.terc.value, gratificacion: form.grat.checked, fixedTerm: form.fixed.checked, mutualExtra: form.mutual.value });
        var rows = r.lines.map(function (l) { return "<tr><td>" + esc(l.label) + (l.source ? ' <a href="' + esc(l.source) + '" rel="nofollow noopener" target="_blank">[source]</a>' : "") + '</td><td class="num">' + fmt(l.monthly, r.currency) + "</td></tr>"; }).join("");
        out.innerHTML = "<table><thead><tr><th>Component (monthly equivalent)</th><th class=num>Amount</th></tr></thead><tbody>" + rows +
          '</tbody><tfoot><tr><th>Estimated monthly employer cost</th><th class="num">' + fmt(r.monthlyTotal, r.currency) + '</th></tr><tr><th>Estimated annual employer cost</th><th class="num">' + fmt(r.annualTotal, r.currency) + "</th></tr></tfoot></table>" +
          '<p class="small">Estimate only, built from the cited statutory rates as of ' + esc(rates.as_of) + ". Excludes EOR fees, benefits, overtime, severance and anything not listed. Not legal or tax advice.</p>";
      } catch (err) { out.innerHTML = '<p class="small">Enter a positive monthly salary.</p>'; }
    }
    form.addEventListener("input", run); form.addEventListener("submit", run); run();
  });

  var tbl = document.getElementById("providers");
  if (tbl) getJSON("data/providers.json").then(function (d) {
    var sel = document.getElementById("country-filter"), body = tbl.querySelector("tbody");
    function render() {
      var c = sel.value;
      var list = d.providers.filter(function (p) { return !c || p.latam_verified.indexOf(c) >= 0; });
      body.innerHTML = list.map(function (p) {
        var cov = p.latam_verified.length ? p.latam_verified.map(function (k) { return '<a href="' + esc(p.latam_sources[k]) + '" rel="nofollow noopener" target="_blank">' + k + "</a>"; }).join(", ") : "Not verified";
        return "<tr><td><a href=\"" + esc(p.website) + "\" rel=\"nofollow noopener\" target=\"_blank\"><strong>" + esc(p.name) + "</strong></a></td>" +
          "<td>" + esc(p.eor_price_text) + ' <a class="src" href="' + esc(p.price_source) + '" rel="nofollow noopener" target="_blank">source</a><br><span class="small">as of ' + esc(p.as_of) + "</span></td>" +
          "<td>" + esc(p.countries_claim) + "<br><span class=small>LATAM pages: " + cov + "</span></td>" +
          "<td>" + esc(p.contractor) + ' <a class="src" href="' + esc(p.contractor_source) + '" rel="nofollow noopener" target="_blank">source</a></td>' +
          "<td>" + esc(p.notes) + "</td></tr>";
      }).join("") || '<tr><td colspan="5">No provider with a verified page for this country yet.</td></tr>';
      document.getElementById("count").textContent = list.length;
    }
    sel.addEventListener("change", render); render();
  });
})();
