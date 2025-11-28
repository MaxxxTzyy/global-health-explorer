let lifeChart = null;
let lastRows1 = [];
let lastRows2 = [];
let lastConfig = null;

// DOM elements
const loadBtn = document.getElementById("load-data");
const countrySelect = document.getElementById("country-select");
const countrySelect2 = document.getElementById("country-select-2");
const indicatorSelect = document.getElementById("indicator-select");
const startYearInput = document.getElementById("start-year");
const endYearInput = document.getElementById("end-year");

const tableHead = document.querySelector("#data-table thead");
const tableBody = document.querySelector("#data-table tbody");
const summaryDiv = document.getElementById("summary");
const insightDiv = document.getElementById("insight");

const dashboardNameInput = document.getElementById("dashboard-name");
const saveDashboardBtn = document.getElementById("save-dashboard-btn");
const dashboardList = document.getElementById("dashboard-list");

const reportBtn = document.getElementById("generate-report");
const reportOutput = document.getElementById("report-output");
const exportBtn = document.getElementById("export-csv")

// =======================
// 1. Load negara & dashboards saat awal
// =======================

loadCountries();
loadDashboards();

// =======================
// 2. Fungsi load negara dari API
// =======================

function loadCountries() {
  fetch("/api/countries")
    .then((res) => res.json())
    .then((countries) => {
      initCountryOptions(countries);
    })
    .catch((err) => {
      console.error(err);
      alert("Gagal memuat daftar negara dari server.");
    });
}

function initCountryOptions(countries) {
  countrySelect.innerHTML = "";
  countrySelect2.innerHTML = "";

  const emptyOpt = document.createElement("option");
  emptyOpt.value = "";
  emptyOpt.textContent = "— (tidak ada) —";
  countrySelect2.appendChild(emptyOpt);

  countries.forEach((c) => {
    const opt1 = document.createElement("option");
    opt1.value = c;
    opt1.textContent = c;
    countrySelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = c;
    opt2.textContent = c;
    countrySelect2.appendChild(opt2);
  });

  const indoOption = Array.from(countrySelect.options).find(
    (o) => o.value === "Indonesia"
  );
  if (indoOption) {
    countrySelect.value = "Indonesia";
  }
}

// =======================
// 3. Ambil data dari API /api/data
// =======================

function loadData(country1, country2, indicator, startYear, endYear) {
  if (!country1) {
    alert("Silakan pilih negara 1 terlebih dahulu.");
    return;
  }

  const params = new URLSearchParams();
  params.append("country1", country1);
  if (country2) params.append("country2", country2);
  if (!Number.isNaN(startYear)) params.append("startYear", startYear);
  if (!Number.isNaN(endYear)) params.append("endYear", endYear);

  fetch("/api/data?" + params.toString())
    .then((res) => res.json())
    .then((data) => {
      const rows1 = data.country1 || [];
      const rows2 = data.country2 || [];

      lastRows1 = rows1;
      lastRows2 = rows2;
      lastConfig = { country1, country2, indicator, startYear, endYear };

      renderTable(rows1);
      renderSummary(rows1, country1, indicator, startYear, endYear);

      if (rows2.length > 0) {
        renderCompareChart(rows1, rows2, country1, country2, indicator);
        renderCompareInsight(
          rows1,
          rows2,
          country1,
          country2,
          indicator,
          startYear,
          endYear
        );
      } else {
        renderSingleChart(rows1, country1, indicator);
        renderSingleInsight(rows1, country1, indicator, startYear, endYear);
      }
    })
    .catch((err) => {
      console.error(err);
      alert("Gagal memuat data dari server.");
    });
}

// =======================
// 4. Tabel & Ringkasan
// =======================

function renderTable(rows) {
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  if (!rows || rows.length === 0) return;

  const columns = ["Year", "Gender", "Life Expectancy", "Infant Mortality Rate"];

  const headerRow = document.createElement("tr");
  columns.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col;
    headerRow.appendChild(th);
  });
  tableHead.appendChild(headerRow);

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    columns.forEach((col) => {
      const td = document.createElement("td");
      td.textContent = row[col];
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

function renderSummary(rows, country, indicator, startYear, endYear) {
  if (!rows || rows.length === 0) {
    summaryDiv.textContent = `Tidak ada data untuk ${country} dengan filter yang dipilih.`;
    return;
  }

  const values = rows
    .map((r) => r[indicator])
    .filter((v) => typeof v === "number");

  const avg =
    values.reduce((sum, v) => sum + v, 0) / values.length;

  const minYear = rows[0].Year;
  const maxYear = rows[rows.length - 1].Year;

  const usedStart = !isNaN(startYear) ? startYear : minYear;
  const usedEnd = !isNaN(endYear) ? endYear : maxYear;

  summaryDiv.textContent =
    `Negara: ${country} | Indikator: ${indicator} | ` +
    `Rentang tahun: ${usedStart}–${usedEnd} | ` +
    `Rata-rata: ${avg.toFixed(2)}`;
}

// =======================
// 5. Chart: single & compare
// =======================

function renderSingleChart(rows, country, indicator) {
  const years = rows.map((r) => r.Year);
  const values = rows.map((r) => r[indicator]);

  const ctx = document.getElementById("life-chart").getContext("2d");

  if (lifeChart) {
    lifeChart.destroy();
  }

  lifeChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label: `${indicator} - ${country}`,
          data: values,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: { display: true, text: "Year" },
        },
        y: {
          title: { display: true, text: indicator },
        },
      },
    },
  });
}

function renderCompareChart(rows1, rows2, country1, country2, indicator) {
  const years = rows1.map((r) => r.Year);

  const vals1 = rows1.map((r) => r[indicator]);
  const vals2 = rows2.map((r) => r[indicator]);

  const ctx = document.getElementById("life-chart").getContext("2d");

  if (lifeChart) {
    lifeChart.destroy();
  }

  lifeChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label: `${indicator} - ${country1}`,
          data: vals1,
        },
        {
          label: `${indicator} - ${country2}`,
          data: vals2,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: "nearest", intersect: false },
      scales: {
        x: {
          title: { display: true, text: "Year" },
        },
        y: {
          title: { display: true, text: indicator },
        },
      },
    },
  });
}

// =======================
// 6. Insight analitis
// =======================

function renderSingleInsight(rows, country, indicator, startYear, endYear) {
  if (!rows || rows.length === 0) {
    insightDiv.textContent = "Tidak ada insight karena data kosong.";
    return;
  }

  const values = rows
    .map((r) => r[indicator])
    .filter((v) => typeof v === "number");
  const years = rows.map((r) => r.Year);

  const firstYear = years[0];
  const lastYear = years[years.length - 1];
  const firstVal = values[0];
  const lastVal = values[values.length - 1];
  const avg =
    values.reduce((sum, v) => sum + v, 0) / values.length;

  const diffAbs = lastVal - firstVal;
  const diffPct =
    firstVal !== 0 ? (diffAbs / firstVal) * 100 : null;

  let trendText;
  if (diffAbs > 0.5) {
    trendText = "mengalami kenaikan";
  } else if (diffAbs < -0.5) {
    trendText = "mengalami penurunan";
  } else {
    trendText = "cenderung stabil";
  }

  let diffPart = "";
  if (diffPct !== null) {
    diffPart = ` sekitar ${diffAbs.toFixed(2)} (${diffPct.toFixed(1)}%).`;
  } else {
    diffPart = ` sebesar ${diffAbs.toFixed(2)}.`;
  }

  const usedStart = !isNaN(startYear) ? startYear : firstYear;
  const usedEnd = !isNaN(endYear) ? endYear : lastYear;

  insightDiv.textContent =
    `${indicator} di ${country} pada rentang tahun ${usedStart}–${usedEnd} ` +
    `${trendText}${diffPart} ` +
    `Rata-rata nilai dalam periode ini adalah ${avg.toFixed(2)}.`;
}

function renderCompareInsight(
  rows1,
  rows2,
  country1,
  country2,
  indicator,
  startYear,
  endYear
) {
  if (!rows1 || !rows2 || rows1.length === 0 || rows2.length === 0) {
    insightDiv.textContent =
      "Data perbandingan tidak cukup untuk membuat insight.";
    return;
  }

  const vals1 = rows1
    .map((r) => r[indicator])
    .filter((v) => typeof v === "number");
  const vals2 = rows2
    .map((r) => r[indicator])
    .filter((v) => typeof v === "number");

  const avg1 =
    vals1.reduce((s, v) => s + v, 0) / vals1.length;
  const avg2 =
    vals2.reduce((s, v) => s + v, 0) / vals2.length;

  const years1 = rows1.map((r) => r.Year);
  const years2 = rows2.map((r) => r.Year);

  const commonYears = years1.filter((y) => years2.includes(y));
  commonYears.sort((a, b) => a - b);

  let gapText = "";
  if (commonYears.length >= 2) {
    const firstCommon = commonYears[0];
    const lastCommon = commonYears[commonYears.length - 1];

    const firstVal1 = rows1.find((r) => r.Year === firstCommon)[indicator];
    const firstVal2 = rows2.find((r) => r.Year === firstCommon)[indicator];
    const lastVal1 = rows1.find((r) => r.Year === lastCommon)[indicator];
    const lastVal2 = rows2.find((r) => r.Year === lastCommon)[indicator];

    const firstGap = firstVal1 - firstVal2;
    const lastGap = lastVal1 - lastVal2;

    if (Math.abs(firstGap - lastGap) < 0.5) {
      gapText = "Jarak antar negara cenderung stabil dari waktu ke waktu.";
    } else if (Math.abs(lastGap) > Math.abs(firstGap)) {
      gapText = "Perbedaan antar negara cenderung makin melebar.";
    } else {
      gapText = "Perbedaan antar negara cenderung makin menyempit.";
    }
  }

  const diffAvg = avg1 - avg2;
  let diffText;

  if (diffAvg > 0.3) {
    diffText =
      `${indicator} rata-rata di ${country1} lebih tinggi ` +
      `sekitar ${diffAvg.toFixed(2)} dibanding ${country2}.`;
  } else if (diffAvg < -0.3) {
    diffText =
      `${indicator} rata-rata di ${country2} lebih tinggi ` +
      `sekitar ${Math.abs(diffAvg).toFixed(2)} dibanding ${country1}.`;
  } else {
    diffText =
      `Rata-rata ${indicator} di ${country1} dan ${country2} relatif mirip.`;
  }

  const start =
    !isNaN(startYear)
      ? startYear
      : Math.max(years1[0], years2[0]);
  const end =
    !isNaN(endYear)
      ? endYear
      : Math.min(
          years1[years1.length - 1],
          years2[years2.length - 1]
        );

  insightDiv.textContent =
    `Perbandingan ${indicator} antara ${country1} dan ${country2} ` +
    `pada rentang tahun ${start}–${end}. ` +
    `Rata-rata ${indicator} ${country1} = ${avg1.toFixed(
      2
    )}, sedangkan ${country2} = ${avg2.toFixed(2)}. ` +
    diffText +
    (gapText ? " " + gapText : "");
}

// =======================
// 7. Simpan & muat dashboards
// =======================

function saveDashboard(data) {
  fetch("/api/dashboards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((err) => {
          throw new Error(err.error || "Gagal menyimpan dashboard");
        });
      }
      return res.json();
    })
    .then(() => {
      dashboardNameInput.value = "";
      loadDashboards();
    })
    .catch((err) => {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan dashboard.");
    });
}

function loadDashboards() {
  fetch("/api/dashboards")
    .then((res) => res.json())
    .then((rows) => {
      dashboardList.innerHTML = "";

      if (!rows || rows.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Belum ada dashboard tersimpan.";
        dashboardList.appendChild(li);
        return;
      }

      rows.forEach((row) => {
        const li = document.createElement("li");
        li.classList.add("dashboard-item");

        const mainDiv = document.createElement("div");
        mainDiv.classList.add("dashboard-main");

        const nameLine = document.createElement("div");
        nameLine.classList.add("dashboard-name-line");
        nameLine.textContent = `${row.name} — ${row.country} — ${row.indicator}`;
        mainDiv.appendChild(nameLine);

        if (row.created_at) {
          const meta = document.createElement("div");
          meta.classList.add("dashboard-meta");
          meta.textContent = row.created_at;
          mainDiv.appendChild(meta);
        }

        // klik bagian kiri = load dashboard
        mainDiv.addEventListener("click", () => {
          countrySelect.value = row.country;
          countrySelect2.value = "";
          indicatorSelect.value = row.indicator;
          startYearInput.value = "";
          endYearInput.value = "";

          loadData(row.country, "", row.indicator, NaN, NaN);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Hapus";
        deleteBtn.classList.add("delete-dashboard-btn");

        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // jangan ikut trigger klik mainDiv

          const ok = confirm(
            `Hapus dashboard "${row.name}" untuk ${row.country}?`
          );
          if (!ok) return;

          fetch(`/api/dashboards/${row.id}`, {
            method: "DELETE",
          })
            .then((res) => {
              if (!res.ok) {
                return res.json().then((err) => {
                  throw new Error(
                    err.error || "Gagal menghapus dashboard"
                  );
                });
              }
            })
            .then(() => {
              loadDashboards();
            })
            .catch((err) => {
              console.error(err);
              alert("Terjadi kesalahan saat menghapus dashboard.");
            });
        });

        li.appendChild(mainDiv);
        li.appendChild(deleteBtn);
        dashboardList.appendChild(li);
      });
    })
    .catch((err) => {
      console.error(err);
    });
}


// =======================
// 8. Generator Ringkasan Laporan
// =======================

function generateReport() {
  if (!lastConfig || !lastRows1.length) {
    alert("Tampilkan data terlebih dahulu sebelum membuat laporan.");
    return;
  }

  const { country1, country2, indicator, startYear, endYear } = lastConfig;
  const summaryText = summaryDiv.textContent || "";
  const insightText = insightDiv.textContent || "";

  let periodeText;
  if (!Number.isNaN(startYear) && !Number.isNaN(endYear)) {
    periodeText = `${startYear}–${endYear}`;
  } else if (!Number.isNaN(startYear)) {
    periodeText = `mulai ${startYear}`;
  } else if (!Number.isNaN(endYear)) {
    periodeText = `hingga ${endYear}`;
  } else {
    const years = lastRows1.map((r) => r.Year);
    if (years.length) {
      periodeText = `${years[0]}–${years[years.length - 1]}`;
    } else {
      periodeText = "(periode tidak diketahui)";
    }
  }

  const paragraf1 =
    `Analisis ini menggunakan data kesehatan global untuk indikator ${indicator.toLowerCase()} ` +
    `di ${country1}${country2 ? " dan " + country2 : ""} pada periode ${periodeText}. ` +
    `Data diolah melalui aplikasi web yang menampilkan tabel, grafik tren, dan insight otomatis berbasis perhitungan statistik deskriptif.`;

  const paragraf2 = insightText;

  let paragraf3 = "";
  if (country2) {
    paragraf3 =
      `Secara umum, perbandingan ini menunjukkan bagaimana dinamika ${indicator.toLowerCase()} di ${country1} dan ${country2} ` +
      `dapat menjadi dasar untuk analisis kebijakan kesehatan, evaluasi program, maupun kajian akademik lebih lanjut.`;
  } else {
    paragraf3 =
      `Temuan ini dapat dimanfaatkan sebagai dasar awal untuk menganalisis dinamika ${indicator.toLowerCase()} di ${country1}, ` +
      `baik dalam konteks kebijakan, program kesehatan, maupun penelitian lanjutan.`;
  }

  const report =
    paragraf1 + "\n\n" +
    summaryText + "\n\n" +
    paragraf2 + "\n\n" +
    paragraf3;

  reportOutput.value = report;
}

function exportCurrentDataToCSV() {
  const rows = [];
  if (lastRows1 && lastRows1.length) rows.push(...lastRows1);
  if (lastRows2 && lastRows2.length) rows.push(...lastRows2);

  if (!rows.length) {
    alert("Tidak ada data untuk diekspor. Tampilkan data dulu.");
    return;
  }

  const columns = [
    "Country",
    "Year",
    "Gender",
    "Life Expectancy",
    "Infant Mortality Rate",
  ];

  const lines = [];
  lines.push(columns.join(","));

  rows.forEach((row) => {
    const line = columns
      .map((col) => {
        let val = row[col];
        if (val === null || val === undefined) val = "";
        const s = String(val).replace(/"/g, '""'); // escape kutip
        return `"${s}"`;
      })
      .join(",");
    lines.push(line);
  });

  const csvContent = lines.join("\r\n");
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  let fileName = "export";
  if (lastConfig) {
    const { country1, country2, indicator, startYear, endYear } = lastConfig;
    const from = !Number.isNaN(startYear) ? startYear : "";
    const to = !Number.isNaN(endYear) ? endYear : "";
    fileName = `${indicator}_${country1}${
      country2 ? "_vs_" + country2 : ""
    }`;
    if (from || to) {
      fileName += `_${from || ""}-${to || ""}`;
    }
  }

  a.href = url;
  a.download = `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


// =======================
// 9. Event listeners
// =======================

loadBtn.addEventListener("click", () => {
  const country1 = countrySelect.value;
  const country2 = countrySelect2.value;
  const indicator = indicatorSelect.value;

  const startYear = parseInt(startYearInput.value, 10);
  const endYear = parseInt(endYearInput.value, 10);

  loadData(country1, country2, indicator, startYear, endYear);
});

saveDashboardBtn.addEventListener("click", () => {
  const name = dashboardNameInput.value.trim();
  const country = countrySelect.value;
  const indicator = indicatorSelect.value;

  if (!name) {
    alert("Nama dashboard tidak boleh kosong.");
    return;
  }

  saveDashboard({ name, country, indicator });
});

loadBtn.addEventListener("click", () => {
  const country1 = countrySelect.value;
  const country2 = countrySelect2.value;
  const indicator = indicatorSelect.value;

  const startYear = parseInt(startYearInput.value, 10);
  const endYear = parseInt(endYearInput.value, 10);

  loadData(country1, country2, indicator, startYear, endYear);
});

saveDashboardBtn.addEventListener("click", () => {
  const name = dashboardNameInput.value.trim();
  const country = countrySelect.value;
  const indicator = indicatorSelect.value;

  if (!name) {
    alert("Nama dashboard tidak boleh kosong.");
    return;
  }

  saveDashboard({ name, country, indicator });
});

reportBtn.addEventListener("click", generateReport);
exportBtn.addEventListener("click", exportCurrentDataToCSV);
