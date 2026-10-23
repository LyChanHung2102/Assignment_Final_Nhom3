

const CanvasChartEngine = {
  canvas: null,
  ctx: null,
  tooltipEl: null,
  chartData: [],
  renderedPoints: [],
  padding: { top: 35, right: 25, bottom: 45, left: 50 },

  init(canvasId, tooltipId) {
    this.canvas = document.getElementById(canvasId);
    this.tooltipEl = document.getElementById(tooltipId);

    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.bindEvents();
  },

  bindEvents() {
    if (!this.canvas) return;

    
    const handlePointerMove = (e) => {
      if (this.renderedPoints.length === 0) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      
      let closestPoint = null;
      let minDistance = Infinity;

      this.renderedPoints.forEach((point) => {
        const dist = Math.abs(point.x - mouseX);
        if (dist < minDistance && dist < 45) {
          minDistance = dist;
          closestPoint = point;
        }
      });

      if (closestPoint) {
        this.showTooltip(closestPoint, rect);
      } else {
        this.hideTooltip();
      }
    };

    this.canvas.addEventListener('mousemove', handlePointerMove);
    this.canvas.addEventListener('touchmove', handlePointerMove, { passive: true });

    this.canvas.addEventListener('mouseleave', () => this.hideTooltip());
    this.canvas.addEventListener('touchend', () => this.hideTooltip());

    
    window.addEventListener('resize', () => {
      if (this.chartData.length > 0) {
        this.render(this.chartData);
      }
    });
  },

  showTooltip(point, rect) {
    if (!this.tooltipEl) return;

    const bodyFatText = point.data.bodyFat ? `• Body Fat: <strong style="color: #946414;">${point.data.bodyFat}%</strong>` : '';
    const noteText = point.data.note ? `<div style="font-size: 0.72rem; color: #829087; margin-top: 3px;">"${point.data.note}"</div>` : '';

    this.tooltipEl.innerHTML = `
      <div style="font-weight: 700; color: #173F35; margin-bottom: 4px; font-size: 0.78rem;">
        📅 ${this.formatDisplayDate(point.data.date)}
      </div>
      <div style="display: flex; flex-direction: column; gap: 2px; font-size: 0.75rem; color: #202B28;">
        <div>Cân nặng thực tế: <strong style="color: #63756B;">${point.data.rawWeight} kg</strong> ${bodyFatText}</div>
        <div>Trung bình 7 ngày (7DMA): <strong style="color: #173F35;">${point.data.movingAverage} kg</strong></div>
        ${noteText}
      </div>
    `;

    this.tooltipEl.style.display = 'block';

    
    const tooltipWidth = this.tooltipEl.offsetWidth || 180;
    let posX = point.x - tooltipWidth / 2;
    if (posX < 10) posX = 10;
    if (posX + tooltipWidth > rect.width - 10) posX = rect.width - tooltipWidth - 10;

    let posY = point.y - 75;
    if (posY < 10) posY = point.y + 20;

    this.tooltipEl.style.left = `${posX}px`;
    this.tooltipEl.style.top = `${posY}px`;
  },

  hideTooltip() {
    if (this.tooltipEl) {
      this.tooltipEl.style.display = 'none';
    }
  },

  formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return dateStr;
  },

  
  render(data) {
    if (!this.canvas) return;
    this.chartData = data || [];
    if (this.chartData.length === 0) return;

    const ctx = this.ctx;
    const canvas = this.canvas;
    const dpr = window.devicePixelRatio || 1;

    
    const displayWidth = canvas.parentElement.clientWidth || 600;
    const displayHeight = 280;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    ctx.resetTransform ? ctx.resetTransform() : ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const pad = this.padding;
    const plotWidth = displayWidth - pad.left - pad.right;
    const plotHeight = displayHeight - pad.top - pad.bottom;

    
    const allWeights = [];
    this.chartData.forEach(d => {
      allWeights.push(d.rawWeight);
      if (d.movingAverage) allWeights.push(d.movingAverage);
    });

    const minVal = Math.floor(Math.min(...allWeights) - 0.8);
    const maxVal = Math.ceil(Math.max(...allWeights) + 0.8);
    const range = (maxVal - minVal) || 1;

    
    const count = this.chartData.length;
    const stepX = count > 1 ? plotWidth / (count - 1) : plotWidth / 2;

    this.renderedPoints = this.chartData.map((d, i) => {
      const x = count > 1 ? pad.left + i * stepX : pad.left + plotWidth / 2;
      const yRaw = pad.top + plotHeight - ((d.rawWeight - minVal) / range) * plotHeight;
      const yMA = pad.top + plotHeight - ((d.movingAverage - minVal) / range) * plotHeight;
      return { x, y: yMA, yRaw, data: d };
    });

    
    this.drawGridAndAxes(ctx, displayWidth, displayHeight, pad, minVal, maxVal, range);

    
    this.drawAreaGradient(ctx, this.renderedPoints, pad, plotHeight);

    
    this.drawRawWeightLine(ctx, this.renderedPoints);

    
    this.drawMovingAverageCurve(ctx, this.renderedPoints);

    
    this.drawDataPoints(ctx, this.renderedPoints);
  },

  drawGridAndAxes(ctx, width, height, pad, minVal, maxVal, range) {
    const steps = 4;
    ctx.font = '11px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= steps; i++) {
      const val = minVal + (range / steps) * i;
      const y = pad.top + (height - pad.top - pad.bottom) - (i / steps) * (height - pad.top - pad.bottom);

      
      ctx.beginPath();
      ctx.strokeStyle = '#DDE3D9';
      ctx.lineWidth = 1;
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();

      
      ctx.fillStyle = '#63756B';
      ctx.fillText(`${val.toFixed(1)}kg`, pad.left - 10, y);
    }

    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const totalPoints = this.renderedPoints.length;
    const labelInterval = Math.max(1, Math.floor(totalPoints / 6));

    this.renderedPoints.forEach((p, idx) => {
      if (idx % labelInterval === 0 || idx === totalPoints - 1) {
        ctx.fillStyle = '#63756B';
        ctx.fillText(this.formatDisplayDate(p.data.date), p.x, height - pad.bottom + 10);
      }
    });
  },

  drawAreaGradient(ctx, points, pad, plotHeight) {
    if (points.length < 2) return;

    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotHeight);
    gradient.addColorStop(0, 'rgba(23, 63, 53, 0.12)');
    gradient.addColorStop(0.7, 'rgba(57, 120, 102, 0.04)');
    gradient.addColorStop(1, 'rgba(23, 63, 53, 0.0)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, pad.top + plotHeight);
    ctx.lineTo(points[0].x, points[0].y);

    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }

    ctx.lineTo(points[points.length - 1].x, pad.top + plotHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();
  },

  drawRawWeightLine(ctx, points) {
    if (points.length === 0) return;

    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(99, 117, 107, 0.55)';
    ctx.lineWidth = 1.5;

    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.yRaw);
      else ctx.lineTo(p.x, p.yRaw);
    });
    ctx.stroke();

    
    ctx.setLineDash([]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(99, 117, 107, 0.7)';
      ctx.arc(p.x, p.yRaw, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  },

  drawMovingAverageCurve(ctx, points) {
    if (points.length < 2) return;

    ctx.save();
    ctx.beginPath();

    
    const strokeGrad = ctx.createLinearGradient(points[0].x, 0, points[points.length - 1].x, 0);
    strokeGrad.addColorStop(0, '#173F35');
    strokeGrad.addColorStop(1, '#397866');

    ctx.strokeStyle = strokeGrad;
    ctx.lineWidth = 3;

    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }

    ctx.stroke();
    ctx.restore();
  },

  drawDataPoints(ctx, points) {
    
    if (points.length === 0) return;
    const latest = points[points.length - 1];

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = '#173F35';
    ctx.arc(latest.x, latest.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.arc(latest.x, latest.y, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
};


const HealthDashboardChart = {
  canvas: null,
  ctx: null,
  tooltipEl: null,
  renderedPoints: [],
  targetWeight: null,
  allEntries: [],
  currentRange: 'all', 
  padding: { top: 35, right: 30, bottom: 45, left: 55 },

  init(canvasId, tooltipId, targetWeight = null) {
    this.canvas = document.getElementById(canvasId);
    this.tooltipEl = document.getElementById(tooltipId);
    this.targetWeight = Number(targetWeight) || null;

    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.bindEvents();
  },

  setTargetWeight(weight) {
    this.targetWeight = Number(weight) || null;
  },

  bindEvents() {
    if (!this.canvas) return;

    const handlePointerMove = (e) => {
      if (this.renderedPoints.length === 0) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      let closestPoint = null;
      let minDistance = Infinity;

      this.renderedPoints.forEach((point) => {
        const dist = Math.abs(point.x - mouseX);
        if (dist < minDistance && dist < 45) {
          minDistance = dist;
          closestPoint = point;
        }
      });

      if (closestPoint) {
        this.showTooltip(closestPoint, rect);
      } else {
        this.hideTooltip();
      }
    };

    this.canvas.addEventListener('mousemove', handlePointerMove);
    this.canvas.addEventListener('touchmove', handlePointerMove, { passive: true });
    this.canvas.addEventListener('mouseleave', () => this.hideTooltip());
    this.canvas.addEventListener('touchend', () => this.hideTooltip());

    window.addEventListener('resize', () => {
      if (this.allEntries.length > 0) {
        this.render(this.allEntries, this.currentRange);
      }
    });
  },

  showTooltip(point, rect) {
    if (!this.tooltipEl) return;

    const data = point.data;
    let targetDiffHtml = '';
    if (this.targetWeight) {
      const diff = (data.weight - this.targetWeight).toFixed(1);
      const diffText = diff > 0 ? `+${diff} kg so với mục tiêu` : diff < 0 ? `${diff} kg so với mục tiêu` : 'Đạt đúng mục tiêu!';
      const color = Math.abs(diff) <= 0.2 ? '#287653' : '#63756B';
      targetDiffHtml = `<div style="font-size: 0.73rem; color: ${color}; margin-top: 2px;">🎯 ${diffText}</div>`;
    }

    const noteHtml = data.note ? `<div style="font-size: 0.72rem; color: #829087; margin-top: 4px; font-style: italic;">"${data.note}"</div>` : '';

    this.tooltipEl.innerHTML = `
      <div style="font-weight: 700; color: #173F35; margin-bottom: 4px; font-size: 0.78rem;">
        📅 ${this.formatDisplayDate(data.date)}
      </div>
      <div style="font-size: 0.85rem; color: #202B28;">
        Cân nặng: <strong style="color: #173F35; font-size: 0.95rem;">${Number(data.weight).toFixed(1)} kg</strong>
      </div>
      ${targetDiffHtml}
      ${noteHtml}
    `;

    this.tooltipEl.style.display = 'block';

    const canvasWidth = this.canvas.clientWidth;
    let leftPos = point.x + 12;
    if (leftPos + 170 > canvasWidth) {
      leftPos = point.x - 175;
    }

    this.tooltipEl.style.left = `${Math.max(10, leftPos)}px`;
    this.tooltipEl.style.top = `${Math.max(10, point.y - 45)}px`;
  },

  hideTooltip() {
    if (this.tooltipEl) {
      this.tooltipEl.style.display = 'none';
    }
  },

  formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  },

  filterByRange(entries, range) {
    if (!entries || entries.length === 0) return [];
    const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    if (range === '7d') {
      return sorted.slice(-7);
    } else if (range === '30d') {
      return sorted.slice(-30);
    }
    return sorted;
  },

  render(rawEntries, range = 'all') {
    if (!this.canvas || !this.ctx) return;
    this.allEntries = rawEntries || [];
    this.currentRange = range;

    const entries = this.filterByRange(this.allEntries, range);

    
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.parentElement.clientWidth || 600;
    const height = Math.max(260, Math.min(320, width * 0.42));

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    const ctx = this.ctx;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (entries.length === 0) {
      ctx.fillStyle = '#829087';
      ctx.font = '500 13px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Chưa có bản ghi cân nặng nào trong khoảng thời gian này.', width / 2, height / 2);
      this.renderedPoints = [];
      return;
    }

    
    let weights = entries.map(e => Number(e.weight)).filter(w => !isNaN(w));
    if (this.targetWeight) {
      weights.push(this.targetWeight);
    }

    const minWeight = Math.floor(Math.min(...weights) - 1.5);
    const maxWeight = Math.ceil(Math.max(...weights) + 1.5);
    const weightSpan = Math.max(2, maxWeight - minWeight);

    const pad = this.padding;
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;

    
    const getX = (index) => {
      if (entries.length === 1) return pad.left + chartW / 2;
      return pad.left + (index / (entries.length - 1)) * chartW;
    };
    const getY = (val) => pad.top + (1 - (val - minWeight) / weightSpan) * chartH;

    
    ctx.strokeStyle = '#DDE3D9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#63756B';
    ctx.font = '500 11px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'right';

    const yStep = Math.max(1, Math.round(weightSpan / 4));
    for (let w = minWeight; w <= maxWeight; w += yStep) {
      const yPos = getY(w);
      ctx.beginPath();
      ctx.moveTo(pad.left, yPos);
      ctx.lineTo(width - pad.right, yPos);
      ctx.stroke();
      ctx.fillText(`${w} kg`, pad.left - 8, yPos + 4);
    }

    
    if (this.targetWeight && this.targetWeight >= minWeight && this.targetWeight <= maxWeight) {
      const targetY = getY(this.targetWeight);
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#287653';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(pad.left, targetY);
      ctx.lineTo(width - pad.right, targetY);
      ctx.stroke();

      ctx.fillStyle = '#287653';
      ctx.font = '600 10.5px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Mục tiêu: ${this.targetWeight} kg`, pad.left + 8, targetY - 6);
      ctx.restore();
    }

    
    this.renderedPoints = entries.map((entry, idx) => ({
      x: getX(idx),
      y: getY(Number(entry.weight)),
      data: entry
    }));

    
    if (this.renderedPoints.length > 1) {
      ctx.save();
      const areaGrad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
      areaGrad.addColorStop(0, 'rgba(23, 63, 53, 0.16)');
      areaGrad.addColorStop(1, 'rgba(23, 63, 53, 0.01)');
      ctx.fillStyle = areaGrad;

      ctx.beginPath();
      ctx.moveTo(this.renderedPoints[0].x, pad.top + chartH);
      ctx.lineTo(this.renderedPoints[0].x, this.renderedPoints[0].y);
      for (let i = 1; i < this.renderedPoints.length; i++) {
        ctx.lineTo(this.renderedPoints[i].x, this.renderedPoints[i].y);
      }
      ctx.lineTo(this.renderedPoints[this.renderedPoints.length - 1].x, pad.top + chartH);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    
    ctx.save();
    ctx.strokeStyle = '#173F35';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(this.renderedPoints[0].x, this.renderedPoints[0].y);
    for (let i = 1; i < this.renderedPoints.length; i++) {
      ctx.lineTo(this.renderedPoints[i].x, this.renderedPoints[i].y);
    }
    ctx.stroke();
    ctx.restore();

    
    ctx.font = '500 10.5px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#63756B';

    const stepLabel = Math.max(1, Math.ceil(this.renderedPoints.length / 7));

    this.renderedPoints.forEach((p, idx) => {
      
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = '#FFFFFF';
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = '#173F35';
      ctx.lineWidth = 2.2;
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      
      if (idx % stepLabel === 0 || idx === this.renderedPoints.length - 1) {
        const parts = p.data.date.split('-');
        const label = parts.length === 3 ? `${parts[2]}/${parts[1]}` : p.data.date;
        ctx.fillText(label, p.x, height - 12);
      }
    });
  }
};

window.CanvasChartEngine = CanvasChartEngine;
window.HealthDashboardChart = HealthDashboardChart;


const ProgressChartEngine = {
  canvas: null,
  ctx: null,
  tooltipEl: null,
  renderedPoints: [],
  currentMetric: 'weight', 
  targetWeight: null,
  filteredEntries: [],
  padding: { top: 40, right: 35, bottom: 45, left: 55 },

  init(canvasId, tooltipId) {
    this.canvas = document.getElementById(canvasId);
    this.tooltipEl = document.getElementById(tooltipId);

    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.bindEvents();
  },

  setTargetWeight(weight) {
    this.targetWeight = Number(weight) || null;
  },

  bindEvents() {
    if (!this.canvas) return;

    const handlePointer = (e) => {
      if (this.renderedPoints.length === 0) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      let closest = null;
      let minDist = Infinity;

      this.renderedPoints.forEach((pt) => {
        const dist = Math.abs(pt.x - mouseX);
        if (dist < minDist && dist < 45) {
          minDist = dist;
          closest = pt;
        }
      });

      if (closest) {
        this.showTooltip(closest, rect);
      } else {
        this.hideTooltip();
      }
    };

    this.canvas.addEventListener('mousemove', handlePointer);
    this.canvas.addEventListener('touchmove', handlePointer, { passive: true });
    this.canvas.addEventListener('mouseleave', () => this.hideTooltip());
    this.canvas.addEventListener('touchend', () => this.hideTooltip());

    window.addEventListener('resize', () => {
      if (this.filteredEntries.length > 0) {
        this.render(this.filteredEntries, this.currentMetric);
      }
    });
  },

  showTooltip(point, rect) {
    if (!this.tooltipEl) return;

    const item = point.data;
    const isWeight = this.currentMetric === 'weight';
    const valText = isWeight 
      ? `${Number(item.weight).toFixed(1)} kg` 
      : `${item.bmi ? Number(item.bmi).toFixed(1) : '--'} kg/m²`;

    let targetDiffHtml = '';
    if (isWeight && this.targetWeight) {
      const diff = (item.weight - this.targetWeight).toFixed(1);
      const text = diff > 0 ? `+${diff} kg so với mục tiêu` : diff < 0 ? `${diff} kg so với mục tiêu` : 'Đạt mục tiêu!';
      targetDiffHtml = `<div style="font-size: 0.74rem; color: #287653; margin-top: 2px;">🎯 ${text}</div>`;
    } else if (!isWeight && item.bmi) {
      let catText = 'Bình thường';
      let catColor = '#287653';
      if (item.bmi < 18.5) { catText = 'Thiếu cân'; catColor = '#326B82'; }
      else if (item.bmi >= 25 && item.bmi < 30) { catText = 'Thừa cân'; catColor = '#946414'; }
      else if (item.bmi >= 30) { catText = 'Béo phì'; catColor = '#B83E42'; }
      targetDiffHtml = `<div style="font-size: 0.74rem; color: ${catColor}; margin-top: 2px;">🏷️ Phân loại: <strong>${catText}</strong></div>`;
    }

    const noteHtml = item.note ? `<div style="font-size: 0.72rem; color: #829087; margin-top: 4px; font-style: italic;">"${item.note}"</div>` : '';

    this.tooltipEl.innerHTML = `
      <div style="font-weight: 700; color: #173F35; margin-bottom: 4px; font-size: 0.78rem;">
        📅 ${this.formatDisplayDate(item.date)}
      </div>
      <div style="font-size: 0.86rem; color: #202B28;">
        ${isWeight ? 'Cân nặng' : 'Chỉ số BMI'}: <strong style="color: #173F35; font-size: 0.95rem;">${valText}</strong>
      </div>
      ${targetDiffHtml}
      ${noteHtml}
    `;

    this.tooltipEl.style.display = 'block';

    const canvasWidth = this.canvas.clientWidth;
    let leftPos = point.x + 12;
    if (leftPos + 180 > canvasWidth) {
      leftPos = point.x - 185;
    }

    this.tooltipEl.style.left = `${Math.max(10, leftPos)}px`;
    this.tooltipEl.style.top = `${Math.max(10, point.y - 45)}px`;
  },

  hideTooltip() {
    if (this.tooltipEl) {
      this.tooltipEl.style.display = 'none';
    }
  },

  formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const p = dateStr.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dateStr;
  },

  render(entries, metric = 'weight') {
    if (!this.canvas || !this.ctx) return;
    this.filteredEntries = entries || [];
    this.currentMetric = metric;

    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.parentElement.clientWidth || 700;
    const height = Math.max(280, Math.min(360, width * 0.45));

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    const ctx = this.ctx;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (this.filteredEntries.length === 0) {
      ctx.fillStyle = '#829087';
      ctx.font = '500 13px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Không có bản ghi nào trong khoảng thời gian được chọn.', width / 2, height / 2);
      this.renderedPoints = [];
      return;
    }

    const isWeight = metric === 'weight';
    let values = this.filteredEntries.map(e => Number(e[metric])).filter(v => !isNaN(v) && v > 0);

    if (values.length === 0) {
      ctx.fillStyle = '#829087';
      ctx.font = '500 13px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Không đủ dữ liệu số để vẽ biểu đồ.', width / 2, height / 2);
      this.renderedPoints = [];
      return;
    }

    if (isWeight && this.targetWeight) {
      values.push(this.targetWeight);
    } else if (!isWeight) {
      
      values.push(18.5, 25.0);
    }

    const minVal = Math.floor(Math.min(...values) - (isWeight ? 1.5 : 1));
    const maxVal = Math.ceil(Math.max(...values) + (isWeight ? 1.5 : 1));
    const valSpan = Math.max(isWeight ? 2 : 1, maxVal - minVal);

    const pad = this.padding;
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;

    const getX = (idx) => {
      if (this.filteredEntries.length === 1) return pad.left + chartW / 2;
      return pad.left + (idx / (this.filteredEntries.length - 1)) * chartW;
    };
    const getY = (v) => pad.top + (1 - (v - minVal) / valSpan) * chartH;

    
    ctx.strokeStyle = '#DDE3D9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#63756B';
    ctx.font = '500 11px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'right';

    const yStep = Math.max(isWeight ? 1 : 0.5, Math.round((valSpan / 4) * 10) / 10);
    for (let v = minVal; v <= maxVal; v += yStep) {
      const yPos = getY(v);
      ctx.beginPath();
      ctx.moveTo(pad.left, yPos);
      ctx.lineTo(width - pad.right, yPos);
      ctx.stroke();
      ctx.fillText(`${v.toFixed(isWeight ? 0 : 1)} ${isWeight ? 'kg' : ''}`, pad.left - 8, yPos + 4);
    }

    
    if (isWeight && this.targetWeight && this.targetWeight >= minVal && this.targetWeight <= maxVal) {
      const targetY = getY(this.targetWeight);
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#287653';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(pad.left, targetY);
      ctx.lineTo(width - pad.right, targetY);
      ctx.stroke();

      ctx.fillStyle = '#287653';
      ctx.font = '600 10.5px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Mục tiêu: ${this.targetWeight} kg`, pad.left + 8, targetY - 6);
      ctx.restore();
    } else if (!isWeight) {
      
      const drawRef = (thresholdVal, label, color) => {
        if (thresholdVal >= minVal && thresholdVal <= maxVal) {
          const refY = getY(thresholdVal);
          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(pad.left, refY);
          ctx.lineTo(width - pad.right, refY);
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.font = '600 10px "Be Vietnam Pro", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(label, pad.left + 8, refY - 4);
          ctx.restore();
        }
      };

      drawRef(18.5, 'Ngưỡng Thiếu cân (18.5)', '#326B82');
      drawRef(25.0, 'Ngưỡng Thừa cân (25.0)', '#946414');
    }

    
    this.renderedPoints = this.filteredEntries.map((item, idx) => ({
      x: getX(idx),
      y: getY(Number(item[metric])),
      data: item
    }));

    
    if (this.renderedPoints.length > 1) {
      ctx.save();
      const areaGrad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
      areaGrad.addColorStop(0, isWeight ? 'rgba(23, 63, 53, 0.16)' : 'rgba(57, 120, 102, 0.18)');
      areaGrad.addColorStop(1, 'rgba(23, 63, 53, 0.01)');
      ctx.fillStyle = areaGrad;

      ctx.beginPath();
      ctx.moveTo(this.renderedPoints[0].x, pad.top + chartH);
      ctx.lineTo(this.renderedPoints[0].x, this.renderedPoints[0].y);
      for (let i = 1; i < this.renderedPoints.length; i++) {
        ctx.lineTo(this.renderedPoints[i].x, this.renderedPoints[i].y);
      }
      ctx.lineTo(this.renderedPoints[this.renderedPoints.length - 1].x, pad.top + chartH);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    
    ctx.save();
    ctx.strokeStyle = isWeight ? '#173F35' : '#397866';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(this.renderedPoints[0].x, this.renderedPoints[0].y);
    for (let i = 1; i < this.renderedPoints.length; i++) {
      ctx.lineTo(this.renderedPoints[i].x, this.renderedPoints[i].y);
    }
    ctx.stroke();
    ctx.restore();

    
    ctx.font = '500 10.5px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#63756B';

    const stepLabel = Math.max(1, Math.ceil(this.renderedPoints.length / 8));

    this.renderedPoints.forEach((p, idx) => {
      const isStart = idx === 0;
      const isEnd = idx === this.renderedPoints.length - 1;

      
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = isEnd ? '#D2F36B' : (isStart ? '#173F35' : '#FFFFFF');
      ctx.arc(p.x, p.y, isEnd || isStart ? 5.5 : 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = '#173F35';
      ctx.lineWidth = 2;
      ctx.arc(p.x, p.y, isEnd || isStart ? 5.5 : 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      
      if (idx % stepLabel === 0 || isEnd) {
        const parts = p.data.date.split('-');
        const label = parts.length === 3 ? `${parts[2]}/${parts[1]}` : p.data.date;
        ctx.fillText(label, p.x, height - 12);
      }
    });
  }
};

window.ProgressChartEngine = ProgressChartEngine;

const WorkoutChartEngine = {
  canvas: null,
  ctx: null,
  tooltipEl: null,
  renderedBars: [],
  data: [],
  padding: { top: 30, right: 25, bottom: 40, left: 50 },

  init(canvasId, tooltipId) {
    this.canvas = document.getElementById(canvasId);
    this.tooltipEl = document.getElementById(tooltipId);

    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.bindEvents();
  },

  bindEvents() {
    if (!this.canvas) return;

    const handlePointer = (e) => {
      if (this.renderedBars.length === 0) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      let hoveredBar = null;
      this.renderedBars.forEach(b => {
        if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
          hoveredBar = b;
        }
      });

      if (hoveredBar) {
        this.showTooltip(hoveredBar, rect);
      } else {
        this.hideTooltip();
      }
    };

    this.canvas.addEventListener('mousemove', handlePointer);
    this.canvas.addEventListener('touchmove', handlePointer, { passive: true });
    this.canvas.addEventListener('mouseleave', () => this.hideTooltip());
    this.canvas.addEventListener('touchend', () => this.hideTooltip());

    window.addEventListener('resize', () => {
      if (this.data.length > 0) {
        this.render(this.data);
      }
    });
  },

  showTooltip(bar, rect) {
    if (!this.tooltipEl) return;

    const item = bar.data;
    const parts = item.date.split('-');
    const dateFormatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : item.date;

    this.tooltipEl.innerHTML = `
      <div style="font-weight: 700; color: #173F35; margin-bottom: 4px; font-size: 0.78rem;">
        📅 ${dateFormatted}
      </div>
      <div style="font-size: 0.85rem; color: #202B28;">
        Thời lượng: <strong style="color: #173F35; font-size: 0.95rem;">${item.totalMinutes} phút</strong>
      </div>
      <div style="font-size: 0.74rem; color: #63756B; margin-top: 2px;">
        Số buổi tập: ${item.sessionCount} buổi
      </div>
    `;

    this.tooltipEl.style.display = 'block';

    const canvasWidth = this.canvas.clientWidth;
    let leftPos = bar.x + bar.w / 2 - 60;
    if (leftPos + 140 > canvasWidth) leftPos = canvasWidth - 145;
    if (leftPos < 10) leftPos = 10;

    this.tooltipEl.style.left = `${leftPos}px`;
    this.tooltipEl.style.top = `${Math.max(10, bar.y - 45)}px`;
  },

  hideTooltip() {
    if (this.tooltipEl) {
      this.tooltipEl.style.display = 'none';
    }
  },

  render(groupedData) {
    if (!this.canvas || !this.ctx) return;
    this.data = groupedData || [];

    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.parentElement.clientWidth || 600;
    const height = Math.max(220, Math.min(280, width * 0.4));

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    const ctx = this.ctx;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (this.data.length === 0) {
      ctx.fillStyle = '#829087';
      ctx.font = '500 13px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Chưa có dữ liệu tập luyện để hiển thị biểu đồ.', width / 2, height / 2);
      this.renderedBars = [];
      return;
    }

    const maxMinutes = Math.max(60, Math.ceil(Math.max(...this.data.map(d => d.totalMinutes)) / 15) * 15);
    const pad = this.padding;
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;

    
    ctx.strokeStyle = '#DDE3D9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#63756B';
    ctx.font = '500 10.5px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'right';

    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const val = Math.round((maxMinutes / ySteps) * i);
      const y = pad.top + chartH - (val / maxMinutes) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();
      ctx.fillText(`${val}p`, pad.left - 6, y + 4);
    }

    
    const totalBars = this.data.length;
    const slotW = chartW / totalBars;
    const barW = Math.min(36, Math.max(12, slotW * 0.55));
    this.renderedBars = [];

    this.data.forEach((item, idx) => {
      const x = pad.left + idx * slotW + (slotW - barW) / 2;
      const barH = (item.totalMinutes / maxMinutes) * chartH;
      const y = pad.top + chartH - barH;

      
      ctx.save();
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, '#173F35');
      grad.addColorStop(1, '#397866');
      ctx.fillStyle = grad;

      
      const r = Math.min(4, barW / 2);
      ctx.beginPath();
      ctx.moveTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + barH);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      this.renderedBars.push({ x, y, w: barW, h: barH, data: item });

      
      ctx.fillStyle = '#63756B';
      ctx.font = '500 10px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      const parts = item.date.split('-');
      const label = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.date;
      ctx.fillText(label, x + barW / 2, height - 12);
    });
  }
};

window.WorkoutChartEngine = WorkoutChartEngine;

const HealthReportsChartEngine = {
  canvas: null,
  ctx: null,
  tooltipEl: null,
  renderedElements: [],
  padding: { top: 35, right: 30, bottom: 45, left: 55 },

  init(canvasId, tooltipId) {
    this.canvas = document.getElementById(canvasId);
    this.tooltipEl = document.getElementById(tooltipId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.bindEvents();
  },

  bindEvents() {
    if (!this.canvas) return;

    const handlePointer = (e) => {
      if (this.renderedElements.length === 0) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      let closest = null;
      let minDist = Infinity;

      this.renderedElements.forEach((el) => {
        const dist = Math.abs(el.x - mouseX);
        if (dist < minDist && dist < 45) {
          minDist = dist;
          closest = el;
        }
      });

      if (closest) {
        this.showTooltip(closest, rect);
      } else {
        this.hideTooltip();
      }
    };

    this.canvas.addEventListener('mousemove', handlePointer);
    this.canvas.addEventListener('touchmove', handlePointer, { passive: true });
    this.canvas.addEventListener('mouseleave', () => this.hideTooltip());
    this.canvas.addEventListener('touchend', () => this.hideTooltip());
  },

  showTooltip(point, rect) {
    if (!this.tooltipEl) return;
    const item = point.data;

    let targetDiffHtml = '';
    if (point.targetWeight) {
      const diff = (item.weight - point.targetWeight).toFixed(1);
      const text = diff > 0 ? `+${diff} kg so với mục tiêu` : diff < 0 ? `${diff} kg so với mục tiêu` : 'Đạt mục tiêu!';
      targetDiffHtml = `<div style="font-size: 0.73rem; color: #287653; margin-top: 2px;">🎯 ${text}</div>`;
    }

    const bmiHtml = item.bmi ? `<div style="font-size: 0.8rem; color: #63756B;">Chỉ số BMI: <strong style="color: #287653;">${Number(item.bmi).toFixed(1)}</strong></div>` : '';

    this.tooltipEl.innerHTML = `
      <div style="font-weight: 700; color: #173F35; margin-bottom: 4px; font-size: 0.78rem;">
        📅 ${item.date}
      </div>
      <div style="font-size: 0.86rem; color: #202B28;">
        Cân nặng: <strong style="color: #173F35; font-size: 0.95rem;">${Number(item.weight).toFixed(1)} kg</strong>
      </div>
      ${bmiHtml}
      ${targetDiffHtml}
    `;

    this.tooltipEl.style.display = 'block';

    const canvasWidth = this.canvas.clientWidth;
    let leftPos = point.x + 12;
    if (leftPos + 180 > canvasWidth) leftPos = point.x - 185;
    this.tooltipEl.style.left = `${Math.max(10, leftPos)}px`;
    this.tooltipEl.style.top = `${Math.max(10, point.y - 45)}px`;
  },

  hideTooltip() {
    if (this.tooltipEl) {
      this.tooltipEl.style.display = 'none';
    }
  },

  renderWeightReportChart(entries = [], targetWeight = null) {
    if (!this.canvas || !this.ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.parentElement.clientWidth || 600;
    const height = Math.max(240, Math.min(320, width * 0.42));

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    const ctx = this.ctx;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (!entries || entries.length === 0) {
      ctx.fillStyle = '#829087';
      ctx.font = '500 13px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Không có dữ liệu cân nặng trong khoảng thời gian báo cáo.', width / 2, height / 2);
      this.renderedElements = [];
      return;
    }

    const weights = entries.map(e => Number(e.weight)).filter(w => !isNaN(w) && w > 0);
    if (targetWeight) weights.push(targetWeight);

    const minWeight = Math.floor(Math.min(...weights) - 1.5);
    const maxWeight = Math.ceil(Math.max(...weights) + 1.5);
    const weightSpan = Math.max(2, maxWeight - minWeight);

    const pad = this.padding;
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;

    const getX = (idx) => {
      if (entries.length === 1) return pad.left + chartW / 2;
      return pad.left + (idx / (entries.length - 1)) * chartW;
    };
    const getY = (w) => pad.top + (1 - (w - minWeight) / weightSpan) * chartH;

    
    ctx.strokeStyle = '#DDE3D9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#63756B';
    ctx.font = '500 11px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'right';

    const yStep = Math.max(1, Math.round(weightSpan / 4));
    for (let w = minWeight; w <= maxWeight; w += yStep) {
      const yPos = getY(w);
      ctx.beginPath();
      ctx.moveTo(pad.left, yPos);
      ctx.lineTo(width - pad.right, yPos);
      ctx.stroke();
      ctx.fillText(`${w} kg`, pad.left - 8, yPos + 4);
    }

    
    if (targetWeight && targetWeight >= minWeight && targetWeight <= maxWeight) {
      const targetY = getY(targetWeight);
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#287653';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(pad.left, targetY);
      ctx.lineTo(width - pad.right, targetY);
      ctx.stroke();

      ctx.fillStyle = '#287653';
      ctx.font = '600 10.5px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Mục tiêu: ${targetWeight} kg`, pad.left + 8, targetY - 6);
      ctx.restore();
    }

    
    this.renderedElements = entries.map((e, idx) => ({
      x: getX(idx),
      y: getY(Number(e.weight)),
      data: e,
      targetWeight
    }));

    
    if (this.renderedElements.length > 1) {
      ctx.save();
      const areaGrad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
      areaGrad.addColorStop(0, 'rgba(23, 63, 53, 0.16)');
      areaGrad.addColorStop(1, 'rgba(23, 63, 53, 0.01)');
      ctx.fillStyle = areaGrad;

      ctx.beginPath();
      ctx.moveTo(this.renderedElements[0].x, pad.top + chartH);
      ctx.lineTo(this.renderedElements[0].x, this.renderedElements[0].y);
      for (let i = 1; i < this.renderedElements.length; i++) {
        ctx.lineTo(this.renderedElements[i].x, this.renderedElements[i].y);
      }
      ctx.lineTo(this.renderedElements[this.renderedElements.length - 1].x, pad.top + chartH);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    
    ctx.save();
    ctx.strokeStyle = '#173F35';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(this.renderedElements[0].x, this.renderedElements[0].y);
    for (let i = 1; i < this.renderedElements.length; i++) {
      ctx.lineTo(this.renderedElements[i].x, this.renderedElements[i].y);
    }
    ctx.stroke();
    ctx.restore();

    
    ctx.font = '500 10.5px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#63756B';

    const stepLabel = Math.max(1, Math.ceil(this.renderedElements.length / 7));
    this.renderedElements.forEach((p, idx) => {
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = '#FFFFFF';
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = '#173F35';
      ctx.lineWidth = 2.2;
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (idx % stepLabel === 0 || idx === this.renderedElements.length - 1) {
        const parts = p.data.date.split('-');
        const label = parts.length === 3 ? `${parts[2]}/${parts[1]}` : p.data.date;
        ctx.fillText(label, p.x, height - 12);
      }
    });
  }
};

window.HealthReportsChartEngine = HealthReportsChartEngine;
