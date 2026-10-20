/**
 * FitVN Tracker - HTML5 Canvas Pure Vanilla Chart Engine
 * Renders 7-Day Moving Average, Raw Weight Fluctuations, Neon Glow and Tooltips
 * Strictly NO external libraries.
 */

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

    // Mouse & Touch Move for Tooltip
    const handlePointerMove = (e) => {
      if (this.renderedPoints.length === 0) return;
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      // Find closest point along X axis
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

    // Window Resize redraw
    window.addEventListener('resize', () => {
      if (this.chartData.length > 0) {
        this.render(this.chartData);
      }
    });
  },

  showTooltip(point, rect) {
    if (!this.tooltipEl) return;

    const bodyFatText = point.data.bodyFat ? `• Body Fat: <strong style="color: #fbbf24;">${point.data.bodyFat}%</strong>` : '';
    const noteText = point.data.note ? `<div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 3px;">"${point.data.note}"</div>` : '';

    this.tooltipEl.innerHTML = `
      <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 4px; font-size: 0.78rem;">
        📅 ${this.formatDisplayDate(point.data.date)}
      </div>
      <div style="display: flex; flex-direction: column; gap: 2px; font-size: 0.75rem;">
        <div>Cân nặng thực tế: <strong style="color: #94a3b8;">${point.data.rawWeight} kg</strong> ${bodyFatText}</div>
        <div>Trung bình 7 ngày (7DMA): <strong style="color: var(--accent-cyan);">${point.data.movingAverage} kg</strong></div>
        ${noteText}
      </div>
    `;

    this.tooltipEl.style.display = 'block';

    // Tooltip position
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

  /**
   * Main Render Method
   * @param {Array} data Calculated Moving Average data
   */
  render(data) {
    if (!this.canvas) return;
    this.chartData = data || [];
    if (this.chartData.length === 0) return;

    const ctx = this.ctx;
    const canvas = this.canvas;
    const dpr = window.devicePixelRatio || 1;

    // Get actual container dimensions
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

    // Calculate Y min & max with buffer
    const allWeights = [];
    this.chartData.forEach(d => {
      allWeights.push(d.rawWeight);
      if (d.movingAverage) allWeights.push(d.movingAverage);
    });

    const minVal = Math.floor(Math.min(...allWeights) - 0.8);
    const maxVal = Math.ceil(Math.max(...allWeights) + 0.8);
    const range = (maxVal - minVal) || 1;

    // Calculate Coordinates
    const count = this.chartData.length;
    const stepX = count > 1 ? plotWidth / (count - 1) : plotWidth / 2;

    this.renderedPoints = this.chartData.map((d, i) => {
      const x = count > 1 ? pad.left + i * stepX : pad.left + plotWidth / 2;
      const yRaw = pad.top + plotHeight - ((d.rawWeight - minVal) / range) * plotHeight;
      const yMA = pad.top + plotHeight - ((d.movingAverage - minVal) / range) * plotHeight;
      return { x, y: yMA, yRaw, data: d };
    });

    // 1. Draw Grid Lines & Y Axis Labels
    this.drawGridAndAxes(ctx, displayWidth, displayHeight, pad, minVal, maxVal, range);

    // 2. Draw Area Fill Under 7DMA Curve (Glass Glow)
    this.drawAreaGradient(ctx, this.renderedPoints, pad, plotHeight);

    // 3. Draw Line 1: Raw Weight (Dashed Subtle Gray with Dot Markers)
    this.drawRawWeightLine(ctx, this.renderedPoints);

    // 4. Draw Line 2: 7-Day Moving Average Curve (Smooth Spline + Neon Glow)
    this.drawMovingAverageCurve(ctx, this.renderedPoints);

    // 5. Draw Highlight Points
    this.drawDataPoints(ctx, this.renderedPoints);
  },

  drawGridAndAxes(ctx, width, height, pad, minVal, maxVal, range) {
    const steps = 4;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= steps; i++) {
      const val = minVal + (range / steps) * i;
      const y = pad.top + (height - pad.top - pad.bottom) - (i / steps) * (height - pad.top - pad.bottom);

      // Grid line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();

      // Y Label
      ctx.fillStyle = '#64748b';
      ctx.fillText(`${val.toFixed(1)}kg`, pad.left - 10, y);
    }

    // X Axis Date Labels (Show spaced labels)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const totalPoints = this.renderedPoints.length;
    const labelInterval = Math.max(1, Math.floor(totalPoints / 6));

    this.renderedPoints.forEach((p, idx) => {
      if (idx % labelInterval === 0 || idx === totalPoints - 1) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(this.formatDisplayDate(p.data.date), p.x, height - pad.bottom + 10);
      }
    });
  },

  drawAreaGradient(ctx, points, pad, plotHeight) {
    if (points.length < 2) return;

    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotHeight);
    gradient.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
    gradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, pad.top + plotHeight);
    ctx.lineTo(points[0].x, points[0].y);

    // Smooth Bézier curve interpolation
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
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 1.5;

    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.yRaw);
      else ctx.lineTo(p.x, p.yRaw);
    });
    ctx.stroke();

    // Small dots for raw daily weights
    ctx.setLineDash([]);
    points.forEach((p) => {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.arc(p.x, p.yRaw, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  },

  drawMovingAverageCurve(ctx, points) {
    if (points.length < 2) return;

    ctx.save();
    ctx.beginPath();

    // Create Neon Gradient Stroke
    const strokeGrad = ctx.createLinearGradient(points[0].x, 0, points[points.length - 1].x, 0);
    strokeGrad.addColorStop(0, '#00f0ff');
    strokeGrad.addColorStop(1, '#10b981');

    ctx.strokeStyle = strokeGrad;
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0, 240, 255, 0.65)';
    ctx.shadowBlur = 12;

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
    // Highlight the latest point with pulsing neon circle
    if (points.length === 0) return;
    const latest = points[points.length - 1];

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = 'rgba(0, 240, 255, 0.9)';
    ctx.shadowBlur = 16;
    ctx.arc(latest.x, latest.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.arc(latest.x, latest.y, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
};

window.CanvasChartEngine = CanvasChartEngine;
