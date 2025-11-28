# Global Health Explorer 🌍📊  

An interactive web application for exploring global health indicators (life expectancy and infant mortality) by country, gender, and time period.

Data is loaded from a Kaggle-style CSV file into SQLite and visualized in a modern dashboard using Chart.js.  
The app is suitable for:

- Exploratory data analysis (EDA)
- Teaching materials and classroom demonstrations
- Quick analytical report generation for assignments, articles, or research

---

## ✨ Key Features

- **Country filters**
  - Select **Country 1** (required) and optional **Country 2** for comparison.
- **Indicator filter**
  - `Life Expectancy`
  - `Infant Mortality Rate`
- **Gender filter**
  - `Both sexes`
  - `Male`
  - `Female`
- **Year range filter**
  - Optional `Start year` and `End year` to focus on a specific period.
- **Data table**
  - Shows `Country`, `Year`, `Gender`, `Life Expectancy`, and `Infant Mortality Rate`.
- **Line chart (Chart.js)**
  - Single-country or two-country comparison over time.
- **Auto-generated analytical insight**
  - Describes trend (upward/downward/stable), magnitude of change, and comparative gaps.
- **Report generator**
  - One-click **“Generate Report Summary”** → ready to paste into Word or a research document.
- **Saved dashboards (SQLite)**
  - Save, reload, and delete dashboard presets.
- **CSV export**
  - Export the currently filtered dataset (1–2 countries) for further analysis in Excel/SPSS/R/etc.

---

## 🧱 Tech Stack

**Frontend**

- HTML5  
- CSS3 (dark-themed dashboard layout)  
- Vanilla JavaScript  
- [Chart.js](https://www.chartjs.org/) for charts  

**Backend**

- Node.js  
- Express.js  

**Database**

- SQLite  
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) as the Node driver  

**Tools**

- DB Browser for SQLite (for importing CSV and inspecting tables)  
- Visual Studio Code (recommended editor)  

---

## 📂 Project Structure

```text
project-root/
├─ index.html          # Main HTML page (UI layout and controls)
├─ style.css           # Styling (dark theme, simple responsive-ish layout)
├─ main.js             # Frontend logic (fetch API, charts, insights, export, reports)
├─ server.js           # Express server + API routes + SQLite connection
├─ global_health.db    # SQLite database (health_data + dashboards)
├─ UnifiedDataset.csv  # Source CSV dataset imported into SQLite
├─ package.json        # Node.js dependencies & scripts
└─ node_modules/       # Installed dependencies (created by npm install)




