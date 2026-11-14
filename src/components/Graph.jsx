import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { axisBottom, axisLeft, line, pointer, scaleLinear, select, zoom, zoomIdentity } from 'd3'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { createEvaluator } from '../math/solver'

export default function Graph({ expression = '(x^2-4)/(x-2)', variable = 'x', point = 2, result = 4, functionValue, compact = false }) {
  const svgRef = useRef(null)
  const zoomRef = useRef(null)
  const id = useId().replaceAll(':', '')
  const [hover, setHover] = useState(null)
  const [distance, setDistance] = useState(0.35)
  const evaluator = useMemo(() => { try { return createEvaluator(expression, variable) } catch { return null } }, [expression, variable])
  const a = Number.isFinite(point) ? point : 0
  const finiteLimit = Number.isFinite(result) ? result : null
  const actual = functionValue !== undefined ? functionValue : evaluator?.(a)
  useEffect(() => {
    if (!evaluator) return
    const svg = select(svgRef.current)
    svg.selectAll('*').remove()
    const w = 620, h = compact ? 255 : 340
    const margin = { top: 24, right: 28, bottom: 35, left: 45 }
    const center = finiteLimit ?? evaluator(a + 0.5) ?? 0
    const baseX = scaleLinear().domain([a - 3.5, a + 3.5]).range([margin.left, w - margin.right])
    const baseY = scaleLinear().domain([center - 4, center + 4]).range([h - margin.bottom, margin.top])
    const clip = svg.append('defs').append('clipPath').attr('id', id)
    clip.append('rect').attr('x', margin.left).attr('y', margin.top).attr('width', w - margin.left - margin.right).attr('height', h - margin.top - margin.bottom)
    const gridX = svg.append('g').attr('class', 'graph-grid')
    const gridY = svg.append('g').attr('class', 'graph-grid')
    const xAxis = svg.append('g').attr('class', 'graph-axis')
    const yAxis = svg.append('g').attr('class', 'graph-axis')
    const plot = svg.append('g').attr('clip-path', `url(#${id})`)
    const hitbox = svg.append('rect').attr('x', margin.left).attr('y', margin.top).attr('width', w - margin.left - margin.right).attr('height', h - margin.top - margin.bottom).attr('fill', 'transparent')
    const draw = transform => {
      const x = transform.rescaleX(baseX), y = transform.rescaleY(baseY)
      const bottom = h - margin.bottom, right = w - margin.right
      gridX.attr('transform', `translate(0,${bottom})`).call(axisBottom(x).ticks(7).tickSize(-(bottom - margin.top)).tickFormat(''))
      gridY.attr('transform', `translate(${margin.left},0)`).call(axisLeft(y).ticks(6).tickSize(-(right - margin.left)).tickFormat(''))
      xAxis.attr('transform', `translate(0,${Math.max(margin.top, Math.min(bottom, y(0)))})`).call(axisBottom(x).ticks(6).tickSize(0).tickPadding(10))
      yAxis.attr('transform', `translate(${Math.max(margin.left, Math.min(right, x(0)))},0)`).call(axisLeft(y).ticks(6).tickSize(0).tickPadding(9))
      plot.selectAll('*').remove()
      if (Number.isFinite(point)) {
        plot.append('line').attr('x1', x(a)).attr('x2', x(a)).attr('y1', margin.top).attr('y2', bottom).attr('stroke', 'var(--theme-graph-guide)').attr('stroke-dasharray', '5 5')
        if (finiteLimit !== null) plot.append('line').attr('x1', margin.left).attr('x2', right).attr('y1', y(finiteLimit)).attr('y2', y(finiteLimit)).attr('stroke', 'var(--theme-graph-limit)').attr('stroke-dasharray', '4 5')
      }
      const [xmin, xmax] = x.domain()
      const data = Array.from({ length: 901 }, (_, i) => {
        const px = xmin + (xmax - xmin) * i / 900
        return { x: px, y: evaluator(px) }
      })
      const segments = []
      let segment = []
      for (const item of data) {
        const prev = segment.at(-1)
        const valid = item.y !== null && Math.abs(y(item.y)) < h * 15
        const jump = prev && (Math.abs(y(item.y) - y(prev.y)) > h * 0.65 || (prev.x < a && item.x >= a))
        if (!valid || jump) { if (segment.length > 1) segments.push(segment); segment = [] }
        if (valid) segment.push(item)
      }
      if (segment.length > 1) segments.push(segment)
      const path = line().x(d => x(d.x)).y(d => y(d.y))
      segments.forEach(s => plot.append('path').attr('d', path(s)).attr('fill', 'none').attr('stroke', s[0].x < a ? 'var(--theme-graph-left)' : 'var(--theme-graph-right)').attr('stroke-width', compact ? 3 : 2.7).attr('stroke-linecap', 'round'))
      if (Number.isFinite(point) && finiteLimit !== null && (!Number.isFinite(actual) || Math.abs(actual - finiteLimit) > 1e-9)) plot.append('circle').attr('cx', x(a)).attr('cy', y(finiteLimit)).attr('r', 6).attr('fill', 'var(--theme-surface)').attr('stroke', 'var(--theme-graph-limit)').attr('stroke-width', 2.5)
      if (Number.isFinite(point) && Number.isFinite(actual)) plot.append('circle').attr('cx', x(a)).attr('cy', y(actual)).attr('r', 4.5).attr('fill', 'var(--theme-graph-value)')
      if (!compact && Number.isFinite(point)) {
        for (const side of [-1, 1]) {
          const px = a + side * distance, py = evaluator(px)
          if (py !== null) plot.append('circle').attr('cx', x(px)).attr('cy', y(py)).attr('r', 4.5).attr('fill', side < 0 ? 'var(--theme-graph-left)' : 'var(--theme-graph-right)').attr('stroke', 'var(--theme-surface)').attr('stroke-width', 2)
        }
      }
      hitbox.on('pointermove', event => {
        const [px] = pointer(event, svg.node()), value = x.invert(px)
        const fy = evaluator(value)
        setHover(fy === null ? null : { x: value, y: fy })
      }).on('pointerleave', () => setHover(null))
    }
    const behavior = zoom().extent([[margin.left, margin.top], [w - margin.right, h - margin.bottom]]).scaleExtent([0.4, 20]).on('zoom', event => draw(event.transform))
    svg.call(behavior).on('dblclick.zoom', null)
    if (compact) svg.on('.zoom', null)
    zoomRef.current = { svg, behavior }
    draw(zoomIdentity)
    return () => { svg.on('.zoom', null) }
  }, [evaluator, a, point, compact, finiteLimit, actual, distance, id])
  if (!evaluator) return <div className="empty-state">برای رسم نمودار، یک تابع معتبر وارد کنید.</div>
  return <div className={`graph-wrap ${compact ? 'compact-graph' : ''}`}>
    {!compact && <div className="graph-topline"><span className="eyebrow">نمودار تعاملی</span><div className="graph-controls" dir="ltr"><button aria-label="بزرگ‌نمایی" onClick={() => zoomRef.current.svg.call(zoomRef.current.behavior.scaleBy, 1.4)}><Plus size={16} /></button><button aria-label="کوچک‌نمایی" onClick={() => zoomRef.current.svg.call(zoomRef.current.behavior.scaleBy, 0.7)}><Minus size={16} /></button><button aria-label="بازنشانی نمودار" onClick={() => zoomRef.current.svg.call(zoomRef.current.behavior.transform, zoomIdentity)}><RotateCcw size={15} /></button></div></div>}
    <svg ref={svgRef} viewBox={`0 0 620 ${compact ? 255 : 340}`} role="img" aria-label={`نمودار تابع ${expression}؛ سمت چپ قهوه‌ای لاته و سمت راست اسپرسو`} dir="ltr" />
    <div className="graph-legend"><span><i className="dot peach" />از چپ</span><span><i className="dot sage" />از راست</span>{finiteLimit !== null && (!Number.isFinite(actual) || Math.abs(actual - finiteLimit) > 1e-9) && <span><i className="dot hollow" />حد در نقطهٔ میل</span>}{!compact && Number.isFinite(actual) && <span><i className="dot sage" />مقدار تابع در نقطه</span>}{!compact && <span className="hover-value" dir="ltr">{hover ? `x: ${hover.x.toFixed(3)}  y: ${hover.y.toFixed(3)}` : 'x ↔ y'}</span>}</div>
    {!compact && Number.isFinite(point) && <div className="approach-slider"><label htmlFor={`distance-${id}`}>نزدیک‌شدن به نقطهٔ میل <span dir="ltr">δ ≈ {distance.toFixed(3)}</span></label><input id={`distance-${id}`} type="range" min="-3" max="0.3" step="0.05" value={Math.log10(distance)} onChange={e => setDistance(10 ** Number(e.target.value))} /><div className="side-values"><span>از چپ <b dir="ltr">{format(evaluator(a - distance))}</b></span><span>از راست <b dir="ltr">{format(evaluator(a + distance))}</b></span></div></div>}
    {!compact && <p className="caption">برای جابه‌جایی بکشید و برای بزرگ‌نمایی از دکمه‌ها استفاده کنید. نمودار نمونه‌برداری‌شده است و اثبات حد نیست.</p>}
  </div>
}

function format(v) { return v === null ? 'تعریف‌نشده' : Number(v.toPrecision(7)).toString() }
