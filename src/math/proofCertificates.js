import { parseExpression, proofMath as m } from './solver.js'

const { rat, add, sub, mul, div, neg, zero, number, rtex, ptex, pmul, padd, pneg, peval, removeRoots, asRational, unwrap, pzero } = m
export const positive = a => rat(a.n < 0n ? -a.n : a.n, a.d)
export const less = (a, b) => a.n * b.d < b.n * a.d
export const minimum = (...values) => values.reduce((a, b) => less(a, b) ? a : b)
export const pow = (a, n) => rat(a.n ** BigInt(n), a.d ** BigInt(n))
export const equal = (a, b) => zero(sub(a, b))
export const sign = a => a.n > 0n ? 1 : a.n < 0n ? -1 : 0

export function exactPoint(input, variable) {
  const parsed = parseExpression(input, variable)
  let hasVariable = false
  parsed.tree.traverse(n => { if (n.isSymbolNode && n.name === variable) hasVariable = true })
  if (hasVariable) return null
  const r = asRational(parsed.tree, variable)
  return r && r.p.length === 1 && r.q.length === 1 && !pzero(r.q) ? div(r.p[0], r.q[0]) : null
}

export function polynomialBound(p, radius, derivative = false) {
  return p.reduce((sum, c, i) => derivative && !i ? sum : add(sum, mul(positive(c), mul(rat(derivative ? i : 1), pow(radius, derivative ? i - 1 : i)))), rat(0))
}

function rootRadius(p, a) {
  if (pzero(p)) throw new Error('یک مخرج در تمام دامنه صفر است.')
  const residual = removeRoots(p, a).p
  const value = positive(peval(residual, a))
  const c = polynomialBound(residual, add(positive(a), rat(1)), true)
  return zero(c) ? rat(1) : minimum(rat(1), div(value, mul(rat(2), c)))
}

export function domainBarriers(node, variable) {
  node = unwrap(node)
  if (!node.args) return []
  const barriers = node.args.flatMap(child => domainBarriers(child, variable))
  if (node.isOperatorNode && node.op === '/') {
    const denominator = asRational(node.args[1], variable)
    if (denominator) barriers.push(denominator.p)
  }
  if (node.isOperatorNode && node.op === '^' && Number(node.args[1].toString()) <= 0) {
    const base = asRational(node.args[0], variable)
    if (base) barriers.push(base.p)
  }
  return barriers
}

export function domainRadius(barriers, a) {
  return minimum(rat(1), ...barriers.map(p => rootRadius(p, a)))
}

export function infinityDomainBound(barriers) {
  return barriers.reduce((bound, p) => {
    if (pzero(p)) throw new Error('یک مخرج در تمام دامنه صفر است.')
    const lead = positive(p.at(-1))
    const sum = p.slice(0, -1).reduce((s, c) => add(s, div(positive(c), lead)), rat(0))
    const next = add(rat(1), sum)
    return less(bound, next) ? next : bound
  }, rat(1))
}

export function finiteCertificate(p, q, a, radius = rat(1)) {
  const pa = peval(p, a), qa = peval(q, a)
  if (zero(qa)) return null
  const R = add(positive(a), rat(1))
  const cq = polynomialBound(q, R, true)
  const denominatorRadius = zero(cq) ? rat(1) : minimum(rat(1), div(positive(qa), mul(rat(2), cq)))
  const d0 = minimum(radius, denominatorRadius)
  const error = padd(p.map(c => mul(c, qa)), pneg(q.map(c => mul(c, pa))))
  const c = q.length === 1 ? div(polynomialBound(p, R, true), positive(qa)) : div(mul(rat(2), polynomialBound(error, R, true)), mul(qa, qa))
  return { kind: 'finite', p, q, a, pa, qa, R, cq, error, c, radius: d0, limit: div(pa, qa) }
}

export function rationalAt(r, a, radius = rat(1)) {
  if (pzero(r.q)) throw new Error('مخرج همواره صفر است.')
  const numerator = removeRoots(r.p, a), denominator = removeRoots(r.q, a)
  if (numerator.multiplicity >= denominator.multiplicity) {
    let p = numerator.p
    if (pzero(p)) p = [rat(0)]
    else for (let i = 0; i < numerator.multiplicity - denominator.multiplicity; i++) p = pmul(p, [neg(a), rat(1)])
    return { ...finiteCertificate(p, denominator.p, a, radius), cancelled: denominator.multiplicity > 0 }
  }
  const c = finiteCertificate(numerator.p, denominator.p, a, radius)
  const lower = div(positive(c.limit), rat(2))
  const d = zero(c.c) ? c.radius : minimum(c.radius, div(positive(c.limit), mul(rat(2), c.c)))
  return { kind: 'pole', a, order: denominator.multiplicity - numerator.multiplicity, coefficient: c.limit, lower, radius: d, residual: c }
}

export function atInfinity(r, barriers) {
  const difference = r.q.length - r.p.length
  const p = [...r.p].reverse(), q = [...r.q].reverse()
  const zeros = count => Array.from({ length: count }, () => rat(0))
  const transformed = difference >= 0 ? { p: [...zeros(difference), ...p], q } : { p, q: [...zeros(-difference), ...q] }
  const domainBound = infinityDomainBound(barriers)
  return { transformed, certificate: rationalAt(transformed, rat(0), div(rat(1), domainBound)), domainBound }
}

export function witnessDelta(certificate, epsilon) {
  const eps = typeof epsilon === 'object' ? epsilon : m.fromDecimal(epsilon)
  if (sign(eps) <= 0 || certificate.kind !== 'finite') throw new Error('اپسیلون باید مثبت باشد و گواهی حد متناهی لازم است.')
  return zero(certificate.c) ? certificate.radius : minimum(certificate.radius, div(eps, certificate.c))
}

export function certificateConstants(c) {
  return { radius: rtex(c.radius), ...(c.kind === 'finite' ? { C: rtex(c.c), L: rtex(c.limit) } : { k: c.order, lower: rtex(c.lower) }) }
}

export function finiteSteps(c, variable, aTex, goal = true, functionName = 'f') {
  const steps = []
  if (goal) steps.push({ title: 'هدف برهان با تعریف اپسیلون–دلتا', text: 'ε دلخواه و مثبت است. باید δای وابسته به ε انتخاب کنیم که تمام نقاط دامنه در همسایگی سوراخ‌شده را کنترل کند؛ هیچ نمونه‌برداری عددی در این استدلال دخالت ندارد.', math: `\\forall\\varepsilon>0\\;\\exists\\delta>0:\\quad ${variable}\\in D_f,\\quad0<|${variable}-(${aTex})|<\\delta\\Rightarrow|f(${variable})-(${rtex(c.limit)})|<\\varepsilon`, reference: 'definition' })
  if (c.cancelled) steps.push({ title: 'انتقال حد با برابری موضعی', text: 'دو تابعی که روی یک همسایگی سوراخ‌شده برابرند، دقیقاً شرط ε–δ یکسانی دارند. تغییر ضابطه در خود نقطه، شرط حد را تغییر نمی‌دهد. برهان زیر برای عبارت برابر در همان همسایگی انجام می‌شود.', math: `f(${variable})=\\frac{${ptex(c.p, variable)}}{${ptex(c.q, variable)}}\\quad(0<|${variable}-(${aTex})|<${rtex(c.radius)})`, reference: 'definition' })
  steps.push({ title: 'برآورد تغییر چندجمله‌ای‌ها با نامساوی', text: 'اگر |x−a|<۱ باشد، هر دو قدرمطلق |x| و |a| حداکثر R هستند. اتحاد تفاضل توان‌ها و نامساوی مثلثی، کران‌های زیر را می‌دهند؛ این کران از ضرایب دقیق ساخته شده است.', math: String.raw`|u^j-v^j|\le jR^{j-1}|u-v|,\qquad R=` + rtex(c.R), reference: 'definition' })
  steps.push({ title: 'کنترل دامنه و دور ماندن مخرج از صفر', text: 'r هم‌زمان شرط |x−a|<۱، ناصفر بودن مخرج‌های اصلی در همسایگی سوراخ‌شده و شرط |Q(x)−Q(a)|<|Q(a)|/۲ را تضمین می‌کند. برای مخرج ثابت، ناصفر بودن مستقیماً معلوم است.', math: `r=${rtex(c.radius)}>0,\\quad Q(a)=${rtex(c.qa)}\\ne0,\\quad |Q(${variable})|\\ge\\frac{|Q(a)|}{2}` })
  steps.push(c.q.length === 1 ? {
    title: 'ساختن ثابت کران از ضرایب',
    text: 'ثابت C حدس زده نمی‌شود: نامساوی تفاضل توان‌ها را برای هر جملهٔ صورت به کار می‌بریم و بر قدرمطلق مخرج ثابت تقسیم می‌کنیم.',
    math: `C=\\frac{\\sum_{j\\ge1}j|p_j|R^{j-1}}{|Q(a)|}=${rtex(c.c)}`
  } : {
    title: 'ساختن ثابت کران از صورتِ تفاضل',
    text: 'چندجمله‌ای S در a صفر می‌شود. ثابت تغییر آن از مجموع ضرایب با وزن‌های jR^(j−۱) محاسبه می‌شود. کران پایین |Q(x)| ثابت C را تعیین می‌کند.',
    math: `S(${variable})=Q(a)P(${variable})-P(a)Q(${variable})=${ptex(c.error, variable)},\\quad S(a)=0,\\quad C_S=${rtex(polynomialBound(c.error, c.R, true))},\\quad C=\\frac{2C_S}{|Q(a)|^2}=${rtex(c.c)}`
  })
  steps.push({ title: 'برآورد فاصلهٔ خروجی از مقدار حد', text: c.q.length === 1 ? 'برای مخرج ثابت، نامساوی تغییر چندجمله‌ای را بر قدرمطلق همان ثابت تقسیم می‌کنیم.' : 'صورتِ تفاضل دو خارج‌قسمت در a صفر است. با کران تغییر این چندجمله‌ای و کران پایین مخرج، فاصلهٔ خروجی کنترل می‌شود.', math: `\\left|\\frac{${ptex(c.p, variable)}}{${ptex(c.q, variable)}}-${rtex(c.limit)}\\right|\\le ${rtex(c.c)}|${variable}-(${aTex})|` })
  steps.push({ title: 'انتخاب δ و پایان اثبات', text: zero(c.c) ? 'فاصلهٔ خروجی همواره صفر است؛ برای هر ε مثبت، δ=r کافی است.' : 'این δ مثبت است. هر x از دامنه که شرط ورودی را داشته باشد، نامساوی سختِ مورد نیاز را نتیجه می‌دهد؛ پس تعریف حد برای هر ε برقرار است.', math: zero(c.c) ? `\\delta=${rtex(c.radius)},\\qquad |f(${variable})-(${rtex(c.limit)})|=0<\\varepsilon` : `\\delta=\\min\\left\\{${rtex(c.radius)},\\frac{\\varepsilon}{${rtex(c.c)}}\\right\\},\\qquad |f(${variable})-(${rtex(c.limit)})|\\le ${rtex(c.c)}|${variable}-a|<\\varepsilon` })
  return steps.map(step => ({ ...step, math: step.math?.replace(/\bf\(/g, `${functionName}(`).replaceAll('D_f', `D_{${functionName}}`) }))
}

export { rtex, ptex, rat, add, sub, mul, div, neg, zero, number, peval, asRational, unwrap, pzero }
