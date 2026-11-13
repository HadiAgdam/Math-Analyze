import { parse } from 'mathjs/number'
import nerdamer from 'nerdamer/nerdamer.core.js'
import 'nerdamer/Algebra.js'

const abs = n => n < 0n ? -n : n
const gcd = (a, b) => b === 0n ? abs(a) : gcd(b, a % b)
function rat(n, d = 1n) {
  n = BigInt(n)
  d = BigInt(d)
  if (!d) throw new Error('تقسیم بر صفر در یک عبارت ثابت مجاز نیست.')
  const g = gcd(n, d)
  const s = d < 0n ? -1n : 1n
  return { n: s * n / g, d: s * d / g }
}
function fromDecimal(value) {
  const s = String(value)
  const match = s.match(/^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i)
  if (!match || s.length > 24) throw new Error('ثابت عددی خارج از دامنهٔ پشتیبانی است.')
  const digits = (match[2] || '0') + (match[3] || '')
  const power = Number(match[4] || 0) - (match[3] || '').length
  if (Math.abs(power) > 30) throw new Error('توان ثابت عددی بیش از حد بزرگ است.')
  return power >= 0 ? rat(BigInt((match[1] || '') + digits) * 10n ** BigInt(power)) : rat(BigInt((match[1] || '') + digits), 10n ** BigInt(-power))
}
const add = (a, b) => rat(a.n * b.d + b.n * a.d, a.d * b.d)
const neg = a => rat(-a.n, a.d)
const sub = (a, b) => add(a, neg(b))
const mul = (a, b) => rat(a.n * b.n, a.d * b.d)
const div = (a, b) => rat(a.n * b.d, a.d * b.n)
const zero = a => a.n === 0n
const number = a => Number(a.n) / Number(a.d)
const rtex = a => a.d === 1n ? String(a.n) : `${a.n < 0n ? '-' : ''}\\frac{${abs(a.n)}}{${a.d}}`
const trim = p => { while (p.length > 1 && zero(p.at(-1))) p.pop(); return p }
const pzero = p => p.length === 1 && zero(p[0])
function padd(a, b) { return trim(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => add(a[i] || rat(0), b[i] || rat(0)))) }
const pneg = a => a.map(neg)
function pmul(a, b) {
  if (a.length + b.length > 42) throw new Error('درجهٔ عبارت بیش از محدودهٔ نسخهٔ اول است.')
  const out = Array.from({ length: a.length + b.length - 1 }, () => rat(0))
  a.forEach((x, i) => b.forEach((y, j) => { out[i + j] = add(out[i + j], mul(x, y)) }))
  return trim(out)
}
const peval = (p, a) => p.reduceRight((v, c) => add(mul(v, a), c), rat(0))
const unwrap = n => n.isParenthesisNode ? unwrap(n.content) : n
const functions = ['sin', 'cos', 'exp', 'log', 'sqrt', 'abs', 'floor']

export function normalize(input) {
  return input.trim().replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632)).replace(/−/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/²/g, '^2').replace(/³/g, '^3').replace(/π/g, 'pi').replace(/∞/g, 'Infinity').replace(/ln\(/g, 'log(')
}

export function parseExpression(input, variable = 'x') {
  if (!/^[a-zA-Z]$/.test(variable) || ['e'].includes(variable)) throw new Error('متغیر باید یک حرف لاتین به‌جز e باشد.')
  const expression = normalize(input).replace(new RegExp(`(\\d)(${variable})\\b`, 'g'), '$1*$2')
  if (!expression || expression.length > 220) throw new Error('عبارت باید بین ۱ تا ۲۲۰ نویسه باشد.')
  let tree
  try { tree = parse(expression) } catch { throw new Error('عبارت معتبر نیست. پرانتزها و علامت‌های عمل را بررسی کنید.') }
  let count = 0
  function validate(node, depth = 0) {
    if (++count > 100 || depth > 18) throw new Error('عبارت بیش از حد پیچیده است.')
    if (node.isParenthesisNode) return validate(node.content, depth + 1)
    if (node.isConstantNode) { fromDecimal(node.value); return }
    if (node.isSymbolNode && [variable, 'pi', 'e'].includes(node.name)) return
    if (node.isFunctionNode && functions.includes(node.fn.name) && node.args.length === 1) { validate(node.args[0], depth + 1); return }
    if (node.isOperatorNode && ['+', '-', '*', '/', '^'].includes(node.op) && node.args.length <= 2) {
      if (node.op === '^') {
        const exponent = normalize(node.args[1].toString())
        if (!/^-?\d+$/.test(exponent) || Math.abs(Number(exponent)) > 12) throw new Error('توان باید عدد صحیحی بین منفی ۱۲ و ۱۲ باشد؛ برای ریشه از sqrt استفاده کنید.')
      }
      node.args.forEach(n => validate(n, depth + 1)); return
    }
    throw new Error('از متغیر انتخاب‌شده، عدد، عمل‌های جبری و sin، cos، exp، log، sqrt، abs یا floor استفاده کنید.')
  }
  validate(tree)
  return { tree, expression, variable, tex: tree.toTex({ parenthesis: 'auto', implicit: 'hide' }) }
}

function asRational(node, variable) {
  node = unwrap(node)
  if (node.isConstantNode) return { p: [fromDecimal(node.value)], q: [rat(1)] }
  if (node.isSymbolNode && node.name === variable) return { p: [rat(0), rat(1)], q: [rat(1)] }
  if (!node.isOperatorNode) return null
  const a = asRational(node.args[0], variable)
  if (!a) return null
  if (pzero(a.q)) throw new Error('یک زیرعبارت در تمام دامنه تقسیم بر صفر دارد.')
  if (node.args.length === 1) return { p: node.op === '-' ? pneg(a.p) : a.p, q: a.q }
  if (node.op === '^') {
    const exponent = Number(node.args[1].toString())
    if (pzero(a.p) && exponent <= 0) throw new Error('توان صفر یا منفیِ عبارتِ همواره صفر، در این حل‌گر تعریف نشده است.')
    let p = [rat(1)], q = [rat(1)]
    for (let k = 0; k < Math.abs(exponent); k++) { p = pmul(p, a.p); q = pmul(q, a.q) }
    return exponent < 0 ? { p: q, q: p } : { p, q }
  }
  const b = asRational(node.args[1], variable)
  if (!b) return null
  if (pzero(b.q) || (node.op === '/' && pzero(b.p))) throw new Error('یک زیرعبارت در تمام دامنه تقسیم بر صفر دارد.')
  if (node.op === '+') return { p: padd(pmul(a.p, b.q), pmul(b.p, a.q)), q: pmul(a.q, b.q) }
  if (node.op === '-') return { p: padd(pmul(a.p, b.q), pneg(pmul(b.p, a.q))), q: pmul(a.q, b.q) }
  if (node.op === '*') return { p: pmul(a.p, b.p), q: pmul(a.q, b.q) }
  if (node.op === '/') return { p: pmul(a.p, b.q), q: pmul(a.q, b.p) }
  return null
}

function realValue(node, variable, at) {
  node = unwrap(node)
  if (node.isConstantNode) return Number(node.value)
  if (node.isSymbolNode) return node.name === variable ? at : node.name === 'pi' ? Math.PI : Math.E
  const args = node.args.map(n => realValue(n, variable, at))
  if (!args.every(Number.isFinite)) return NaN
  if (node.isFunctionNode) {
    const x = args[0]
    return ({ sin: Math.sin, cos: Math.cos, exp: Math.exp, log: Math.log, sqrt: Math.sqrt, abs: Math.abs, floor: Math.floor })[node.fn.name](x)
  }
  const [a, b] = args
  if (node.args.length === 1) return node.op === '-' ? -a : a
  if (node.op === '+') return a + b
  if (node.op === '-') return a - b
  if (node.op === '*') return a * b
  if (node.op === '/') return b === 0 ? NaN : a / b
  if (node.op === '^') return a === 0 && b <= 0 ? NaN : a ** b
  return NaN
}

export function createEvaluator(expression, variable = 'x') {
  const { tree } = parseExpression(expression, variable)
  return x => { const y = realValue(tree, variable, x); return Number.isFinite(y) ? y : null }
}

function continuous(node, variable, at) {
  node = unwrap(node)
  if (node.isConstantNode || node.isSymbolNode) return true
  if (!node.args.every(n => continuous(n, variable, at))) return false
  if (node.isFunctionNode) {
    const x = realValue(node.args[0], variable, at)
    if (node.fn.name === 'sqrt') return x > 0
    if (node.fn.name === 'log') return x > 0
    if (node.fn.name === 'floor') return Number.isFinite(x) && !Number.isInteger(x)
  }
  if (node.isOperatorNode && node.op === '/' && Math.abs(realValue(node.args[1], variable, at)) < 1e-12) return false
  if (node.isOperatorNode && node.op === '^' && Number(node.args[1].toString()) <= 0 && realValue(node.args[0], variable, at) === 0) return false
  return Number.isFinite(realValue(node, variable, at))
}

function ptex(p, v) {
  const terms = []
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i]
    if (zero(c)) continue
    const sign = c.n < 0n ? '-' : terms.length ? '+' : ''
    const positive = rat(abs(c.n), c.d)
    const coefficient = i > 0 && positive.n === positive.d ? '' : rtex(positive)
    terms.push(`${sign}${coefficient}${i ? `${v}${i > 1 ? `^{${i}}` : ''}` : ''}`)
  }
  return terms.join('') || '0'
}

function removeRoots(p, a) {
  let multiplicity = 0
  if (pzero(p)) return { p, multiplicity: Infinity }
  while (p.length > 1 && zero(peval(p, a))) {
    const out = Array.from({ length: p.length - 1 }, () => rat(0))
    out[out.length - 1] = p.at(-1)
    for (let i = out.length - 2; i >= 0; i--) out[i] = add(p[i + 1], mul(a, out[i + 1]))
    p = trim(out)
    multiplicity++
  }
  return { p, multiplicity }
}

function rationalDefinedAt(node, variable, a) {
  node = unwrap(node)
  if (!node.isOperatorNode) return true
  if (!node.args.every(child => rationalDefinedAt(child, variable, a))) return false
  if (node.op === '/') {
    const denominator = asRational(node.args[1], variable)
    if (denominator && zero(peval(denominator.p, a))) return false
  }
  if (node.op === '^' && Number(node.args[1].toString()) <= 0) {
    const base = asRational(node.args[0], variable)
    if (base && zero(peval(base.p, a))) return false
  }
  return true
}

function factorTex(p, multiplicity, a, variable) {
  if (!multiplicity || !Number.isFinite(multiplicity)) return ptex(p, variable)
  const base = zero(a) ? variable : `(${variable}-${a.n < 0n ? `(${rtex(a)})` : rtex(a)})`
  return `${base}${multiplicity > 1 ? `^{${multiplicity}}` : ''}\\left(${ptex(p, variable)}\\right)`
}

function specialLimit(tree, variable, a) {
  if (a !== 0) return null
  const n = unwrap(tree)
  if (!n.isOperatorNode || n.op !== '/') return null
  const numerator = unwrap(n.args[0]), denominator = asRational(n.args[1], variable)
  if (!denominator || denominator.q.length !== 1 || !zero(sub(denominator.q[0], rat(1)))) return null
  const d = denominator.p
  const isX = d.length === 2 && zero(d[0]) && zero(sub(d[1], rat(1)))
  const isX2 = d.length === 3 && zero(d[0]) && zero(d[1]) && zero(sub(d[2], rat(1)))
  const linear = argument => {
    const r = asRational(argument, variable)
    if (!r || r.q.length !== 1 || r.p.length > 2 || !zero(r.p[0])) return null
    return div(r.p[1] || rat(0), r.q[0])
  }
  if (numerator.isFunctionNode && numerator.fn.name === 'sin' && isX) {
    const k = linear(numerator.args[0])
    if (k) return { value: k, text: 'از حد بنیادی sin(u)/u = ۱ و تغییر متغیر u=kx استفاده می‌کنیم؛ برای k=۰ عبارت در همسایگی برابر صفر است.', math: `\\lim_{${variable}\\to0}\\frac{\\sin(${rtex(k)}${variable})}{${variable}}=${rtex(k)}` }
  }
  if (numerator.isOperatorNode && numerator.op === '-' && isX2 && unwrap(numerator.args[0]).isConstantNode && Number(unwrap(numerator.args[0]).value) === 1) {
    const f = unwrap(numerator.args[1])
    if (f.isFunctionNode && f.fn.name === 'cos') {
      const k = linear(f.args[0])
      if (k) return { value: div(mul(k, k), rat(2)), text: 'با اتحاد 1−cos(u)=2sin²(u/2) و حد بنیادی سینوسی، حد برابر k²/۲ است.', math: `1-\\cos u=2\\sin^2(u/2)` }
    }
  }
  if (numerator.isOperatorNode && numerator.op === '-' && isX && unwrap(numerator.args[1]).isConstantNode && Number(unwrap(numerator.args[1]).value) === 1) {
    const f = unwrap(numerator.args[0])
    if (f.isFunctionNode && f.fn.name === 'exp') {
      const k = linear(f.args[0])
      if (k) return { value: k, text: 'از حد بنیادی نمایی و تغییر متغیر u=kx استفاده می‌کنیم.', math: '\\lim_{u\\to0}\\frac{e^u-1}{u}=1' }
    }
  }
  if (numerator.isFunctionNode && numerator.fn.name === 'log' && isX) {
    const r = asRational(numerator.args[0], variable)
    if (r && r.q.length === 1 && r.p.length <= 2 && zero(sub(r.p[0], r.q[0]))) {
      const k = div(r.p[1] || rat(0), r.q[0])
      return { value: k, text: 'در همسایگی صفر، آرگومان لگاریتم مثبت است. از حد بنیادی لگاریتمی با u=kx استفاده می‌کنیم.', math: '\\lim_{u\\to0}\\frac{\\ln(1+u)}u=1' }
    }
  }
  return null
}

export function solveLimit(input, pointInput = '2', variable = 'x', direction = 'both') {
  try {
    if (!['both', 'left', 'right'].includes(direction)) throw new Error('جهت حد معتبر نیست.')
    const parsed = parseExpression(input, variable)
    const point = normalize(pointInput)
    const infinity = ['Infinity', '+Infinity', '-Infinity'].includes(point)
    let at, exactPoint = null
    if (infinity) at = point.startsWith('-') ? -Infinity : Infinity
    else {
      const pointTree = parseExpression(point, variable).tree
      let hasVariable = false
      pointTree.traverse(n => { if (n.isSymbolNode && n.name === variable) hasVariable = true })
      if (hasVariable) throw new Error('نقطهٔ میل باید یک ثابت باشد، مانند ۲، 1/2 یا pi.')
      at = realValue(pointTree, variable, 0)
      const r = asRational(pointTree, variable)
      if (r && r.p.length === 1 && r.q.length === 1) exactPoint = div(r.p[0], r.q[0])
      if (!Number.isFinite(at)) throw new Error('نقطهٔ میل معتبر نیست.')
    }
    const pointTex = infinity ? (at < 0 ? '-\\infty' : '+\\infty') : exactPoint ? rtex(exactPoint) : parse(point).toTex()
    const base = { expression: parsed.expression, variable, point, at, direction, tex: parsed.tex, pointTex, steps: [], functionValue: infinity ? null : realValue(parsed.tree, variable, at) }
    const step = (title, text, math) => base.steps.push({ title, text, math })
    const complete = (left, right, extra = {}) => {
      const result = direction === 'left' ? left : direction === 'right' ? right : left === right ? left : null
      return { ...base, status: result === null ? 'dne' : 'solved', left, right, result, ...extra }
    }
    const rational = asRational(parsed.tree, variable)
    if (rational && pzero(rational.q)) throw new Error('مخرج این عبارت به‌طور همانی صفر است؛ تابع در هیچ همسایگی‌ای تعریف نشده است.')
    if (rational && (exactPoint || infinity)) {
      const { p, q } = rational
      if (infinity) {
        const degree = pzero(p) ? -Infinity : p.length - q.length
        step('مقایسهٔ درجه‌ها', 'در تابع گویا رفتار در بی‌نهایت را جمله‌های با بالاترین درجه تعیین می‌کنند.', `P(${variable})=${ptex(p, variable)},\\quad Q(${variable})=${ptex(q, variable)}`)
        if (degree < 0) { step('درجهٔ مخرج بزرگ‌تر است', 'با تقسیم صورت و مخرج بر بالاترین توان مخرج، صورت به صفر و مخرج به ضریب پیشرو نزدیک می‌شود.', '\\lim f=0'); return { ...complete('0', '0'), numericResult: 0 } }
        const coefficient = div(p.at(-1), q.at(-1))
        if (degree === 0) { step('درجه‌ها برابرند', 'حد برابر نسبت ضرایب پیشرو است.', `\\lim f=${rtex(coefficient)}`); return { ...complete(rtex(coefficient), rtex(coefficient)), numericResult: number(coefficient) } }
        const sign = (coefficient.n < 0n ? -1 : 1) * (at < 0 && degree % 2 ? -1 : 1)
        const result = sign > 0 ? '+\\infty' : '-\\infty'
        step('درجهٔ صورت بزرگ‌تر است', 'قدر مطلق تابع نامتناهی می‌شود؛ علامت از ضریب پیشرو و جهت میل به دست می‌آید.', `f(${variable})\\sim ${rtex(coefficient)}${variable}^{${degree}}`)
        return { ...complete(result, result), numericResult: sign * Infinity }
      }
      const pa = peval(p, exactPoint), qa = peval(q, exactPoint)
      base.functionValue = rationalDefinedAt(parsed.tree, variable, exactPoint) && !zero(qa) ? number(div(pa, qa)) : null
      step('جای‌گذاری مستقیم', Number.isFinite(base.functionValue) ? 'تابع در نقطهٔ مورد نظر تعریف شده است. مقدار جای‌گذاری را بررسی می‌کنیم.' : 'عبارت اصلی در این نقطه تعریف نشده است. این موضوع به‌تنهایی به معنی نبودن حد نیست.', Number.isFinite(base.functionValue) ? `f(${pointTex})=${!zero(qa) ? rtex(div(pa, qa)) : base.functionValue}` : undefined)
      if (!zero(qa)) {
        const answer = div(pa, qa)
        step('استفاده از پیوستگی تابع گویا', 'عبارت گویا در یک همسایگی سوراخ‌شده با عبارت اصلی برابر است و مخرج آن در نقطهٔ میل ناصفر است.', `\\lim_{${variable}\\to ${pointTex}}\\frac{${ptex(p, variable)}}{${ptex(q, variable)}}=${rtex(answer)}`)
        return { ...complete(rtex(answer), rtex(answer)), numericResult: number(answer) }
      }
      if (zero(pa)) step('تشخیص فرم مبهم', 'جای‌گذاری در صورت و مخرج گویا، فرم ۰/۰ می‌دهد. این یک فرم مبهم است و باید ساختار جبری را بررسی کنیم.', '\\frac00')
      else step('مخرج به صفر نزدیک می‌شود', 'صورت ناصفر است؛ برای تعیین علامت بی‌نهایت، مرتبهٔ صفر مخرج و جهت نزدیک‌شدن را بررسی می‌کنیم.', `P(${pointTex})=${rtex(pa)},\\quad Q(${pointTex})=0`)
      const rp = removeRoots(p, exactPoint), rq = removeRoots(q, exactPoint)
      if (!pzero(p) && p.length <= 13) {
        const factored = !p.some(c => c.d !== 1n) ? factorExpression(ptex(p, variable).replace(/\^\{(\d+)\}/g, '^$1'), variable) : null
        if (factored) step('تجزیهٔ صورت', 'نمایش نمادی تجزیهٔ صورت؛ محاسبهٔ حد بر پایهٔ تقسیم دقیق چندجمله‌ای ادامه می‌یابد.', `P(${variable})=${factored}`)
      }
      step('بیرون کشیدن عامل‌های صفرشونده', 'با تقسیم چندجمله‌ای، توان عامل مشترک در صورت و مخرج دقیقاً محاسبه می‌شود.', `\\frac{${factorTex(rp.p, rp.multiplicity, exactPoint, variable)}}{${factorTex(rq.p, rq.multiplicity, exactPoint, variable)}}`)
      if (rp.multiplicity >= rq.multiplicity) {
        const remaining = rp.multiplicity - rq.multiplicity
        const answer = remaining > 0 ? rat(0) : div(peval(rp.p, exactPoint), peval(rq.p, exactPoint))
        step('حذف عامل مشترک در همسایگی سوراخ‌شده', `چون ${variable} با نقطهٔ میل برابر نیست، حذف عامل مشترک مجاز است. سپس دوباره جای‌گذاری می‌کنیم.`, remaining === Infinity ? '0' : `\\lim_{${variable}\\to ${pointTex}}${remaining ? `(${variable}-${pointTex})^{${remaining}}` : ''}\\frac{${ptex(rp.p, variable)}}{${ptex(rq.p, variable)}}=${rtex(answer)}`)
        return { ...complete(rtex(answer), rtex(answer)), numericResult: number(answer) }
      }
      const order = rq.multiplicity - rp.multiplicity
      const coefficient = div(peval(rp.p, exactPoint), peval(rq.p, exactPoint))
      const positive = coefficient.n > 0n
      const right = positive ? '+\\infty' : '-\\infty'
      const left = order % 2 ? (positive ? '-\\infty' : '+\\infty') : right
      step('بررسی علامت از دو سمت', 'علامت ضریب باقی‌مانده ثابت است. توان زوج در دو طرف علامت یکسان و توان فرد علامت مخالف می‌دهد.', `f(${variable})\\sim\\frac{${rtex(coefficient)}}{(${variable}-${pointTex})^{${order}}}`)
      return complete(left, right)
    }
    if (infinity) return { ...base, status: 'unsupported', message: 'در بی‌نهایت، نسخهٔ اول فقط توابع گویا با ضرایب عددی را به‌طور قابل اتکا حل می‌کند.' }
    const compact = parsed.expression.replace(/\s/g, '').replaceAll(variable, 'x')
    if (at === 0 && ['abs(x)/x', '(abs(x))/x'].includes(compact)) {
      step('بررسی قدرمطلق', 'برای x منفی، |x|=−x و برای x مثبت، |x|=x است. در صفر خود عبارت تعریف نشده است.', String.raw`\frac{|x|}x=\begin{cases}-1&x<0\\1&x>0\end{cases}`)
      step('مقایسهٔ حدهای یک‌طرفه', 'دو حد متفاوت‌اند؛ پس حد دوسویه وجود ندارد.', '\\lim_{x\\to0^-}f(x)=-1,\\quad\\lim_{x\\to0^+}f(x)=1')
      return complete('-1', '1')
    }
    if (at === 0 && ['sin(1/x)', 'cos(1/x)'].includes(compact)) {
      const sine = compact.startsWith('sin')
      step('بررسی نوسان با دو دنباله', 'با دو دنبالهٔ مثبت که به صفر می‌روند، خروجی‌ها به دو مقدار متفاوت می‌رسند. همین استدلال در سمت منفی هم برقرار است.', sine ? 'x_n=\\frac1{2\\pi n+\\pi/2},\\quad y_n=\\frac1{2\\pi n+3\\pi/2}' : 'x_n=\\frac1{2\\pi n},\\quad y_n=\\frac1{(2n+1)\\pi}')
      step('معیار دنباله‌ای', 'روی یک دنباله مقدار تابع ۱ و روی دیگری منفی ۱ است. حد چپ و راست هیچ‌کدام وجود ندارند.', 'f(x_n)=1,\\qquad f(y_n)=-1')
      return complete(null, null)
    }
    const special = specialLimit(parsed.tree, variable, at)
    if (special) {
      step('جای‌گذاری و تشخیص فرم مبهم', 'جای‌گذاری در عبارت، فرم ۰/۰ ایجاد می‌کند؛ قانون تقسیم را نمی‌توان مستقیماً به کار برد.', '\\frac00')
      step('استفاده از حد بنیادی', special.text, special.math)
      step('نتیجه از هر دو سمت', 'این نتیجه در همسایگی سوراخ‌شده، از هر دو سمت برقرار است.', `L=${rtex(special.value)}`)
      return { ...complete(rtex(special.value), rtex(special.value)), numericResult: number(special.value) }
    }
    if (continuous(parsed.tree, variable, at)) {
      const value = realValue(parsed.tree, variable, at)
      step('بررسی پیوستگی اجزای عبارت', 'اجزا در این نقطه پیوسته‌اند؛ مخرج‌ها ناصفر و آرگومان‌های ریشه و لگاریتم در داخل دامنهٔ مجازند.', parsed.tex)
      step('جای‌گذاری در تابع پیوسته', 'بر اساس قوانین پیوستگی و ترکیب، حد برابر مقدار تابع است. نمایش عددی این نتیجه تقریبی است.', `\\lim_{${variable}\\to${pointTex}}f(${variable})=f(${pointTex})\\approx ${Number(value.toPrecision(10))}`)
      return { ...complete(String(Number(value.toPrecision(10))), String(Number(value.toPrecision(10)))), numericResult: value, approximate: true }
    }
    return { ...base, status: 'unsupported', message: 'برای این عبارت، روش اثبات‌شده‌ای در نسخهٔ اول نداریم. نمونه‌برداری عددی یا شکل نمودار برای اعلام وجود حد کافی نیست. توابع گویا، ترکیب‌های پیوسته در داخل دامنه، چند حد بنیادی در صفر و نمونه‌های مشخص قدرمطلق و نوسان پشتیبانی می‌شوند.' }
  } catch (error) { return { status: 'error', message: error.message || 'امکان بررسی این عبارت وجود ندارد.' } }
}

export function factorExpression(expression, variable = 'x') {
  try {
    const original = parseExpression(expression, variable)
    const result = nerdamer(`factor(${original.tree.toString()})`)
    const proposed = parseExpression(result.text(), variable)
    const a = asRational(original.tree, variable), b = asRational(proposed.tree, variable)
    if (!a || !b || !pzero(padd(pmul(a.p, b.q), pneg(pmul(b.p, a.q))))) return null
    return proposed.tex
  } catch { return null }
}
