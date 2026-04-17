# Phase 3: Dashboard & Visualização

## Phase Goal
Criar dashboard interativo com resumos financeiros, gráficos e insights visuais.

## Requirements
- REQ-003: Dashboard & Visualização

## Entry State
- Estrutura UI pronta
- CRUD de transações funcionando
- Dados persistindo no LocalStorage

## Success Criteria
- [ ] Dashboard mostra resumo em tempo real
- [ ] Gráficos renderizam corretamente
- [ ] Filtros de período funcionam
- [ ] Animações não causam jank

## Plans

### Plan 3.1: Resumo Financeiro
**Complexity:** Medium  
**Estimated Time:** 3-4 horas

**Scope:** Cards com saldo, receitas, despesas e meta.

**Key Deliverables:**
1. Cards estilizados no dashboard
2. Cálculos em tempo real
3. Animação de contagem

**HTML:**
```html
<section id="dashboard" class="section">
  <h1>Dashboard</h1>
  
  <div class="summary-cards grid grid--4">
    <div class="card card--highlight" id="card-balance">
      <div class="card-label">Saldo Total</div>
      <div class="card-value" id="total-balance">R$ 0,00</div>
    </div>
    
    <div class="card card--income" id="card-income">
      <div class="card-label">Receitas (Mês)</div>
      <div class="card-value" id="month-income">R$ 0,00</div>
      <div class="card-delta" id="income-delta"></div>
    </div>
    
    <div class="card card--expense" id="card-expense">
      <div class="card-label">Despesas (Mês)</div>
      <div class="card-value" id="month-expense">R$ 0,00</div>
      <div class="card-delta" id="expense-delta"></div>
    </div>
    
    <div class="card card--goal" id="card-goal">
      <div class="card-label">Meta Mensal</div>
      <div class="card-value" id="goal-progress">0%</div>
      <div class="progress-bar">
        <div class="progress-bar__fill" id="goal-bar"></div>
      </div>
    </div>
  </div>
  
  <!-- Charts and recent transactions -->
  <div class="dashboard-grid">
    <!-- ... -->
  </div>
</section>
```

**JavaScript:**
```javascript
// js/dashboard.js
import Storage from './storage.js';
import { formatCurrency } from './utils.js';

class Dashboard {
  constructor() {
    this.periodFilter = 'month'; // 'today', 'week', 'month', 'year', 'all'
    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.update();
  }

  cacheElements() {
    this.elements = {
      balance: document.getElementById('total-balance'),
      income: document.getElementById('month-income'),
      expense: document.getElementById('month-expense'),
      incomeDelta: document.getElementById('income-delta'),
      expenseDelta: document.getElementById('expense-delta'),
      goalProgress: document.getElementById('goal-progress'),
      goalBar: document.getElementById('goal-bar')
    };
  }

  bindEvents() {
    // Listen for transaction changes
    window.addEventListener('transactionChanged', () => this.update());
    
    // Period filter buttons
    document.querySelectorAll('[data-period]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.periodFilter = e.target.dataset.period;
        this.update();
      });
    });
  }

  update() {
    const transactions = this.getFilteredTransactions();
    const calculations = this.calculate(transactions);
    
    this.render(calculations);
  }

  getFilteredTransactions() {
    const all = Storage.getTransactions();
    const now = new Date();
    
    return all.filter(t => {
      const tDate = new Date(t.date);
      
      switch (this.periodFilter) {
        case 'today':
          return tDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
          return tDate >= weekAgo;
        case 'month':
          return tDate.getMonth() === now.getMonth() && 
                 tDate.getFullYear() === now.getFullYear();
        case 'year':
          return tDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }

  calculate(transactions) {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    
    // Get previous period for comparison
    const prevCalculations = this.calculatePreviousPeriod();
    const incomeDelta = prevCalculations.income > 0 
      ? ((income - prevCalculations.income) / prevCalculations.income * 100).toFixed(1)
      : 0;
    const expenseDelta = prevCalculations.expense > 0
      ? ((expense - prevCalculations.expense) / prevCalculations.expense * 100).toFixed(1)
      : 0;
    
    // Goal progress
    const settings = Storage.getSettings();
    const goalPercent = settings.monthlyGoal > 0
      ? Math.min(100, Math.round((income - expense) / settings.monthlyGoal * 100))
      : 0;
    
    return { income, expense, balance, incomeDelta, expenseDelta, goalPercent };
  }

  calculatePreviousPeriod() {
    // Simplified - implement based on current periodFilter
    return { income: 0, expense: 0 };
  }

  render({ income, expense, balance, incomeDelta, expenseDelta, goalPercent }) {
    // Animate values
    this.animateValue(this.elements.balance, balance);
    this.animateValue(this.elements.income, income);
    this.animateValue(this.elements.expense, expense);
    
    // Deltas
    if (this.elements.incomeDelta) {
      this.elements.incomeDelta.textContent = 
        incomeDelta > 0 ? `+${incomeDelta}%` : `${incomeDelta}%`;
      this.elements.incomeDelta.className = `card-delta ${incomeDelta >= 0 ? 'positive' : 'negative'}`;
    }
    
    if (this.elements.expenseDelta) {
      this.elements.expenseDelta.textContent = 
        expenseDelta > 0 ? `+${expenseDelta}%` : `${expenseDelta}%`;
      this.elements.expenseDelta.className = `card-delta ${expenseDelta <= 0 ? 'positive' : 'negative'}`;
    }
    
    // Goal
    if (this.elements.goalProgress) {
      this.elements.goalProgress.textContent = `${goalPercent}%`;
    }
    if (this.elements.goalBar) {
      this.elements.goalBar.style.width = `${goalPercent}%`;
      this.elements.goalBar.className = `progress-bar__fill ${goalPercent >= 100 ? 'success' : ''}`;
    }
  }

  animateValue(element, target) {
    if (!element) return;
    
    const current = parseCurrency(element.textContent) || 0;
    const duration = 500;
    const start = performance.now();
    
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const value = current + (target - current) * easeOut;
      element.textContent = formatCurrency(value);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
}
```

**Definition of Done:**
- [ ] Cards mostram valores corretos
- [ ] Animação de contagem suave
- [ ] Deltas calculados corretamente
- [ ] Barra de meta funciona

---

### Plan 3.2: Gráfico de Despesas (Donut)
**Complexity:** High  
**Estimated Time:** 4-5 horas

**Scope:** Gráfico donut mostrando despesas por categoria.

**Key Deliverables:**
1. Canvas-based donut chart
2. Legenda interativa
3. Tooltip no hover
4. Animação de entrada

**HTML:**
```html
<div class="card chart-card">
  <h3>Despesas por Categoria</h3>
  <div class="chart-container">
    <canvas id="expenses-chart" width="300" height="300"></canvas>
    <div class="chart-legend" id="expenses-legend"></div>
  </div>
</div>
```

**JavaScript:**
```javascript
// js/charts.js
import Storage from './storage.js';

class DonutChart {
  constructor(canvasId, data) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.data = data;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
    this.radius = Math.min(this.centerX, this.centerY) - 20;
    this.innerRadius = this.radius * 0.6;
    
    this.animationProgress = 0;
    this.hoveredSegment = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.animate();
  }

  bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredSegment = null;
      this.draw();
    });
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate angle from center
    const dx = x - this.centerX;
    const dy = y - this.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < this.innerRadius || distance > this.radius) {
      this.hoveredSegment = null;
      this.canvas.style.cursor = 'default';
    } else {
      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += Math.PI * 2;
      
      // Find segment
      let currentAngle = -Math.PI / 2;
      const total = this.data.reduce((sum, d) => sum + d.value, 0);
      
      for (let i = 0; i < this.data.length; i++) {
        const sliceAngle = (this.data[i].value / total) * Math.PI * 2;
        
        // Normalize angle to start from -PI/2
        let normalizedAngle = angle + Math.PI / 2;
        if (normalizedAngle < 0) normalizedAngle += Math.PI * 2;
        if (normalizedAngle > Math.PI * 2) normalizedAngle -= Math.PI * 2;
        
        if (normalizedAngle >= currentAngle && normalizedAngle < currentAngle + sliceAngle) {
          this.hoveredSegment = i;
          this.canvas.style.cursor = 'pointer';
          break;
        }
        
        currentAngle += sliceAngle;
      }
    }
    
    this.draw();
  }

  animate() {
    const duration = 1000;
    const start = performance.now();
    
    const step = (now) => {
      const elapsed = now - start;
      this.animationProgress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - this.animationProgress, 3);
      this.draw(eased);
      
      if (this.animationProgress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  }

  draw(progress = 1) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const total = this.data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = -Math.PI / 2;
    
    this.data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * Math.PI * 2 * progress;
      const isHovered = this.hoveredSegment === index;
      const radius = isHovered ? this.radius + 5 : this.radius;
      
      // Draw segment
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, radius, currentAngle, currentAngle + sliceAngle);
      this.ctx.arc(this.centerX, this.centerY, this.innerRadius, currentAngle + sliceAngle, currentAngle, true);
      this.ctx.closePath();
      
      this.ctx.fillStyle = item.color;
      this.ctx.fill();
      
      // Border
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Label for larger segments
      if (sliceAngle > 0.3 && progress === 1) {
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelRadius = (this.radius + this.innerRadius) / 2;
        const labelX = this.centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = this.centerY + Math.sin(labelAngle) * labelRadius;
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px system-ui';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${Math.round(item.value / total * 100)}%`, labelX, labelY);
      }
      
      currentAngle += sliceAngle;
    });
    
    // Center text
    if (progress === 1) {
      this.ctx.fillStyle = '#333';
      this.ctx.font = 'bold 16px system-ui';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Total', this.centerX, this.centerY - 8);
      
      this.ctx.font = '14px system-ui';
      this.ctx.fillText(
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total),
        this.centerX, 
        this.centerY + 12
      );
    }
  }
}

// Helper to create chart from transactions
export const createExpensesChart = (transactions) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const categories = Storage.getCategories();
  
  const data = categories
    .filter(c => c.type === 'expense' || c.type === 'both')
    .map(cat => {
      const value = expenses
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        label: cat.name,
        value,
        color: cat.color
      };
    })
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5
  
  // Add "Outros" if there are more
  const top5Total = data.reduce((sum, d) => sum + d.value, 0);
  const allTotal = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  if (allTotal > top5Total) {
    data.push({
      label: 'Outros',
      value: allTotal - top5Total,
      color: '#94a3b8'
    });
  }
  
  return new DonutChart('expenses-chart', data);
};
```

**Definition of Done:**
- [ ] Donut chart renderiza
- [ ] Animação de entrada suave
- [ ] Hover destaca segmento
- [ ] Top 5 categorias + "Outros"
- [ ] Valor total no centro

---

### Plan 3.3: Gráfico de Evolução (Bar Chart)
**Complexity:** High  
**Estimated Time:** 4-5 horas

**Scope:** Gráfico de barras mostrando evolução mensal.

**Key Deliverables:**
1. Bar chart com receitas e despesas
2. Últimos 6 meses
3. Hover para valores
4. Animação de entrada

**HTML:**
```html
<div class="card chart-card">
  <h3>Evolução Mensal</h3>
  <canvas id="trend-chart" width="600" height="300"></canvas>
</div>
```

**JavaScript:**
```javascript
// js/charts.js (continued)

class BarChart {
  constructor(canvasId, data) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.data = data; // [{ month, income, expense }, ...]
    
    this.padding = { top: 40, right: 20, bottom: 60, left: 80 };
    this.chartWidth = this.canvas.width - this.padding.left - this.padding.right;
    this.chartHeight = this.canvas.height - this.padding.top - this.padding.bottom;
    
    this.animationProgress = 0;
    
    this.init();
  }

  init() {
    this.animate();
  }

  animate() {
    const duration = 800;
    const start = performance.now();
    
    const step = (now) => {
      const elapsed = now - start;
      this.animationProgress = Math.min(elapsed / duration, 1);
      
      const eased = 1 - Math.pow(1 - this.animationProgress, 3);
      this.draw(eased);
      
      if (this.animationProgress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  }

  draw(progress = 1) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const maxValue = Math.max(
      ...this.data.map(d => Math.max(d.income, d.expense))
    ) * 1.1; // 10% padding
    
    // Draw grid lines
    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5; i++) {
      const y = this.padding.top + (this.chartHeight / 5) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding.left, y);
      this.ctx.lineTo(this.canvas.width - this.padding.right, y);
      this.ctx.stroke();
      
      // Y-axis labels
      const value = maxValue * (1 - i / 5);
      this.ctx.fillStyle = '#64748b';
      this.ctx.font = '12px system-ui';
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        this.formatCurrencyShort(value),
        this.padding.left - 10,
        y
      );
    }
    
    // Draw bars
    const barGroupWidth = this.chartWidth / this.data.length;
    const barWidth = barGroupWidth * 0.35;
    const gap = barGroupWidth * 0.1;
    
    this.data.forEach((item, index) => {
      const x = this.padding.left + barGroupWidth * index + barGroupWidth / 2;
      
      // Income bar (green)
      const incomeHeight = (item.income / maxValue) * this.chartHeight * progress;
      const incomeY = this.padding.top + this.chartHeight - incomeHeight;
      
      this.ctx.fillStyle = '#22c55e';
      this.roundRect(x - barWidth - gap / 2, incomeY, barWidth, incomeHeight, 4);
      this.ctx.fill();
      
      // Expense bar (red)
      const expenseHeight = (item.expense / maxValue) * this.chartHeight * progress;
      const expenseY = this.padding.top + this.chartHeight - expenseHeight;
      
      this.ctx.fillStyle = '#ef4444';
      this.roundRect(x + gap / 2, expenseY, barWidth, expenseHeight, 4);
      this.ctx.fill();
      
      // X-axis labels
      this.ctx.fillStyle = '#64748b';
      this.ctx.font = '12px system-ui';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(item.month, x, this.canvas.height - this.padding.bottom + 10);
    });
    
    // Legend
    this.drawLegend();
  }

  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.lineTo(x, y + height);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  drawLegend() {
    const legendY = 20;
    const items = [
      { label: 'Receitas', color: '#22c55e' },
      { label: 'Despesas', color: '#ef4444' }
    ];
    
    let x = this.canvas.width / 2 - 80;
    
    items.forEach(item => {
      // Color box
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(x, legendY - 6, 12, 12);
      
      // Label
      this.ctx.fillStyle = '#334155';
      this.ctx.font = '12px system-ui';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(item.label, x + 20, legendY);
      
      x += 80;
    });
  }

  formatCurrencyShort(value) {
    if (value >= 1000) {
      return `R$${(value / 1000).toFixed(1)}k`;
    }
    return `R$${value.toFixed(0)}`;
  }
}

// Helper to create trend chart
export const createTrendChart = (transactions) => {
  // Group by month
  const monthly = {};
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('pt-BR', { month: 'short' });
    
    if (!monthly[key]) {
      monthly[key] = { month: label, income: 0, expense: 0 };
    }
    
    if (t.type === 'income') {
      monthly[key].income += t.amount;
    } else {
      monthly[key].expense += t.amount;
    }
  });
  
  // Get last 6 months
  const data = Object.values(monthly).slice(-6);
  
  return new BarChart('trend-chart', data);
};
```

**Definition of Done:**
- [ ] Barras renderizam para cada mês
- [ ] Receitas (verde) e despesas (vermelho)
- [ ] Eixos e grid visíveis
- [ ] Animação de crescimento
- [ ] Legendas claras

---

### Plan 3.4: Transações Recentes e Filtros
**Complexity:** Low-Medium  
**Estimated Time:** 2-3 horas

**Scope:** Lista de transações recentes e filtros de período.

**Key Deliverables:**
1. Lista das últimas 5 transações
2. Botões de filtro de período
3. Atualização em tempo real

**HTML:**
```html
<div class="card">
  <div class="card-header">
    <h3>Transações Recentes</h3>
    <div class="period-filters">
      <button class="btn btn--sm active" data-period="today">Hoje</button>
      <button class="btn btn--sm" data-period="week">Semana</button>
      <button class="btn btn--sm" data-period="month">Mês</button>
    </div>
  </div>
  <div id="recent-transactions" class="recent-list">
    <!-- JS populated -->
  </div>
  <a href="#transactions" class="btn btn--ghost btn--full">Ver Todas</a>
</div>
```

**Definition of Done:**
- [ ] Lista mostra últimas 5 transações
- [ ] Filtros atualizam dashboard
- [ ] Botão leva à página completa

---

## Exit State
- Dashboard completo com todos os widgets
- Gráficos donut e bar chart funcionando
- Filtros de período operacionais
- Animações suaves implementadas
- Dados atualizam em tempo real

## UAT Items
- [ ] Adicionar transação → dashboard atualiza automaticamente
- [ ] Mudar filtro → todos os widgets atualizam
- [ ] Gráficos responsivos (redimensionam)
- [ ] Animações em 60fps

## Notes
- Canvas API nativa (sem Chart.js ou bibliotecas externas)
- Gráficos responsivos (resize listener)
- Performance: throttle em cálculos pesados
