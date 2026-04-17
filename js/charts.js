/* ============================================
   CHARTS.JS - Canvas-based Charts
   ============================================ */

import Storage from './storage.js';

/**
 * Donut Chart for expenses by category
 */
class DonutChart {
  constructor(canvasId, data) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.data = data;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
    this.radius = Math.min(this.centerX, this.centerY) - 30;
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
      this.canvas.style.cursor = 'default';
      this.draw();
    });
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - this.centerX;
    const dy = y - this.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < this.innerRadius || distance > this.radius) {
      this.hoveredSegment = null;
      this.canvas.style.cursor = 'default';
    } else {
      let angle = Math.atan2(dy, dx);
      // Normalize to 0-2π starting from top
      angle = angle + Math.PI / 2;
      if (angle < 0) angle += Math.PI * 2;
      
      // Find segment
      let currentAngle = 0;
      const total = this.data.reduce((sum, d) => sum + d.value, 0);
      
      for (let i = 0; i < this.data.length; i++) {
        const sliceAngle = (this.data[i].value / total) * Math.PI * 2;
        
        if (angle >= currentAngle && angle < currentAngle + sliceAngle) {
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
    const duration = 800;
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
    let currentAngle = -Math.PI / 2; // Start from top
    
    this.data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * Math.PI * 2 * progress;
      const isHovered = this.hoveredSegment === index;
      const radius = isHovered ? this.radius + 8 : this.radius;
      
      // Draw segment
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, radius, currentAngle, currentAngle + sliceAngle);
      this.ctx.arc(this.centerX, this.centerY, this.innerRadius, currentAngle + sliceAngle, currentAngle, true);
      this.ctx.closePath();
      
      this.ctx.fillStyle = item.color;
      this.ctx.fill();
      
      // White border between segments
      this.ctx.strokeStyle = getComputedStyle(document.body).backgroundColor || '#ffffff';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      
      // Label for larger segments
      if (sliceAngle > 0.4 && progress === 1) {
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelRadius = (this.radius + this.innerRadius) / 2;
        const labelX = this.centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = this.centerY + Math.sin(labelAngle) * labelRadius;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 11px system-ui';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${Math.round(item.value / total * 100)}%`, labelX, labelY);
      }
      
      currentAngle += sliceAngle;
    });
    
    // Center text
    if (progress === 1) {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      this.ctx.fillStyle = isDark ? '#e2e8f0' : '#334155';
      this.ctx.font = 'bold 14px system-ui';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Total', this.centerX, this.centerY - 12);
      
      const settings = Storage.getSettings();
      this.ctx.font = '12px system-ui';
      this.ctx.fillText(
        new Intl.NumberFormat(settings.locale, {
          style: 'currency',
          currency: settings.currency,
          maximumFractionDigits: 0
        }).format(total),
        this.centerX, 
        this.centerY + 10
      );
    }
  }
}

/**
 * Bar Chart for monthly trend
 */
class BarChart {
  constructor(canvasId, data) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.data = data; // [{ month, income, expense }, ...]
    
    this.padding = { top: 40, right: 20, bottom: 50, left: 60 };
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
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    
    const maxValue = Math.max(
      ...this.data.map(d => Math.max(d.income, d.expense))
    ) * 1.1; // 10% padding
    
    // Draw grid lines
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5; i++) {
      const y = this.padding.top + (this.chartHeight / 5) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding.left, y);
      this.ctx.lineTo(this.canvas.width - this.padding.right, y);
      this.ctx.stroke();
      
      // Y-axis labels
      const value = maxValue * (1 - i / 5);
      this.ctx.fillStyle = textColor;
      this.ctx.font = '11px system-ui';
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        this.formatCurrencyShort(value),
        this.padding.left - 8,
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
      this.roundRect(x - barWidth - gap / 2, incomeY, barWidth, incomeHeight, 6);
      this.ctx.fill();
      
      // Expense bar (red)
      const expenseHeight = (item.expense / maxValue) * this.chartHeight * progress;
      const expenseY = this.padding.top + this.chartHeight - expenseHeight;
      
      this.ctx.fillStyle = '#ef4444';
      this.roundRect(x + gap / 2, expenseY, barWidth, expenseHeight, 6);
      this.ctx.fill();
      
      // X-axis labels
      this.ctx.fillStyle = textColor;
      this.ctx.font = '11px system-ui';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(item.month, x, this.canvas.height - this.padding.bottom + 12);
    });
    
    // Legend
    this.drawLegend(isDark);
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

  drawLegend(isDark) {
    const legendY = 20;
    const items = [
      { label: 'Receitas', color: '#22c55e' },
      { label: 'Despesas', color: '#ef4444' }
    ];
    
    let x = this.canvas.width / 2 - 70;
    
    items.forEach(item => {
      // Color box
      this.ctx.fillStyle = item.color;
      this.roundRect(x, legendY - 5, 12, 10, 2);
      this.ctx.fill();
      
      // Label
      this.ctx.fillStyle = isDark ? '#e2e8f0' : '#334155';
      this.ctx.font = '12px system-ui';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(item.label, x + 20, legendY);
      
      x += 80;
    });
  }

  formatCurrencyShort(value) {
    if (value >= 1000000) {
      return `R$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R$${(value / 1000).toFixed(1)}k`;
    }
    return `R$${value.toFixed(0)}`;
  }
}

/**
 * ChartsManager - Main charts controller
 */
class ChartsManager {
  constructor() {
    this.donutChart = null;
    this.barChart = null;
    this.init();
  }

  init() {
    this.render();
    
    // Re-render on transaction changes
    window.addEventListener('transactionChanged', () => {
      this.render();
    });
    
    // Re-render on resize
    window.addEventListener('resize', window.debounce?.(() => {
      this.render();
    }, 250) || (() => this.render()));
    
    // Re-render on theme change
    window.addEventListener('themeChanged', () => {
      this.render();
    });
  }

  render() {
    this.renderExpensesChart();
    this.renderTrendChart();
  }

  renderExpensesChart() {
    const canvas = document.getElementById('expenses-chart');
    if (!canvas) return;
    
    // Get current period transactions
    const now = new Date();
    const transactions = Storage.getTransactions().filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === now.getMonth() && 
             tDate.getFullYear() === now.getFullYear();
    });
    
    const data = this.prepareExpensesData(transactions);
    
    if (data.length === 0) {
      // Show empty message
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = getComputedStyle(document.body).color || '#64748b';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Sem despesas este mês', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    this.donutChart = new DonutChart('expenses-chart', data);
    this.renderLegend(data);
  }

  prepareExpensesData(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categories = Storage.getCategories();
    
    const categoryTotals = {};
    expenses.forEach(t => {
      if (!categoryTotals[t.categoryId]) {
        categoryTotals[t.categoryId] = 0;
      }
      categoryTotals[t.categoryId] += t.amount;
    });
    
    let data = Object.entries(categoryTotals)
      .map(([categoryId, value]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          label: category?.name || 'Sem categoria',
          value,
          color: category?.color || '#94a3b8'
        };
      })
      .sort((a, b) => b.value - a.value);
    
    // Group small categories as "Outros"
    if (data.length > 5) {
      const top5 = data.slice(0, 5);
      const others = data.slice(5);
      const othersValue = others.reduce((sum, d) => sum + d.value, 0);
      
      data = [
        ...top5,
        { label: 'Outros', value: othersValue, color: '#94a3b8' }
      ];
    }
    
    return data;
  }

  renderLegend(data) {
    const legend = document.getElementById('expenses-legend');
    if (!legend) return;
    
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const settings = Storage.getSettings();
    
    legend.innerHTML = data.map(item => {
      const percent = Math.round(item.value / total * 100);
      const value = new Intl.NumberFormat(settings.locale, {
        style: 'currency',
        currency: settings.currency,
        maximumFractionDigits: 0
      }).format(item.value);
      
      return `
        <div class="legend-item">
          <div class="legend-color" style="background-color: ${item.color}"></div>
          <span>${item.label} - ${percent}% (${value})</span>
        </div>
      `;
    }).join('');
  }

  renderTrendChart() {
    const canvas = document.getElementById('trend-chart');
    if (!canvas) return;
    
    const data = this.prepareTrendData();
    
    if (data.length === 0) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = getComputedStyle(document.body).color || '#64748b';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Sem dados suficientes', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    this.barChart = new BarChart('trend-chart', data);
  }

  prepareTrendData() {
    const transactions = Storage.getTransactions();
    
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
    
    // Get last 6 months with data
    const sorted = Object.entries(monthly)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);
    
    return sorted.map(([, data]) => data);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.chartsManager = new ChartsManager();
});

export { DonutChart, BarChart, ChartsManager };
export default ChartsManager;
