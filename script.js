// =======================
// 🔐 LOGIN SYSTEM
// =======================

const USER = "admin";
const PASS = "1234";

function login() {
  const u = document.getElementById("username")?.value;
  const p = document.getElementById("password")?.value;

  if (u === USER && p === PASS) {
    localStorage.setItem("loggedIn", "true");
    window.location.href = "index.html";
  } else {
    const err = document.getElementById("error");
    if (err) err.innerText = "❌ Invalid credentials!";
  }
}

function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "login.html";
}

function checkAuth() {
  const isLoggedIn = localStorage.getItem("loggedIn");

  if (isLoggedIn !== "true") {
    window.location.href = "login.html";
  }
}

// Run on all pages except login
if (!window.location.pathname.includes("login.html")) {
  checkAuth();
}
// =======================
// 📦 GET DATA
// =======================
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

function getSales() {
  return JSON.parse(localStorage.getItem("sales")) || [];
}

// =======================
// ➕ ADD PRODUCT
// =======================
const form = document.getElementById("productForm");

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const category = document.getElementById("category").value;
    const quantity = document.getElementById("quantity").value;
    const price = document.getElementById("price").value;

    if (!name || !category || !quantity || !price) {
      alert("Fill all fields");
      return;
    }

    const products = getProducts();

    products.push({
      id: Date.now(),
      name,
      category,
      quantity: Number(quantity),
      price: Number(price),
      date: new Date().toISOString()
    });

    localStorage.setItem("products", JSON.stringify(products));

    alert("✅ Product added!");
    form.reset();

    refreshUI();
  });
}

// =======================
// 🔄 MASTER REFRESH
// =======================
function refreshUI() {
  loadProducts();
  loadDashboard();
  loadChart();
  loadAnalytics();
  loadSalesChart();
  loadTopCategory();
}

// =======================
// 📦 DISPLAY PRODUCTS
// =======================
function displayProducts(products) {
  const list = document.getElementById("productList");
  if (!list) return;

  list.innerHTML = "";

  products.forEach(p => {
    list.innerHTML += `
      <li>
        <strong>${p.name}</strong> (${p.category})<br>
        Qty: ${p.quantity} | ₹${p.price}
        <br><br>

        <button onclick="editProduct(${p.id})">✏️ Edit</button>
        <button onclick="deleteProduct(${p.id})" style="background:red;">🗑 Delete</button>
        <button onclick="sellProduct(${p.id})" style="background:green;">💰 Sell</button>
      </li>
    `;
  });
}

// =======================
// 🔄 LOAD PRODUCTS
// =======================
function loadProducts() {
  displayProducts(getProducts());
}

// =======================
// 🔍 LIVE SEARCH
// =======================
function liveSearch() {
  const search = document.getElementById("searchInput")?.value.toLowerCase();
  const products = getProducts();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search) ||
    p.category.toLowerCase().includes(search)
  );

  displayProducts(filtered);
}

// =======================
// 🎯 FILTERS
// =======================
function applyFilters() {
  const products = getProducts();

  const category = document.getElementById("filterCategory")?.value;
  const date = document.getElementById("filterDate")?.value;

  let filtered = products;

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  if (date) {
    filtered = filtered.filter(p => {
      const d = new Date(p.date).toISOString().split("T")[0];
      return d === date;
    });
  }

  displayProducts(filtered);
}


// =======================
// ✏️ EDIT PRODUCT
// =======================
function editProduct(id) {
  const products = getProducts();
  const product = products.find(p => p.id === id);

  const newName = prompt("Edit Name", product.name);
  const newQty = prompt("Edit Quantity", product.quantity);
  const newPrice = prompt("Edit Price", product.price);

  if (!newName || !newQty || !newPrice) return;

  product.name = newName;
  product.quantity = Number(newQty);
  product.price = Number(newPrice);

  localStorage.setItem("products", JSON.stringify(products));

  refreshUI();
}

// =======================
// 🗑 DELETE PRODUCT
// =======================
function deleteProduct(id) {
  let products = getProducts();

  products = products.filter(p => p.id !== id);

  localStorage.setItem("products", JSON.stringify(products));

  refreshUI();
}

// =======================
// 💰 SELL PRODUCT (REAL SALES)
// =======================
function sellProduct(id) {
  const products = getProducts();
  const product = products.find(p => p.id === id);

  if (!product) return;

  const qty = prompt("Enter quantity to sell:");

  if (!qty || qty <= 0) return;

  if (qty > product.quantity) {
    alert("❌ Not enough stock!");
    return;
  }

  // reduce stock
  product.quantity -= Number(qty);
  localStorage.setItem("products", JSON.stringify(products));

  // save sale
  const sales = getSales();

  sales.push({
    id: Date.now(),
    productName: product.name,
    category: product.category,
    quantity: Number(qty),
    revenue: Number(qty) * product.price,
    date: new Date().toISOString()
  });

  localStorage.setItem("sales", JSON.stringify(sales));

  alert("✅ Sale recorded!");

  refreshUI();
}

// =======================
// 📊 DASHBOARD
// =======================
function loadDashboard() {
  const products = getProducts();
  const sales = getSales();

  const total = products.length;
  const value = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const lowItems = products.filter(p => p.quantity < 5);
  const revenue = sales.reduce((sum, s) => sum + s.revenue, 0);

  // ✅ SAFE updates (only if element exists)
  const totalEl = document.getElementById("totalProducts");
  if (totalEl) totalEl.innerText = total;

  const valueEl = document.getElementById("totalValue");
  if (valueEl) valueEl.innerText = "₹" + value;

  const lowEl = document.getElementById("lowStock");
  if (lowEl) lowEl.innerText = lowItems.length;

  const salesEl = document.getElementById("sales");
  if (salesEl) salesEl.innerText = "₹" + revenue;

  // =======================
  // 📈 FIXED GROWTH (SAFE)
  // =======================

  let previousRevenue = 0;
  let currentRevenue = 0;

  const now = new Date();
  const mid = new Date();
  mid.setDate(now.getDate() - 3);

  sales.forEach(s => {
    const saleDate = new Date(s.date);
    if (saleDate >= mid) {
      currentRevenue += s.revenue;
    } else {
      previousRevenue += s.revenue;
    }
  });

  const growthEl = document.getElementById("growth");

  if (growthEl) {
    if (previousRevenue === 0 && currentRevenue > 0) {
      growthEl.innerText = "New 🚀";
    } else if (previousRevenue === 0) {
      growthEl.innerText = "0%";
    } else {
      let growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      growthEl.innerText =
        (growth >= 0 ? "+" : "") + growth.toFixed(0) + "%";
    }
  }

  // =======================
  // 🔥 LOW STOCK ALERT SAFE
  // =======================

  const alertBox = document.getElementById("alerts");

  if (alertBox) {
    const grouped = {};

    lowItems.forEach(p => {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p.name);
    });

    let alertHTML = "✅ All good";

    if (lowItems.length > 0) {
      alertHTML = "⚠️ Low Stock:<br>";
      for (let cat in grouped) {
        alertHTML += `<b>${cat}</b> → ${grouped[cat].join(", ")}<br>`;
      }
    }

    alertBox.innerHTML = alertHTML;
  }
}

// =======================
// 📊 INVENTORY CHART
// =======================
let chartInstance = null;

function loadChart() {
  const products = getProducts();

  const categories = {};
  products.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + p.quantity;
  });

  const ctx = document.getElementById("salesChart");
  if (!ctx) return;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        label: "Stock by Category",
        data: Object.values(categories),
        backgroundColor: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"]
      }]
    }
  });
}

// =======================
// 📊 SALES TREND
// =======================
let salesChartInstance = null;

function loadSalesChart() {
  const sales = getSales();

  const daily = {};

  sales.forEach(s => {
    const date = new Date(s.date).toISOString().split("T")[0];
    daily[date] = (daily[date] || 0) + s.revenue;
  });

  const ctx = document.getElementById("salesTrendChart");
  if (!ctx) return;

  if (salesChartInstance) salesChartInstance.destroy();

  salesChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: Object.keys(daily),
      datasets: [{
        label: "Daily Revenue",
        data: Object.values(daily),
        borderColor: "#22c55e",
        fill: false,
        tension: 0.3
      }]
    }
  });
}

// =======================
// 📊 ANALYTICS PAGE
// =======================
let analyticsCharts = [];

function loadAnalytics() {
  const products = getProducts();
  if (products.length === 0) return;

  analyticsCharts.forEach(c => c.destroy());
  analyticsCharts = [];

  const categories = {};
  products.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + p.quantity;
  });

  const ctx1 = document.getElementById("categoryChart");
  if (ctx1) {
    analyticsCharts.push(new Chart(ctx1, {
      type: "pie",
      data: {
        labels: Object.keys(categories),
        datasets: [{
          data: Object.values(categories),
          backgroundColor: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"]
        }]
      }
    }));
  }

  const ctx2 = document.getElementById("priceChart");
  if (ctx2) {
    analyticsCharts.push(new Chart(ctx2, {
      type: "bar",
      data: {
        labels: products.map(p => p.name),
        datasets: [{
          label: "Price",
          data: products.map(p => p.price),
          backgroundColor: "#8b5cf6"
        }]
      }
    }));
  }
}

// =======================
// 🏆 TOP CATEGORY
// =======================
function loadTopCategory() {
  const sales = getSales();

  const map = {};

  sales.forEach(s => {
    map[s.category] = (map[s.category] || 0) + s.revenue;
  });

  let top = "N/A", max = 0;

  for (let cat in map) {
    if (map[cat] > max) {
      max = map[cat];
      top = cat;
    }
  }

  const el = document.getElementById("topCategory");
  if (el) el.innerText = top;
}

// =======================
// 📥 EXPORT
// =======================
function exportToExcel() {
  const products = getProducts();

  if (!products.length) return alert("No data");

  const data = products.map(p => ({
    Name: p.name,
    Category: p.category,
    Quantity: p.quantity,
    Price: p.price,
    Date: new Date(p.date).toLocaleDateString()
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Inventory");
  XLSX.writeFile(wb, "Inventory.xlsx");
}

// =======================
// 🌙 DARK MODE
// =======================
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// =======================
// 🚀 INIT
// =======================
refreshUI();