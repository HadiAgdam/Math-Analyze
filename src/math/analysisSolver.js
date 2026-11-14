import { normalize, parseExpression, proofMath as m, solveLimit } from './solver.js'
import { proofReferences } from '../content/proofMethods.js'
import { exactPoint, finiteCertificate, rationalAt, atInfinity, domainBarriers, domainRadius, finiteSteps, certificateConstants, positive, minimum, equal, pow, sign } from './proofCertificates.js'

const { rat, add, sub, mul, div, neg, zero, number, rtex, ptex, peval, asRational, unwrap, pzero } = m
const S = String.raw
const infinityTex = s => s > 0 ? '+\\infty' : '-\\infty'
const cloneStep = (title, text, math, reference) => ({ title, text, math, reference })
const unsupported = (base, message, steps = []) => ({ ...base, status: 'unsupported', steps, message, rigorous: false })
const exactValue = value => ({ exact: value, tex: rtex(value), nonzero: !zero(value), positive: sign(value) > 0 })
const valueTex = value => `\\left(${value.tex}\\right)`

function exactSquareRoot(value) {
  if (value.n < 0n) return null
  const root = n => {
    if (n < 2n) return n
    let x = n, next = (x + 1n) / 2n
    while (next < x) { x = next; next = (x + n / x) / 2n }
    return x
  }
  const n = root(value.n), d = root(value.d)
  return n * n === value.n && d * d === value.d ? rat(n, d) : null
}

export function displayExpression(expression, variable = 'x') {
  const special = normalize(expression).match(/^(rationalSplit|dirichlet)\(([a-zA-Z])\)$/)
  if (special && special[2] === variable) return special[1] === 'rationalSplit' ? `\\begin{cases}${variable}&${variable}\\in\\mathbb Q\\\\0&${variable}\\notin\\mathbb Q\\end{cases}` : `\\begin{cases}1&${variable}\\in\\mathbb Q\\\\-1&${variable}\\notin\\mathbb Q\\end{cases}`
  return parseExpression(expression, variable).tex
}

function complete(base, left, right, steps, methods, extra = {}) {
  const result = base.direction === 'left' ? left : base.direction === 'right' ? right : left === right ? left : null
  return { ...base, status: result === null ? 'dne' : 'solved', result, left, right, steps, methods, rigorous: true, ...extra }
}

function poleSteps(c, variable, aTex, functionName = 'f') {
  return [
    cloneStep('تعریف حد نامتناهی و هدف برهان', 'برای هر M مثبت باید یک δ پیدا کنیم تا در سمت مورد نظر، مقدار تابع از M بزرگ‌تر یا از −M کوچک‌تر باشد. این تعریف با حد متناهی ε–δ فرق دارد.', `\\forall M>0\\;\\exists\\delta>0:\\quad 0<|${variable}-(${aTex})|<\\delta\\Rightarrow |f(${variable})|>M`, 'infinity'),
    cloneStep('بازنویسی موضعی برای ساختن کران', 'عامل‌های صفرشونده را فقط برای ساختن یک نامساویِ معتبر جدا می‌کنیم. این تساوی در همسایگی سوراخ‌شده برقرار است و در آنجا همهٔ مخرج‌های ضابطهٔ اصلی ناصفرند.', `f(${variable})=\\frac{g(${variable})}{(${variable}-(${aTex}))^{${c.order}}},\\quad g(${variable})=\\frac{${ptex(c.residual.p, variable)}}{${ptex(c.residual.q, variable)}}`),
    ...finiteSteps(c.residual, variable, aTex, false, 'g'),
    cloneStep('کرانِ تابعِ باقی‌مانده و علامت آن', 'در همسایگی سوراخ‌شده، f به شکل g(x)/(x−a)^k نوشته می‌شود. برآورد تغییر تابع گویای g، نه تقریب عددی، تضمین می‌کند g هم‌علامت g(a) باشد و قدرمطلق آن حداقل نصف |g(a)| بماند.', `k=${c.order},\\quad g(a)=${rtex(c.coefficient)},\\quad 0<|${variable}-(${aTex})|<${rtex(c.radius)}\\Rightarrow |g(${variable})|\\ge ${rtex(c.lower)}`, 'definition'),
    cloneStep('انتخاب δ بر حسب M', 'با این انتخاب، کران پایین |f(x)| از هر M دلخواه بزرگ‌تر می‌شود. علامت تابع از علامت g(a) و زوج یا فرد بودن k در هر سمت تعیین می‌شود.', `\\delta=\\min\\left\\{${rtex(c.radius)},\\left(\\frac{${rtex(c.lower)}}M\\right)^{1/${c.order}}\\right\\},\\quad |f(${variable})|\\ge\\frac{${rtex(c.lower)}}{|${variable}-(${aTex})|^{${c.order}}}>M`, 'infinity'),
    cloneStep('تفکیک دو سمت', 'در سمت راست x−a مثبت است. در سمت چپ، توان فرد علامت را عوض می‌کند و توان زوج آن را نگه می‌دارد. اگر دو سمت متفاوت باشند، حد دوسویه حتی در معنای گسترده نیز وجود ندارد.', `\\operatorname{sgn}f(${variable})=\\operatorname{sgn}(${rtex(c.coefficient)})\\operatorname{sgn}(${variable}-(${aTex}))^{${c.order}}`, 'sides')
  ].map(step => ({ ...step, math: step.math?.replace(/\bf\(/g, `${functionName}(`) }))
}

function rationalProof(parsed, base, a, infinity) {
  const r = asRational(parsed.tree, base.variable)
  if (!r) return null
  const barriers = domainBarriers(parsed.tree, base.variable)
  if (infinity) {
    const transformed = atInfinity(r, barriers), c = transformed.certificate
    const steps = [cloneStep('تعریف حد در بی‌نهایت', 'برای هر ε>۰ (حد متناهی) یا M>۰ (حد نامتناهی)، باید کرانی B بیابیم که تمام ورودی‌های فراتر از آن در جهت انتخاب‌شده را کنترل کند.', base.at > 0 ? S`\forall\varepsilon>0\;\exists B>0:\quad x>B\Rightarrow|f(x)-L|<\varepsilon` : S`\forall\varepsilon>0\;\exists B>0:\quad x<-B\Rightarrow|f(x)-L|<\varepsilon`, 'infinity'), cloneStep('کنترل دامنه در بی‌نهایت', 'کران ریشه‌ها از ضرایب هر مخرج به دست می‌آید. بیرون این کران، همهٔ مخرج‌های ضابطهٔ اصلی ناصفرند؛ بنابراین تغییر متغیر مجاز است.', `|${base.variable}|>${rtex(transformed.domainBound)}`, 'infinity'), cloneStep('تغییر متغیر در تعریف، نه مقایسهٔ عددی درجه‌ها', 't=1/x قرار می‌دهیم. در +∞، t از راست به صفر و در −∞ از چپ به صفر می‌رود. در ادامه همین تابع در صفر با نامساوی کنترل می‌شود.', `F(t)=f(1/t)=\\frac{${ptex(transformed.transformed.p, 't')}}{${ptex(transformed.transformed.q, 't')}}`)]
    if (c.kind === 'finite') {
      steps.push(...finiteSteps(c, 't', '0', false, 'F'), cloneStep('انتخاب B بر حسب ε', 'اگر |x|>B باشد، |t|<δ است. پس تمام شرط‌های برهان قبلی برقرار می‌شوند؛ برای +∞ از x>B و برای −∞ از x<−B استفاده می‌کنیم.', zero(c.c) ? `B=\\max\\left\\{${rtex(transformed.domainBound)},\\frac1{${rtex(c.radius)}}\\right\\}` : `B=\\max\\left\\{${rtex(transformed.domainBound)},\\frac1{${rtex(c.radius)}},\\frac{${rtex(c.c)}}\\varepsilon\\right\\}`, 'infinity'))
      return complete(base, rtex(c.limit), rtex(c.limit), steps, ['epsilon', 'theorems'], { exactLimit: c.limit, numericResult: number(c.limit), certificate: c })
    }
    steps[0] = cloneStep('تعریف حد نامتناهی در بی‌نهایت', 'برای هر M>۰ باید Bای انتخاب شود که در جهت میل، f(x)>M یا f(x)<−M برای تمام ورودی‌های فراتر از B برقرار باشد.', base.at > 0 ? S`\forall M>0\;\exists B>0:\quad x>B\Rightarrow |f(x)|>M` : S`\forall M>0\;\exists B>0:\quad x<-B\Rightarrow |f(x)|>M`, 'infinity')
    steps.push(...poleSteps(c, 't', '0', 'F'), cloneStep('بازگشت به تعریف در بی‌نهایت', 'B=1/δ را همراه با کران دامنه انتخاب می‌کنیم. علامت t با علامت x یکسان است؛ پس نتیجهٔ یک‌طرفهٔ مربوط، حد در بی‌نهایت را تعیین می‌کند.', `B=\\max\\left\\{${rtex(transformed.domainBound)},\\frac1{${rtex(c.radius)}},\\left(\\frac{M}{${rtex(c.lower)}}\\right)^{1/${c.order}}\\right\\}`, 'infinity'))
    const result = infinityTex(sign(c.coefficient) * (base.at < 0 && c.order % 2 ? -1 : 1))
    return complete(base, result, result, steps, ['epsilon', 'theorems'], { certificate: c })
  }
  const c = rationalAt(r, a, domainRadius(barriers, a))
  if (c.kind === 'pole') {
    const right = infinityTex(sign(c.coefficient)), left = infinityTex(sign(c.coefficient) * (c.order % 2 ? -1 : 1))
    return complete(base, left, right, poleSteps(c, base.variable, base.pointTex), ['epsilon', 'theorems'], { certificate: c })
  }
  const steps = finiteSteps(c, base.variable, base.pointTex)
  steps.push(cloneStep('قضیهٔ خارج‌قسمت با فرض‌های آن', 'حدهای چندجمله‌ای‌ها با برآورد ε–δ بالا وجود دارند و متناهی‌اند؛ حد مخرج ناصفر است. بنابراین استفاده از قضیهٔ خارج‌قسمت مجاز است. اگر ضابطه تغییر کرده، انتقال حد فقط بر همسایگی سوراخ‌شده تکیه دارد.', `\\lim P(${base.variable})=${rtex(c.pa)},\\quad\\lim Q(${base.variable})=${rtex(c.qa)}\\ne0,\\quad L=${rtex(c.limit)}`, 'algebra'))
  const defined = m.rationalDefinedAt(parsed.tree, base.variable, a)
  return complete(base, rtex(c.limit), rtex(c.limit), steps, ['epsilon', 'theorems'], { exactLimit: c.limit, exactFunctionValue: defined ? c.limit : null, functionValue: defined ? number(c.limit) : null, numericResult: number(c.limit), certificate: c })
}

function boundedProduct(node, variable) {
  node = unwrap(node)
  const r = asRational(node, variable)
  if (r) return { amplitude: r, factors: [], barriers: domainBarriers(node, variable) }
  if (node.isFunctionNode && ['sin', 'cos'].includes(node.fn.name)) {
    const argument = asRational(node.args[0], variable)
    if (!argument || pzero(argument.q)) return null
    return { amplitude: { p: [rat(1)], q: [rat(1)] }, factors: [node.toTex()], barriers: domainBarriers(node.args[0], variable) }
  }
  if (!node.isOperatorNode) return null
  if (node.args.length === 1) {
    const child = boundedProduct(node.args[0], variable)
    return child ? { ...child, amplitude: { ...child.amplitude, p: node.op === '-' ? m.pneg(child.amplitude.p) : child.amplitude.p } } : null
  }
  if (!['*', '/'].includes(node.op)) return null
  const a = boundedProduct(node.args[0], variable), b = boundedProduct(node.args[1], variable)
  if (!a || !b || (node.op === '/' && b.factors.length)) return null
  return { amplitude: node.op === '*' ? { p: m.pmul(a.amplitude.p, b.amplitude.p), q: m.pmul(a.amplitude.q, b.amplitude.q) } : { p: m.pmul(a.amplitude.p, b.amplitude.q), q: m.pmul(a.amplitude.q, b.amplitude.p) }, factors: [...a.factors, ...b.factors], barriers: [...a.barriers, ...b.barriers, ...domainBarriers(node, variable)] }
}

function squeezeProof(parsed, base, a, infinity) {
  const product = boundedProduct(parsed.tree, base.variable)
  if (!product?.factors.length) return null
  const transformed = infinity ? atInfinity(product.amplitude, product.barriers) : null
  const c = infinity ? transformed.certificate : rationalAt(product.amplitude, a, domainRadius(product.barriers, a))
  if (c.kind !== 'finite' || !zero(c.limit)) return null
  const amp = `\\frac{${ptex(product.amplitude.p, base.variable)}}{${ptex(product.amplitude.q, base.variable)}}`
  const steps = [cloneStep('کرانداری عامل نوسانی', 'همهٔ آرگومان‌ها روی همسایگی مورد استفاده تعریف شده‌اند. بدون فرض وجود حدِ عامل نوسانی، از کرانداری سینوس و کسینوس استفاده می‌کنیم.', product.factors.map(f => `|${f}|\\le1`).join(',\\quad '), 'elementary'), cloneStep('نامساوی محصورکننده', 'قدر مطلق حاصل‌ضرب عامل‌های نوسانی حداکثر یک است. بنابراین فاصلهٔ خروجی از صفر فقط با عامل گویای A کنترل می‌شود.', `0\\le |f(${base.variable})|\\le |A(${base.variable})|,\\qquad A(${base.variable})=${amp}${infinity ? ",\\quad H(t)=A(1/t)" : ""}`, 'squeeze'), ...finiteSteps(c, infinity ? 't' : base.variable, infinity ? '0' : base.pointTex, false, infinity ? 'H' : 'A')]
  steps.push(cloneStep('قضیهٔ فشردگیِ حد و پایان اثبات', 'نامساوی در یک همسایگیِ کامل از دامنه برقرار است و کران بالا به صفر میل می‌کند. برای هر ε، انتخابِ همان δ مربوط به A، |f|<ε را نتیجه می‌دهد. منظور محصورسازی حد است، نه فشردگی مجموعه‌ها.', infinity ? `|${base.variable}|>B,\\quad B=\\max\\left\\{${rtex(transformed.domainBound)},\\frac1{${rtex(c.radius)}}${zero(c.c) ? '' : `,\\frac{${rtex(c.c)}}\\varepsilon`}\\right\\}\\Rightarrow |f(${base.variable})|<\\varepsilon` : `\\delta=${zero(c.c) ? rtex(c.radius) : `\\min\\left\\{${rtex(c.radius)},\\frac\\varepsilon{${rtex(c.c)}}\\right\\}`},\\quad 0<|${base.variable}-(${base.pointTex})|<\\delta\\Rightarrow|f(${base.variable})|<\\varepsilon`, 'squeeze'))
  return complete(base, '0', '0', steps, ['epsilon', 'squeeze', 'theorems'], { exactLimit: rat(0), numericResult: 0, certificate: c, exactFunctionValue: !infinity && product.barriers.every(p => !zero(peval(p, a))) && !zero(peval(product.amplitude.q, a)) ? rat(0) : null })
}

function sineProof(parsed, base, a) {
  if (!a || !zero(a)) return null
  const n = unwrap(parsed.tree)
  if (!n.isOperatorNode || n.op !== '/') return null
  const f = unwrap(n.args[0]), denominator = asRational(n.args[1], base.variable)
  if (!f.isFunctionNode || f.fn.name !== 'sin' || !denominator || denominator.p.length !== 2 || !zero(denominator.p[0]) || !equal(denominator.p[1], rat(1)) || denominator.q.length !== 1 || !equal(denominator.q[0], rat(1))) return null
  const argument = asRational(f.args[0], base.variable)
  if (!argument || argument.q.length !== 1 || argument.p.length > 2 || !zero(argument.p[0]) || !m.rationalDefinedAt(f.args[0], base.variable, rat(1))) return null
  const k = div(argument.p[1] || rat(0), argument.q[0])
  if (zero(k)) return complete(base, '0', '0', [cloneStep('برهان مستقیم با تعریف', 'صورت همواره صفر است و مخرج در همسایگی سوراخ‌شده ناصفر است. برای هر ε>۰، δ=۱ کافی است.', S`0<|x|<1\Rightarrow|f(x)-0|=0<\varepsilon`, 'definition')], ['epsilon', 'squeeze', 'theorems'], { exactLimit: rat(0), numericResult: 0 })
  const absK = positive(k), cubic = pow(absK, 3)
  const steps = [cloneStep('نامساوی مثلثاتی با شرط زاویه', 'برای زاویهٔ حقیقی بر حسب رادیان و ۰<|u|<۱، نامساوی هندسی زیر برقرار است. این قضیهٔ استاندارد تکمیلی است و عین متن جزوه معرفی نمی‌شود.', S`\cos u\le\frac{\sin u}{u}\le1,\qquad 0<|u|<1`, 'elementary'), cloneStep('محصورسازی فاصله از ۱', 'از 1−cos(u)=2sin²(u/2) و |sin v|≤|v|، کران کمی به دست می‌آید؛ این نامساوی حد را فرض نمی‌کند.', S`0\le1-\frac{\sin u}{u}\le1-\cos u\le\frac{u^2}{2}`, 'squeeze'), cloneStep('تغییر متغیر و انتخاب δ', 'u=kx است و k ناصفر. δ اول شرط |u|<۱ را تضمین می‌کند؛ δ دوم فاصله از مقدار حد را کمتر از ε نگه می‌دارد.', `\\left|\\frac{\\sin(${rtex(k)}x)}x-(${rtex(k)})\\right|\\le\\frac{${rtex(cubic)}}2x^2,\\quad\\delta=\\min\\left\\{\\frac1{1+${rtex(absK)}},\\sqrt{\\frac{2\\varepsilon}{${rtex(cubic)}}}\\right\\}`, 'definition')]
  return complete(base, rtex(k), rtex(k), steps, ['epsilon', 'squeeze', 'theorems'], { exactLimit: k, numericResult: number(k) })
}

function sequentialProof(parsed, base, a) {
  if (!a || !zero(a)) return null
  const compact = parsed.expression.replace(/\s/g, '')
  if (compact === `abs(${base.variable})/${base.variable}`) {
    const steps = [cloneStep('ضابطه در دو همسایگی یک‌طرفه', 'در سمت چپ، |x|=−x و در سمت راست، |x|=x است؛ خروجی در هر سمت ثابت می‌ماند.', S`f(x)=\begin{cases}-1&x<0\\1&x>0\end{cases}`, 'sides'), cloneStep('تعریف حد یک‌طرفه', 'برای هر ε>۰، δ=۱ کافی است: فاصله از −۱ در چپ و از ۱ در راست دقیقاً صفر است. اختلاف دو حد، وجود حد دوسویه را رد می‌کند.', S`-1<x<0\Rightarrow|f(x)+1|=0<\varepsilon,\quad0<x<1\Rightarrow|f(x)-1|=0<\varepsilon`, 'sides'), cloneStep('معیار دنباله‌ای برای رد حد دوسویه', 'دو دنباله در دامنه و خارج از نقطهٔ صفر به همان نقطه میل می‌کنند، اما تصاویرشان حدهای متفاوت دارند؛ پس شرط همگرایی تصاویرِ همهٔ دنباله‌ها نقض می‌شود.', S`x_n=-1/n,\quad y_n=1/n,\quad f(x_n)=-1,\quad f(y_n)=1`, 'definition')]
    return complete(base, '-1', '1', steps, ['epsilon', 'sequential', 'theorems'], { exactLimit: base.direction === 'left' ? rat(-1) : base.direction === 'right' ? rat(1) : null })
  }
  if (![ `sin(1/${base.variable})`, `cos(1/${base.variable})` ].includes(compact)) return null
  const sine = compact.startsWith('sin')
  const steps = [cloneStep('معیار دنباله‌ای حد', 'برای رد حد یک‌طرفه کافی است دو دنبالهٔ همان سمت، خارج از نقطه و در دامنه، به صفر برسند ولی تصاویرشان به دو مقدار متفاوت میل کنند. n از ۱ شروع می‌شود.', S`x_n,y_n\to0,\quad f(x_n)=1,\quad f(y_n)=-1`, 'definition')]
  if (base.direction !== 'left') steps.push(cloneStep('دو دنباله از راست', 'هر دو دنباله مثبت‌اند و به صفر میل می‌کنند. با جای‌گذاری دقیق زاویه‌ها، تصاویر ثابت ۱ و −۱ به دست می‌آیند.', sine ? S`x_n=\frac1{2\pi n+\pi/2},\quad y_n=\frac1{2\pi n+3\pi/2}` : S`x_n=\frac1{2\pi n},\quad y_n=\frac1{(2n+1)\pi}`, 'oscillation'))
  if (base.direction !== 'right') steps.push(cloneStep('دو دنباله از چپ', 'دنباله‌ها منفی‌اند؛ فازها طوری انتخاب شده‌اند که همچنان تصاویر به‌ترتیب ۱ و −۱ باشند.', sine ? S`x_n=-\frac1{2\pi n+3\pi/2},\quad y_n=-\frac1{2\pi n+\pi/2}` : S`x_n=-\frac1{2\pi n},\quad y_n=-\frac1{(2n+1)\pi}`, 'oscillation'))
  steps.push(cloneStep('نقض شرط لازمِ وجود حد', 'یکتا بودن حد دنباله‌ها، امکان وجود حد یک‌طرفهٔ متناهی را رد می‌کند. کرانداری تابع بین −۱ و ۱، حد نامتناهی را هم رد می‌کند.', S`1\ne-1,\qquad |f(x)|\le1`, 'definition'))
  return complete(base, null, null, steps, ['sequential', 'theorems'])
}

function floorProof(parsed, base, a) {
  const node = unwrap(parsed.tree)
  if (!node.isFunctionNode || node.fn.name !== 'floor' || !a) return null
  const r = asRational(node.args[0], base.variable)
  if (!r) return null
  const inner = rationalAt(r, a, domainRadius(domainBarriers(node.args[0], base.variable), a))
  if (inner.kind !== 'finite') return null
  if (inner.limit.d !== 1n) {
    const v = inner.limit
    const n = rat(v.n / v.d - (v.n < 0n && v.n % v.d !== 0n ? 1n : 0n))
    const gap = minimum(sub(v, n), sub(add(n, rat(1)), v))
    const radius = zero(inner.c) ? inner.radius : minimum(inner.radius, div(gap, mul(rat(2), inner.c)))
    const defined = m.rationalDefinedAt(node.args[0], base.variable, a)
    return complete(base, rtex(n), rtex(n), [cloneStep('قرار گرفتن آرگومان داخل یک بازهٔ جزءصحیح', 'حد آرگومان، عدد صحیح نیست. فاصلهٔ مثبت آن تا دو عدد صحیحِ مجاور، همراه با کران ε–δ آرگومان، شعاعی می‌دهد که تمام خروجی‌ها در همان بازه بمانند.', `n=${rtex(n)},\\quad \\eta=${rtex(gap)},\\quad r=${rtex(radius)},\\quad 0<|${base.variable}-a|<r\\Rightarrow n<h(${base.variable})<n+1`, 'definition'), cloneStep('برهان حد با تعریف', 'تابع در این همسایگی ثابت و برابر n است. برای هر ε>۰، δ=r فاصلهٔ خروجی را صفر می‌کند.', `f(${base.variable})=${rtex(n)},\\qquad |f(${base.variable})-(${rtex(n)})|=0<\\varepsilon`, 'definition')], ['epsilon', 'theorems'], { exactLimit: n, exactFunctionValue: defined ? n : null, functionValue: defined ? number(n) : null, numericResult: number(n) })
  }
  const n = inner.limit, difference = m.padd(r.p, m.pneg(r.q.map(c => mul(c, n))))
  if (pzero(difference)) return complete(base, rtex(n), rtex(n), [cloneStep('تابع ثابت در همسایگی', 'آرگومان جزءصحیح در دامنهٔ نزدیک نقطه همواره همین عدد صحیح است؛ پس برای هر ε>۰، فاصلهٔ خروجی از مقدار حد صفر است.', `f(${base.variable})=${rtex(n)}`, 'definition')], ['epsilon', 'theorems'], { exactLimit: n, exactFunctionValue: m.rationalDefinedAt(node.args[0], base.variable, a) ? n : null, numericResult: number(n) })
  const local = rationalAt({ p: difference, q: r.q }, a, inner.radius)
  const numerator = m.removeRoots(difference, a), denominator = m.removeRoots(r.q, a)
  if (local.kind !== 'finite') return null
  const g = finiteCertificate(numerator.p, denominator.p, a, inner.radius)
  const radius = minimum(inner.radius, g.radius, zero(inner.c) ? rat(1) : div(rat(1, 2), inner.c), zero(g.c) ? rat(1) : div(positive(g.limit), mul(rat(2), g.c)))
  const order = numerator.multiplicity - denominator.multiplicity
  const right = sign(g.limit) > 0 ? n : sub(n, rat(1)), left = sign(g.limit) * (order % 2 ? -1 : 1) > 0 ? n : sub(n, rat(1))
  return complete(base, rtex(left), rtex(right), [cloneStep('کنترل دقیق آرگومان جزءصحیح', 'با کران ε–δ آرگومان و علامت عامل باقی‌مانده، شعاعی انتخاب می‌شود که آرگومان بین n−۱/۲ و n+۱/۲ باشد و سمت آن نسبت به n در هر طرف مشخص بماند.', `n=${rtex(n)},\\quad r=${rtex(radius)},\\quad h(${base.variable})=${node.args[0].toTex()},\\quad h(${base.variable})-n=(${base.variable}-(${base.pointTex}))^{${order}}g(${base.variable}),\\quad g(a)=${rtex(g.limit)},\\quad |h(${base.variable})-n|\\le ${rtex(inner.c)}|${base.variable}-a|,\\quad |g(${base.variable})-g(a)|\\le ${rtex(g.c)}|${base.variable}-a|`, 'definition'), cloneStep('حدهای یک‌طرفه با تعریف', 'روی هر همسایگی یک‌طرفه خروجی جزءصحیح ثابت است؛ برای هر ε>۰، δ=r فاصلهٔ خروجی از این ثابت را صفر می‌کند. این نتیجه از نمونه‌برداری نیست.', `0<a-${base.variable}<r\\Rightarrow f(${base.variable})=${rtex(left)},\\quad0<${base.variable}-a<r\\Rightarrow f(${base.variable})=${rtex(right)}`, 'sides')], ['epsilon', 'theorems'], { exactLimit: equal(left, right) ? left : base.direction === 'left' ? left : base.direction === 'right' ? right : null, exactFunctionValue: m.rationalDefinedAt(node.args[0], base.variable, a) ? n : null, functionValue: m.rationalDefinedAt(node.args[0], base.variable, a) ? number(n) : null, numericResult: equal(left, right) ? number(left) : undefined })
}

function classroomProof(base, a, type) {
  if (!a || !Number.isFinite(base.at)) return null
  if (type === 'rationalSplit' && zero(a)) return complete(base, '0', '0', [cloneStep('نامساوی مثال جزوه', 'بر هر دو بخش دامنه، مقدار تابع یا x است یا صفر. پس این نامساوی برای تمام اعداد حقیقی برقرار است، نه فقط چند ورودی نمونه.', S`0\le |f(x)|\le|x|`, 'inequalities'), cloneStep('تعریف ε–δ و قضیهٔ محصورسازی', 'ε>۰ دلخواه است. δ=ε انتخاب می‌کنیم؛ آنگاه برای هر x با ۰<|x|<δ، فاصلهٔ f(x) از صفر کمتر از ε است. چون f(۰)=۰، همان نامساوی بدون حذف نقطه، تعریف پیوستگی را نیز ثابت می‌کند.', S`\delta=\varepsilon,\quad0<|x|<\delta\Rightarrow|f(x)-0|\le|x|<\varepsilon`, 'definition')], ['epsilon', 'squeeze', 'theorems'], { exactLimit: rat(0), exactFunctionValue: rat(0), functionValue: 0, numericResult: 0, nonGraphable: true })
  const steps = [cloneStep('دو دنباله با استفاده از چگالی گویا و گنگ', 'نقطهٔ میلِ این مثال عدد گویای دقیق است. دنبالهٔ نخست گویا و دنبالهٔ دوم گنگ است و هر دو، از سمت مورد نظر، به a نزدیک می‌شوند. n≥۱ است.', `r_n=a${base.direction === 'left' ? '-' : '+'}1/n,\\quad s_n=a${base.direction === 'left' ? '-' : '+'}\\sqrt2/n`, 'definition'), cloneStep('نقض معیار دنباله‌ای حد', 'تصاویر دو دنباله حدهای متفاوت دارند. برای حد دوسویه، همین دو دنباله از یک سمت کافی است؛ از سمت دیگر هم همین ساخت با علامت مخالف انجام می‌شود.', type === 'rationalSplit' ? `f(r_n)=r_n\\to ${rtex(a)}\\ne0,\\quad f(s_n)=0` : S`f(r_n)=1,\quad f(s_n)=-1,\quad1\ne-1`, type === 'rationalSplit' ? 'inequalities' : 'classification')]
  return complete(base, null, null, steps, ['sequential', 'theorems'], { exactFunctionValue: type === 'rationalSplit' ? a : rat(1), functionValue: type === 'rationalSplit' ? number(a) : 1, nonGraphable: true })
}

function elementaryProof(node, variable, a) {
  node = unwrap(node)
  const r = asRational(node, variable)
  if (r) {
    if (!m.rationalDefinedAt(node, variable, a)) return null
    const qa = peval(r.q, a)
    if (zero(qa)) return null
    const value = div(peval(r.p, a), qa)
    const certificate = finiteCertificate(r.p, r.q, a, domainRadius(domainBarriers(node, variable), a))
    return { value: exactValue(value), steps: [cloneStep('زیرمسئلهٔ این مرحله', 'ابتدا حد این جزءِ عبارت را با تعریف ثابت می‌کنیم. نماد φ فقط به همین زیرمسئله اشاره دارد.', `\\phi(${variable})=${node.toTex()}`), ...finiteSteps(certificate, variable, rtex(a), true, '\\phi'), cloneStep('حد و پیوستگی جزء گویا', 'حدهای چندجمله‌ای از تعریف ε–δ و نامساوی تفاضل توان‌ها به دست می‌آیند. مخرج در نقطه ناصفر است؛ قضیهٔ خارج‌قسمت با همین فرض قابل اعمال است.', `\\lim_{${variable}\\to${rtex(a)}}${node.toTex()}=${rtex(value)},\\quad Q(a)=${rtex(qa)}\\ne0`, 'algebra')] }
  }
  if (!node.args) return null
  const children = node.args.map(child => elementaryProof(child, variable, a))
  if (children.some(c => !c)) return null
  const steps = children.flatMap(c => c.steps), values = children.map(c => c.value)
  let value, theorem, condition
  if (node.isFunctionNode) {
    const name = node.fn.name, v = values[0]
    if (['sqrt', 'log'].includes(name) && !v.positive) return null
    if (name === 'floor') return null
    theorem = `پیوستگی ${name === 'sqrt' ? 'ریشهٔ دوم' : name === 'log' ? 'لگاریتم' : name === 'abs' ? 'قدر مطلق' : name === 'exp' ? 'تابع نمایی' : name === 'sin' ? 'سینوس' : 'کسینوس'} و قضیهٔ ترکیب`
    condition = ['sqrt', 'log'].includes(name) ? `حدِ آرگومان ${v.tex} مثبت و در داخل دامنه است. ` : 'تابع بیرونی روی تمام اعداد حقیقی پیوسته است. '
    condition += 'حد داخلی متناهی و با مراحل قبلی ثابت شده است؛ بنابراین فرض‌های قضیهٔ ترکیب برقرارند.'
    if (v.exact && ((name === 'sin' && zero(v.exact)) || (name === 'log' && equal(v.exact, rat(1))))) value = exactValue(rat(0))
    else if (v.exact && ['cos', 'exp'].includes(name) && zero(v.exact)) value = exactValue(rat(1))
    else if (name === 'abs' && v.exact) value = exactValue(positive(v.exact))
    else if (name === 'sqrt' && v.exact && exactSquareRoot(v.exact)) value = exactValue(exactSquareRoot(v.exact))
    else value = { tex: name === 'sqrt' ? `\\sqrt{${v.tex}}` : name === 'abs' ? `|${v.tex}|` : name === 'exp' ? `e^{${v.tex}}` : `\\${name === 'log' ? 'ln' : name}${valueTex(v)}`, positive: name === 'exp' || (name === 'sqrt' && v.positive) || (name === 'abs' && v.nonzero), nonzero: name === 'exp' || (name === 'sqrt' && v.positive) || (name === 'abs' && v.nonzero) }
  } else if (node.isOperatorNode) {
    const [aValue, bValue] = values
    if (node.args.length === 1) value = aValue.exact ? exactValue(node.op === '-' ? neg(aValue.exact) : aValue.exact) : { tex: `${node.op}${valueTex(aValue)}`, nonzero: aValue.nonzero }
    else if (node.op === '^') {
      if (!bValue.exact || bValue.exact.d !== 1n) return null
      const exponent = Number(bValue.exact.n)
      if (exponent <= 0 && !aValue.nonzero) return null
      value = aValue.exact ? exactValue(exponent >= 0 ? pow(aValue.exact, exponent) : div(rat(1), pow(aValue.exact, -exponent))) : { tex: `${valueTex(aValue)}^{${exponent}}`, nonzero: aValue.nonzero, positive: aValue.positive || (aValue.nonzero && exponent % 2 === 0) }
    } else {
      if (node.op === '/' && !bValue.nonzero) return null
      if (aValue.exact && bValue.exact) value = exactValue(({ '+': add, '-': sub, '*': mul, '/': div })[node.op](aValue.exact, bValue.exact))
      else value = { tex: node.op === '/' ? `\\frac{${aValue.tex}}{${bValue.tex}}` : `${valueTex(aValue)}${node.op === '*' ? '\\cdot' : node.op}${valueTex(bValue)}`, nonzero: ['*', '/'].includes(node.op) && aValue.nonzero && bValue.nonzero, positive: ['+', '*', '/'].includes(node.op) && aValue.positive && bValue.positive }
    }
    theorem = 'قضایای حد و پیوستگیِ اعمال جبری'
    condition = `حدهای اجزای عبارت متناهی و با مراحل قبلی ثابت‌اند.${node.op === '/' ? ' حد مخرج به‌طور نمادی ناصفر است؛ بنابراین تقسیم مجاز است.' : node.op === '^' ? ' توان صحیح است؛ برای توان ناصفرِ منفی، ناصفر بودن پایه بررسی شده است.' : ''}`
  } else return null
  if (value.positive) value.nonzero = true
  steps.push(cloneStep(theorem, condition, `\\lim_{${variable}\\to${rtex(a)}}${node.toTex()}=${value.tex}`, node.isFunctionNode ? 'composition' : 'algebra'))
  if (node.isFunctionNode) steps.at(-1).supplement = 'پیوستگی تابع ابتدایی: قضیهٔ استاندارد تکمیلی؛ قضیهٔ ترکیب: جزوهٔ ۲، صفحهٔ ۴.'
  return { value, steps }
}

function classifyContinuity(proof, valueInput, task) {
  if (!Number.isFinite(proof.at) || !proof.rigorous) return proof
  let value = proof.exactFunctionValue ?? null
  let valueTexAtPoint = value ? rtex(value) : null
  let defined = value !== null
  if (proof.valueSymbolic && proof.functionContinuous) { valueTexAtPoint = proof.valueSymbolic; defined = true }
  if (valueInput !== '' && valueInput !== undefined && valueInput !== null) {
    value = exactPoint(valueInput, proof.variable)
    if (!value) return unsupported(proof, 'مقدار بازتعریف‌شده باید عدد گویای دقیق، مثل ۰، 7 یا 1/2 باشد.', proof.steps)
    valueTexAtPoint = rtex(value)
    defined = true
    proof = { ...proof, functionValue: number(value) }
  }
  const bothFinite = proof.left !== null && proof.right !== null && !proof.left.includes('infty') && !proof.right.includes('infty')
  let continuity
  if (bothFinite && proof.left !== proof.right) continuity = { status: defined ? 'discontinuous' : 'undefined', classification: 'jump', title: defined ? 'ناپیوستگی نوع اول: پرشی' : 'نقطه تعریف نشده؛ رفتار پرشی', explanation: 'دو حد یک‌طرفه متناهی‌اند ولی برابر نیستند. هیچ مقداری در خود نقطه، این اختلاف را برطرف نمی‌کند.', reference: 'classification' }
  else if (!bothFinite) continuity = { status: defined ? 'discontinuous' : 'undefined', classification: 'second-kind', title: defined ? 'ناپیوستگی نوع دوم' : 'نقطه تعریف نشده؛ رفتار تکین یا نوسانی', explanation: 'دست‌کم یک حد یک‌طرفهٔ متناهی وجود ندارد. در اصطلاح جزوه، اگر تابع در این نقطه تعریف شود، ناپیوستگی از نوع دوم است.', reference: 'classification' }
  else if (!defined) continuity = { status: 'undefined', classification: 'removable-hole', title: 'تابع در نقطه تعریف نشده؛ تکینگی رفع‌شدنی', explanation: 'حد متناهی دوسویه وجود دارد. افزودن نقطه با مقدار برابر همین حد، یک امتداد پیوسته می‌سازد. پیوستگی تابع اصلی در نقطه‌ای بیرون دامنه ادعا نمی‌شود.', reference: 'continuity' }
  else {
    const same = proof.exactLimit && value ? equal(proof.exactLimit, value) : proof.functionContinuous && (valueInput === '' || valueInput === undefined || valueInput === null) ? true : null
    continuity = same === true ? { status: 'continuous', classification: 'continuous', title: 'تابع در نقطه پیوسته است', explanation: 'مقدار تابع تعریف شده و با حد متناهی دوسویه برابر است. در نقطهٔ خود a فاصلهٔ خروجی صفر است؛ با افزودن همین نقطه به برهان حد، شرط ε–δ پیوستگی هم برقرار می‌شود.', reference: 'continuity' } : same === false ? { status: 'discontinuous', classification: 'removable', title: 'ناپیوستگی نوع اول: رفع‌شدنی', explanation: 'دو حد یک‌طرفه برابر و متناهی‌اند، اما مقدار تابع با حد تفاوت دارد؛ با تغییر فقط مقدار همین نقطه به L، تابع پیوسته می‌شود.', reference: 'classification' } : { status: 'unknown', classification: 'unknown', title: 'مقایسهٔ نمادی مقدار تابع و حد پشتیبانی نشده است', explanation: 'حد با برهان به دست آمده، اما برابری یا نابرابری آن با مقدار بازتعریف‌شده به‌طور دقیق تشخیص داده نشده است. تقریب عددی برای این تصمیم استفاده نمی‌شود.', reference: 'continuity' }
  }
  const step = cloneStep('بررسی پیوستگی با تعریف و طبقه‌بندی', continuity.explanation, valueTexAtPoint ? `f(${proof.pointTex})=${valueTexAtPoint},\\quad \\lim_{x\\to a^-}f(x)=${proof.left ?? '\\nexists'},\\quad\\lim_{x\\to a^+}f(x)=${proof.right ?? '\\nexists'}` : `a\\notin D_f,\\quad\\lim_{x\\to a^-}f(x)=${proof.left ?? '\\nexists'},\\quad\\lim_{x\\to a^+}f(x)=${proof.right ?? '\\nexists'}`, continuity.reference)
  return { ...proof, continuity, steps: task === 'continuity' ? [...proof.steps, step] : proof.steps, ...(task === 'continuity' && continuity.status === 'unknown' ? { status: 'unsupported', rigorous: false, message: continuity.explanation } : {}) }
}

export function solveAnalysis(input, pointInput = '2', variable = 'x', options = {}) {
  const { task = 'limit', method = 'auto', pointValue = '' } = options
  let direction = task === 'continuity' ? 'both' : options.direction || 'both'
  try {
    if (!['limit', 'continuity'].includes(task) || !['auto', 'epsilon', 'theorems', 'squeeze', 'sequential'].includes(method) || !['both', 'left', 'right'].includes(direction)) throw new Error('تنظیم روش یا نوع مسئله معتبر نیست.')
    const expression = normalize(input), point = normalize(pointInput)
    const infinity = ['Infinity', '+Infinity', '-Infinity'].includes(point)
    if (infinity) direction = 'both'
    if (infinity && task === 'continuity') throw new Error('پیوستگی در یک نقطهٔ حقیقی بررسی می‌شود؛ برای بی‌نهایت، نوع مسئله را «حد» انتخاب کنید.')
    const a = infinity ? null : exactPoint(point, variable)
    const base = { expression, variable, point, pointTex: infinity ? point.startsWith('-') ? '-\\infty' : '+\\infty' : a ? rtex(a) : displayExpression(point, variable), at: infinity ? point.startsWith('-') ? -Infinity : Infinity : a ? number(a) : NaN, direction, task, method, tex: displayExpression(expression, variable), steps: [], functionValue: null }
    if (!infinity && (!a || !Number.isFinite(number(a)) || (number(a) === 0 && !zero(a)))) return unsupported(base, 'برای گواهی‌های دقیقِ فعلی، نقطهٔ میل باید عدد گویا باشد. نقطه‌های نمادی مانند pi و نقطه‌های خارج از محدودهٔ نمایش عددی، فعلاً گواهی آنالیزی ندارند.')
    const classroom = expression.match(/^(rationalSplit|dirichlet)\(([a-zA-Z])\)$/)
    let proof
    if (classroom && classroom[2] === variable) proof = classroomProof(base, a, classroom[1])
    else {
      const parsed = parseExpression(expression, variable)
      base.expression = parsed.expression
      base.functionValue = infinity ? null : m.realValue(parsed.tree, variable, number(a))
      proof = rationalProof(parsed, base, a, infinity) || squeezeProof(parsed, base, a, infinity) || sineProof(parsed, base, a) || sequentialProof(parsed, base, a) || floorProof(parsed, base, a)
      if (!proof && !infinity) {
        const theorem = elementaryProof(parsed.tree, variable, a)
        if (theorem) proof = complete(base, theorem.value.tex, theorem.value.tex, theorem.steps, ['theorems'], { exactLimit: theorem.value.exact, exactFunctionValue: theorem.value.exact, valueSymbolic: theorem.value.tex, functionContinuous: true, numericResult: Number.isFinite(base.functionValue) ? base.functionValue : null })
      }
    }
    if (!proof) return unsupported(base, 'برای این ورودی برهانِ دارای فرض‌های تأییدشده در روش‌های فعلی نداریم. پاسخ محاسباتی احتمالی، نمودار یا جدول عددی به‌عنوان اثبات ارائه نمی‌شود.')
    if (method !== 'auto' && !proof.methods.includes(method)) return unsupported(base, 'این روش برای این ورودی در دامنهٔ پیاده‌سازی نیست. روش «انتخاب خودکار» را برای مشاهدهٔ برهان موجود انتخاب کنید؛ روش محاسباتی جایگزینِ پنهان نمی‌شود.')
    if (task === 'continuity' && direction !== 'both') throw new Error('بررسی پیوستگی به حد دوسویه نیاز دارد.')
    proof = { ...proof, steps: proof.steps.map(step => ({ ...step, math: step.math?.replace(/\bx\b/g, variable) })) }
    const classified = classifyContinuity(proof, pointValue, task)
    return { ...classified, references: [...new Set(classified.steps.map(s => s.reference).filter(Boolean))].map(id => ({ id, ...proofReferences[id] })), proofOrigin: 'برهان برای این ورودی بر پایهٔ تعریف‌ها و قضایای مشخص‌شده ساخته شده است؛ نقلِ اثبات استاد نیست.', constants: proof.certificate ? certificateConstants(proof.certificate) : undefined }
  } catch (error) { return { status: 'error', message: error.message, rigorous: false, steps: [] } }
}

export function solveProblem(input, point, variable, options = {}) {
  const analysis = solveAnalysis(input, point, variable, options)
  const special = /^(rationalSplit|dirichlet)\(/.test(normalize(input))
  const computational = special ? { ...analysis, status: 'unsupported', rigorous: false, steps: [], message: 'عضویت در گویا/گنگ با اعداد ممیز شناور تصمیم‌پذیر نیست؛ این مثال با معیار دنباله‌ای یا نامساوی در حل آنالیزی بررسی می‌شود.' } : solveLimit(input, point, variable, options.task === 'continuity' || ['Infinity', '+Infinity', '-Infinity'].includes(normalize(point)) ? 'both' : options.direction || 'both')
  return { analysis, computational }
}
