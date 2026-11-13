const tex = String.raw

export const sources = [
  { id: 1, file: 'حد و پیوستگی 1.pdf', pages: 3, topics: 'تعریف حد، معیار دنباله‌ای، یکتایی و اعمال جبری' },
  { id: 2, file: 'حد و پیوستگی 2.pdf', pages: 5, topics: 'پیوستگی در فضای متری، ترکیب توابع و تابع توما' },
  { id: 3, file: 'حد و پیوستگی 3.pdf', pages: 5, topics: 'تابع توما و معیار مجموعه‌های باز و بسته' },
  { id: 4, file: 'حد و پیوستگی 4 .pdf', pages: 5, topics: 'فشردگی، اکسترمم، پیوستگی یکنواخت و شرط هولدر' },
  { id: 5, file: 'حد و پیوستگی 5.pdf', pages: 4, topics: 'قضیهٔ هاینه–کانتور و تصویر بستار' },
  { id: 6, file: 'حد و پیوستگی 6.pdf', pages: 5, topics: 'مجموعهٔ صفر، همبندی، مقدار میانی و بولتسانو' },
  { id: 7, file: 'حد و پیوستگی 7.pdf', pages: 9, topics: 'حد یک‌طرفه، ناپیوستگی، توابع یکنوا و شمارایی' }
]

export const lessons = [
  {
    id: 'limit', title: 'تعریف حد در فضای متری', short: 'مفهوم و تعریف حد', category: 'مبانی حد', minutes: 12, source: [1, 1], icon: 'limit',
    intro: 'حد رفتار تابع در نزدیکی یک نقطه را توصیف می‌کند. مقدار تابع در خود نقطه، به‌تنهایی حد را تعیین نمی‌کند. جزوه از تعریف عمومی در فضای متری آغاز می‌کند.',
    blocks: [
      { title: 'تعریف در فضای متری', text: 'فرض کنید تابع روی E تعریف شده و p نقطهٔ تجمع E باشد. برای هر دقت مثبت در خروجی، باید همسایگی مناسبی در ورودی پیدا کنیم. در تعریف حد، خود p کنار گذاشته می‌شود.', math: tex`\lim_{x\to p}f(x)=q\iff \forall\varepsilon>0\;\exists\delta>0:\;x\in E,\;0<d_X(x,p)<\delta\Rightarrow d_Y(f(x),q)<\varepsilon` },
      { title: 'در خط حقیقی', text: 'فاصلهٔ متری معمول در خط حقیقی همان قدرمطلق تفاضل است. شرط صفر بودن فاصله را حذف نکنید؛ ممکن است تابع در p اصلاً تعریف نشده باشد.', math: tex`0<|x-a|<\delta\quad\Rightarrow\quad |f(x)-L|<\varepsilon` },
      { title: 'یکتایی حد', text: 'اگر حد در یک نقطهٔ تجمع وجود داشته باشد، یکتا است. در جزوه این نتیجه با معیار دنباله‌ای و یکتایی حد دنباله اثبات می‌شود.', math: tex`\lim_{x\to p}f(x)=q,\quad\lim_{x\to p}f(x)=r\quad\Rightarrow\quad q=r` }
    ],
    example: { label: 'مثال تکمیلی برای تمرین تعریف', math: tex`\lim_{x\to 2}3x=6,\qquad\delta=\frac{\varepsilon}{3}`, text: 'اگر فاصلهٔ x از ۲ کمتر از ε/۳ باشد، فاصلهٔ 3x از ۶ کمتر از ε می‌شود.' },
    exercise: { question: 'برای اثبات حد تابع 2x در نقطهٔ ۱، چه δای کافی است؟', answer: 'انتخاب δ = ε/۲ کافی است؛ چون |2x−2| = 2|x−1|.' }
  },
  {
    id: 'sequences', title: 'حد از نگاه دنباله‌ها', short: 'معیار دنباله‌ای حد', category: 'مبانی حد', minutes: 15, source: [1, '۱–۲'], icon: 'sequence',
    intro: 'به‌جای بررسی همهٔ نقاط نزدیک p، می‌توان هر دنباله‌ای را که از دامنه به p نزدیک می‌شود در نظر گرفت. این معیار هم برای اثبات حد و هم برای رد وجود آن مفید است.',
    blocks: [
      { title: 'معیار دنباله‌ای', text: 'p باید نقطهٔ تجمع دامنه باشد. دنباله‌ها در E بدون p انتخاب می‌شوند؛ این شرط در صورت استاندارد قضیه لازم است.', math: tex`\lim_{x\to p}f(x)=q\iff \bigl(\forall(x_n)\subset E\setminus\{p\}:\;x_n\to p\Rightarrow f(x_n)\to q\bigr)` },
      { title: 'راه رد کردن حد', text: 'دو دنباله با مقصد یکسان و دو حد متفاوت برای خروجی پیدا کنید. به دلیل یکتایی حد، تابع نمی‌تواند در آن نقطه حد داشته باشد.', math: tex`x_n,y_n\to p,\quad f(x_n)\to A,\quad f(y_n)\to B,\quad A\ne B` }
    ],
    example: { label: 'مثال جزوهٔ ۲، صفحات ۱–۲', math: tex`f(x)=\begin{cases}x&x\in\mathbb{Q}\\0&x\notin\mathbb{Q}\end{cases}`, text: 'در هر نقطهٔ غیرصفر، دنباله‌های گویا و گنگ رفتار متفاوتی می‌دهند. در صفر، |f(x)| ≤ |x| است؛ پس حد صفر است و تابع در صفر پیوسته است.' },
    exercise: { question: 'آیا این تابع در نقطهٔ ۱ حد دارد؟', answer: 'خیر. روی دنباله‌های گویا خروجی به ۱ و روی دنباله‌های گنگ به صفر نزدیک می‌شود.' }
  },
  {
    id: 'algebra', title: 'قوانین جبری حد', short: 'جمع، ضرب و تقسیم حدها', category: 'مبانی حد', minutes: 10, source: [1, 3], icon: 'formula',
    intro: 'وقتی حدهای متناهی دو تابع وجود دارند، می‌توان حد جمع و ضرب را با عمل روی حدها محاسبه کرد. تقسیم یک شرط اضافه دارد: حد مخرج نباید صفر باشد.',
    blocks: [
      { title: 'جمع و تفاضل', text: 'فرض کنید حد f برابر A و حد g برابر B باشد. این قوانین برای توابع حقیقی یا مختلط با حدهای متناهی به کار می‌روند.', math: tex`\lim_{x\to p}(f(x)\pm g(x))=A\pm B` },
      { title: 'ضرب و خارج‌قسمت', text: 'صفر بودن حد مخرج اجازهٔ استفاده از قانون تقسیم را نمی‌دهد. شکل ۰/۰ یک عدد یا پاسخ نهایی نیست.', math: tex`\lim_{x\to p}f(x)g(x)=AB,\qquad \lim_{x\to p}\frac{f(x)}{g(x)}=\frac AB\quad(B\ne0)` },
      { title: 'چندجمله‌ای‌ها و توابع گویا', text: 'این نتیجهٔ تکمیلی از اعمال جبری به دست می‌آید: چندجمله‌ای با جای‌گذاری محاسبه می‌شود؛ برای تابع گویا ابتدا مخرج را بررسی کنید.', math: tex`\lim_{x\to a}P(x)=P(a),\qquad \lim_{x\to a}\frac{P(x)}{Q(x)}=\frac{P(a)}{Q(a)}\quad(Q(a)\ne0)` }
    ],
    example: { label: 'مثال محاسباتی تکمیلی', math: tex`\lim_{x\to2}\frac{x^2-4}{x-2}=\lim_{x\to2}(x+2)=4`, text: 'در همسایگی سوراخ‌شدهٔ ۲، عامل x−2 ناصفر است و حذف آن مجاز است. تابع اصلی در ۲ تعریف نشده، اما حد وجود دارد.' },
    exercise: { question: 'آیا می‌توان قانون تقسیم را مستقیماً برای همین مثال استفاده کرد؟', answer: 'خیر؛ حد مخرج صفر است. ابتدا باید عامل مشترک را برای x ≠ ۲ حذف کرد.' }
  },
  {
    id: 'continuity', title: 'پیوستگی در یک نقطه', short: 'شرایط پیوستگی و ترکیب', category: 'پیوستگی', minutes: 12, source: [2, '۲–۴'], icon: 'curve',
    intro: 'پیوستگی یعنی خروجی تابع در نزدیکی p به مقدار خود تابع در p نزدیک شود. تعریف ε–δ در هر نقطهٔ دامنه، حتی نقطهٔ منفرد، قابل استفاده است.',
    blocks: [
      { title: 'تعریف دقیق', text: 'برای هر ε مثبت، δ مثبتی وجود دارد که همهٔ نقاط دامنه در فاصلهٔ کمتر از δ را کنترل می‌کند.', math: tex`\forall\varepsilon>0\;\exists\delta>0:\;x\in E,\;d_X(x,p)<\delta\Rightarrow d_Y(f(x),f(p))<\varepsilon` },
      { title: 'سه شرط در یک نقطهٔ تجمع', text: 'مقدار تابع تعریف شده باشد، حد وجود داشته باشد و این دو برابر باشند. در نقطهٔ منفرد، هر تابعی نسبت به دامنه‌اش پیوسته است.', math: tex`f(p)\text{ defined},\quad \lim_{x\to p}f(x)\text{ exists},\quad\lim_{x\to p}f(x)=f(p)` },
      { title: 'ترکیب توابع پیوسته', text: 'اگر f در p و g در f(p) پیوسته باشند، ترکیب نیز در p پیوسته است.', math: tex`\lim_{x\to p}g(f(x))=g(f(p))` }
    ],
    example: { label: 'مثال تکمیلی', math: tex`f(x)=\begin{cases}\frac{x^2-4}{x-2}&x\ne2\\4&x=2\end{cases}`, text: 'با تعریف مقدار ۴ در نقطهٔ ۲، حفره پر می‌شود و تابع پیوسته خواهد بود.' },
    exercise: { question: 'اگر مقدار تابع در ۲ برابر ۷ قرار داده شود چه اتفاقی می‌افتد؟', answer: 'حد همچنان ۴ است، ولی تابع در ۲ پیوسته نیست؛ چون مقدار تابع با حد برابر نیست.' }
  },
  {
    id: 'thomae', title: 'تابع توما', short: 'پیوستگی در گنگ‌ها', category: 'پیوستگی', minutes: 18, source: [3, '۱–۲'], icon: 'sequence',
    intro: 'این مثال نشان می‌دهد پیوستگی را نمی‌توان تنها از ظاهر یک ضابطه حدس زد. تابع توما در هر عدد گنگ پیوسته و در هر عدد گویا ناپیوسته است.',
    blocks: [
      { title: 'تعریف تابع', text: 'برای عدد گویای m/n، کسر باید در ساده‌ترین صورت و مخرج مثبت باشد؛ برای اعداد گنگ مقدار تابع صفر است.', math: tex`T(x)=\begin{cases}\frac1n&x=\frac mn,\;\gcd(m,n)=1,\;n>0\\0&x\notin\mathbb Q\end{cases}` },
      { title: 'چرا در گویاها ناپیوسته است؟', text: 'به هر عدد گویای p با دنباله‌ای از اعداد گنگ نزدیک شوید. خروجی‌ها صفر هستند، در حالی که T(p) مثبت است.', math: tex`r_k\notin\mathbb Q,\quad r_k\to\frac mn\quad\Rightarrow\quad T(r_k)=0\not\to\frac1n` },
      { title: 'چرا در گنگ‌ها پیوسته است؟', text: 'برای هر ε، تنها تعداد متناهی از کسرهای یک بازهٔ کراندار می‌توانند مخرج کمتر از یک کران مشخص داشته باشند. در همسایگی کوچک یک عدد گنگ، این کسرها را کنار می‌گذاریم؛ بقیهٔ مقادیر کمتر از ε هستند.', math: tex`\frac1n<\varepsilon\quad\text{for sufficiently large }n` }
    ],
    exercise: { question: 'مقدار T(۲/۳) و T(√۲) چیست؟', answer: 'به‌ترتیب ۱/۳ و صفر. تابع در ۲/۳ ناپیوسته و در √۲ پیوسته است.' }
  },
  {
    id: 'topology', title: 'پیوستگی و تصویر معکوس', short: 'معیار مجموعه‌های باز و بسته', category: 'قضیه‌ها', minutes: 16, source: [3, '۲–۵'], icon: 'layers',
    intro: 'پیوستگی تنها یک شرط فاصله‌ای نیست؛ می‌توان آن را با رفتار تصویر معکوس مجموعه‌ها نیز شناخت. منظور از تصویر معکوس، تابع وارون نیست.',
    blocks: [
      { title: 'معیار مجموعه‌های باز', text: 'تابع بین دو فضای متری پیوسته است اگر و تنها اگر تصویر معکوس هر مجموعهٔ باز در مقصد، در مبدأ باز باشد.', math: tex`f\text{ continuous}\iff \forall V\subseteq Y\text{ open}:\;f^{-1}(V)\text{ open in }X` },
      { title: 'معیار مجموعه‌های بسته', text: 'با استفاده از متمم‌ها، صورت معادل برای مجموعه‌های بسته حاصل می‌شود.', math: tex`f^{-1}(Y\setminus F)=X\setminus f^{-1}(F)` },
      { title: 'مجموعهٔ صفر یک تابع پیوسته', text: 'تمرین جزوهٔ ۶: برای یک تابع حقیقی پیوسته، تصویر معکوس مجموعهٔ بستهٔ {۰} بسته است.', math: tex`Z(f)=\{x\in X:f(x)=0\}=f^{-1}(\{0\})\text{ is closed}` }
    ],
    exercise: { question: 'آیا تصویر مستقیم هر مجموعهٔ باز تحت تابع پیوسته باز است؟', answer: 'خیر. تابع ثابت پیوسته است، اما تصویر هر مجموعهٔ ناتهی تنها یک نقطه است و در خط حقیقی باز نیست.' }
  },
  {
    id: 'compact', title: 'پیوستگی روی مجموعه‌های فشرده', short: 'تصویر فشرده و اکسترمم', category: 'قضیه‌ها', minutes: 14, source: [4, '۱–۲'], icon: 'layers',
    intro: 'فشردگی با پیوستگی خوب رفتار می‌کند: تصویر یک مجموعهٔ فشرده تحت تابع پیوسته، فشرده باقی می‌ماند.',
    blocks: [
      { title: 'حفظ فشردگی', text: 'در اثبات جزوه، یک پوشش باز در مقصد با تصویر معکوس به پوششی در مبدأ تبدیل می‌شود و زیرپوشش متناهی نتیجه می‌دهد.', math: tex`E\subseteq X\text{ compact},\quad f:X\to Y\text{ continuous}\Rightarrow f(E)\text{ compact}` },
      { title: 'قضیهٔ اکسترمم', text: 'یک تابع حقیقی پیوسته روی مجموعهٔ فشردهٔ ناتهی کراندار است و بیشینه و کمینهٔ خود را اختیار می‌کند.', math: tex`\exists p,q\in E:\quad f(p)=\max_{x\in E}f(x),\qquad f(q)=\min_{x\in E}f(x)` }
    ],
    example: { label: 'مثال تکمیلی برای نقش فشردگی', math: tex`f(x)=x\quad\text{on }(0,1)`, text: 'تابع روی بازهٔ باز کراندار و پیوسته است، اما نه بیشینه و نه کمینه دارد. حذف فرض فشردگی می‌تواند نتیجه را از بین ببرد.' },
    exercise: { question: 'بیشینه و کمینهٔ x² روی [−۱،۲] چیست؟', answer: 'کمینه صفر در x=۰ و بیشینه ۴ در x=۲ است.' }
  },
  {
    id: 'uniform', title: 'پیوستگی یکنواخت', short: 'تعریف پیوستگی یکنواخت', category: 'پیوستگی یکنواخت', minutes: 18, source: [4, '۲–۵'], icon: 'curve',
    intro: 'در پیوستگی معمولی δ می‌تواند به نقطه بستگی داشته باشد؛ در پیوستگی یکنواخت باید یک δ برای تمام جفت‌نقاط دامنه کار کند.',
    blocks: [
      { title: 'تعریف', text: 'ترتیب کمیت‌گذارها مهم است: ابتدا ε، سپس δ، و پس از آن همهٔ x و y انتخاب می‌شوند.', math: tex`\forall\varepsilon>0\;\exists\delta>0\;\forall x,y\in E:\quad d_X(x,y)<\delta\Rightarrow d_Y(f(x),f(y))<\varepsilon` },
      { title: 'پیوستگی یکنواخت، پیوستگی را نتیجه می‌دهد', text: 'عکس این گزاره در حالت کلی درست نیست. تابع ۱/x روی اعداد مثبت پیوسته است، اما نزدیک صفر تغییرات آن قابل کنترل با یک δ سراسری نیست.', math: tex`x_n=\frac1n,\quad y_n=\frac1{n+1},\quad|x_n-y_n|\to0,\quad\left|\frac1{x_n}-\frac1{y_n}\right|=1` },
      { title: 'شرط لیپشیتس و هولدر', text: 'اگر برای ثابت‌های C و α مثبت، این نامساوی روی کل دامنه برقرار باشد، تابع یکنواخت پیوسته است. صورت ثابت در اینجا با نمادگذاری استاندارد بازنویسی شده است.', math: tex`|f(x)-f(y)|\le C|x-y|^\alpha,\qquad\delta=\left(\frac\varepsilon C\right)^{1/\alpha}\quad(C>0)` }
    ],
    exercise: { question: 'چرا تابع همانی روی R یکنواخت پیوسته است؟', answer: 'چون |f(x)−f(y)| = |x−y| و انتخاب δ=ε برای همهٔ نقاط کافی است.' }
  },
  {
    id: 'heine', title: 'قضیهٔ هاینه–کانتور', short: 'قضیهٔ هاینه–کانتور', category: 'پیوستگی یکنواخت', minutes: 15, source: [5, '۱–۳'], icon: 'layers',
    intro: 'هر تابع پیوسته از یک فضای متری فشرده به یک فضای متری، یکنواخت پیوسته است. این نتیجه فاصلهٔ میان پیوستگی موضعی و کنترل سراسری را پر می‌کند.',
    blocks: [
      { title: 'صورت قضیه', text: 'فشردگی دامنه فرض اساسی قضیه است؛ فشردگی مقصد لازم نیست.', math: tex`X\text{ compact},\quad f:X\to Y\text{ continuous}\quad\Rightarrow\quad f\text{ uniformly continuous}` },
      { title: 'ایدهٔ اثبات جزوه', text: 'برای هر نقطه همسایگی‌ای انتخاب می‌شود که تغییر خروجی کمتر از ε/۲ باشد. از فشردگی، تعداد متناهی از این همسایگی‌ها کافی است. سپس یک δ کوچک مشترک انتخاب می‌شود و نامساوی مثلثی نتیجه را می‌دهد.', math: tex`d_Y(f(x),f(y))\le d_Y(f(x),f(x_j))+d_Y(f(x_j),f(y))<\frac\varepsilon2+\frac\varepsilon2=\varepsilon` },
      { title: 'تصویر بستار', text: 'تمرین صفحات ۳–۴ جزوهٔ ۵: برای تابع پیوسته، تصویر بستار E در بستار تصویر E قرار دارد. برابری در حالت کلی لازم نیست.', math: tex`f(\overline E)\subseteq\overline{f(E)}` }
    ],
    example: { label: 'مثال جزوهٔ ۵', math: tex`f(x)=\frac1x\quad\text{on }[a,b],\qquad 0<a<b`, text: 'دامنه فشرده است و تابع روی آن پیوسته است؛ بنابراین یکنواخت پیوسته است.' },
    exercise: { question: 'آیا x² روی [۰،۱] یکنواخت پیوسته است؟', answer: 'بله؛ از هاینه–کانتور. همچنین |x²−y²|≤۲|x−y| روی این بازه.' }
  },
  {
    id: 'intermediate', title: 'همبندی و مقدار میانی', short: 'مقدار میانی و بولتسانو', category: 'قضیه‌ها', minutes: 16, source: [6, '۱–۵'], icon: 'curve',
    intro: 'تصویر یک مجموعهٔ همبند تحت تابع پیوسته همبند است. در خط حقیقی، مجموعه‌های همبند همان بازه‌ها هستند؛ بنابراین یک تابع پیوسته نمی‌تواند از روی مقدارهای میانی بپرد.',
    blocks: [
      { title: 'حفظ همبندی', text: 'اگر E همبند و f روی آن پیوسته باشد، f(E) نیز همبند است.', math: tex`E\text{ connected},\quad f\text{ continuous}\quad\Rightarrow\quad f(E)\text{ connected}` },
      { title: 'قضیهٔ مقدار میانی', text: 'برای تابع حقیقی پیوسته روی [a,b]، هر λ بین f(a) و f(b) دست‌کم در یک نقطهٔ میانی اختیار می‌شود.', math: tex`f(a)<\lambda<f(b)\quad\Rightarrow\quad\exists c\in(a,b):f(c)=\lambda` },
      { title: 'نتیجهٔ بولتسانو', text: 'اگر مقادیر دو سر بازه علامت مخالف داشته باشند، دست‌کم یک ریشه درون بازه وجود دارد. این قضیه به‌تنهایی یکتایی ریشه را نمی‌گوید.', math: tex`f(a)f(b)<0\quad\Rightarrow\quad\exists c\in(a,b):f(c)=0` }
    ],
    example: { label: 'مثال تکمیلی', math: tex`f(x)=x^3-x-1,\qquad f(1)=-1,\quad f(2)=5`, text: 'تابع چندجمله‌ای پیوسته است و تغییر علامت دارد؛ پس یک ریشه در بازهٔ (۱،۲) وجود دارد.' },
    exercise: { question: 'آیا تغییر علامت تابع ۱/x بین −۱ و ۱ وجود ریشه را تضمین می‌کند؟', answer: 'خیر؛ تابع در صفر تعریف نشده و روی کل بازه پیوسته نیست. فرض قضیه برقرار نیست.' }
  },
  {
    id: 'sides', title: 'حدهای یک‌طرفه و ناپیوستگی', short: 'از چپ، از راست', category: 'حد یک‌طرفه', minutes: 14, source: [7, '۱–۳'], icon: 'limit',
    intro: 'گاهی رفتار تابع از دو سمت متفاوت است. حد دوسویه زمانی وجود دارد که حد چپ و راست وجود داشته و برابر باشند.',
    blocks: [
      { title: 'تعریف حد یک‌طرفه', text: 'در حد چپ فقط xهای کوچک‌تر از c و در حد راست فقط xهای بزرگ‌تر از c بررسی می‌شوند. در عبارت فاصلهٔ خروجی باید مقدار حد L نوشته شود.', math: tex`\lim_{x\to c^-}f(x)=L\iff\forall\varepsilon>0\;\exists\delta>0:\;0<c-x<\delta\Rightarrow|f(x)-L|<\varepsilon` },
      { title: 'شرط وجود حد دوسویه و پیوستگی', text: 'برای پیوستگی باید علاوه بر برابری حدهای یک‌طرفه، مقدار تابع نیز با آن‌ها برابر باشد.', math: tex`\lim_{x\to c^-}f(x)=\lim_{x\to c^+}f(x)=L,\qquad f(c)=L\;\text{for continuity}` },
      { title: 'انواع ناپیوستگی', text: 'اگر هر دو حد یک‌طرفه متناهی باشند، ناپیوستگی از نوع اول است؛ شامل حفرهٔ رفع‌شدنی و پرش. اگر دست‌کم یکی از حدهای متناهی یک‌طرفه وجود نداشته باشد، ناپیوستگی از نوع دوم است.', math: tex`f(x)=\sin\frac1x\quad(x\ne0)` }
    ],
    example: { label: 'مثال جزوهٔ ۷، صفحهٔ ۳', math: tex`f(x)=\begin{cases}\sin(1/x)&x\ne0\\0&x=0\end{cases}`, text: 'تابع در صفر نوسان می‌کند و حد یک‌طرفهٔ متناهی ندارد؛ بنابراین در صفر ناپیوستگی نوع دوم دارد.' },
    exercise: { question: 'حد چپ و راست |x|/x در صفر چیست؟', answer: 'حد چپ منفی یک و حد راست یک است؛ حد دوسویه وجود ندارد. این مثال تکمیلی یک پرش را نشان می‌دهد.' }
  },
  {
    id: 'monotone', title: 'توابع یکنوا و شمارایی ناپیوستگی‌ها', short: 'حدهای توابع صعودی', category: 'حد یک‌طرفه', minutes: 20, source: [7, '۴–۹'], icon: 'sequence',
    intro: 'برای تابع صعودی روی یک بازه، حدهای یک‌طرفه در نقاط داخلی وجود دارند. فاصلهٔ میان این دو حد ابزار مهمی برای بررسی ناپیوستگی است.',
    blocks: [
      { title: 'تعریف صعودی', text: 'صعودی با اکیداً صعودی فرق دارد؛ در حالت نخست برابری خروجی‌ها مجاز است.', math: tex`x<y\Rightarrow f(x)\le f(y)` },
      { title: 'حد چپ و راست با سوپریمم و اینفیمم', text: 'برای نقطهٔ داخلی x از (a,b)، مقادیر دو طرف توسط مقدار تابع در نقاط مجاور کراندارند؛ پس این حدها متناهی‌اند.', math: tex`f(x^-)=\sup_{a<t<x}f(t)\le f(x)\le\inf_{x<t<b}f(t)=f(x^+)` },
      { title: 'ناپیوستگی‌ها حداکثر شمارایند', text: 'برای هر پرش، یک عدد گویا در بازهٔ باز بین حد چپ و راست انتخاب می‌شود. بازه‌های پرش برای نقاط مختلف هم‌پوشانی ندارند؛ پس نگاشت یک‌به‌یکی به گویاها ساخته می‌شود.', math: tex`f(x^-)<r_x<f(x^+),\qquad r_x\in\mathbb Q` },
      { title: 'نتیجهٔ پایانی جزوه', text: 'اگر یک تابع حقیقی روی R پیوسته باشد و تمام مقادیرش گویا باشند، ثابت است؛ وگرنه قضیهٔ مقدار میانی یک مقدار گنگ بین دو خروجی متفاوت را نیز تحمیل می‌کند.', math: tex`f:\mathbb R\to\mathbb Q,\quad f\text{ continuous as a real-valued function}\Rightarrow f\text{ constant}` }
    ],
    exercise: { question: 'آیا تابع صعودی می‌تواند در یک نقطهٔ داخلی ناپیوستگی نوسانی داشته باشد؟', answer: 'خیر؛ حد چپ و راست متناهی وجود دارند و ناپیوستگی آن نقطه از نوع پرش است.' }
  }
]

export const formulas = [
  { id: 'sum', title: 'جمع و تفاضل حدها', group: 'قوانین حد', source: [1, 3], math: tex`\lim_{x\to a}(f\pm g)(x)=A\pm B`, text: 'به شرط وجود حدهای متناهی f و g، به‌ترتیب A و B.', example: tex`\lim_{x\to2}(x^2+x)=4+2=6` },
  { id: 'product', title: 'ضرب حدها', group: 'قوانین حد', source: [1, 3], math: tex`\lim_{x\to a}(fg)(x)=AB`, text: 'هر دو حد باید متناهی و موجود باشند.', example: tex`\lim_{x\to1}x(x+2)=1\cdot3=3` },
  { id: 'quotient', title: 'تقسیم حدها', group: 'قوانین حد', source: [1, 3], math: tex`\lim_{x\to a}\frac{f(x)}{g(x)}=\frac AB\quad(B\ne0)`, text: 'اگر حد مخرج صفر است، این قانون مستقیماً قابل استفاده نیست.', example: tex`\lim_{x\to2}\frac{x+1}{x+3}=\frac35` },
  { id: 'poly', title: 'حد چندجمله‌ای و تابع گویا', group: 'قوانین حد', math: tex`\lim_{x\to a}P(x)=P(a),\quad\lim_{x\to a}\frac{P(x)}{Q(x)}=\frac{P(a)}{Q(a)}\;(Q(a)\ne0)`, text: 'نتیجهٔ تکمیلی از اعمال جبری و پیوستگی توابع چندجمله‌ای.', example: tex`\lim_{x\to3}(x^2-2x)=3` },
  { id: 'sinc', title: 'حد بنیادی سینوسی', group: 'حدهای ویژه', math: tex`\lim_{x\to0}\frac{\sin x}{x}=1`, text: 'فرمول تکمیلی؛ زاویه بر حسب رادیان است.', example: tex`\lim_{x\to0}\frac{\sin(3x)}x=3` },
  { id: 'cos', title: 'حد بنیادی کسینوسی', group: 'حدهای ویژه', math: tex`\lim_{x\to0}\frac{1-\cos x}{x^2}=\frac12`, text: 'فرمول تکمیلی؛ با اتحاد 1−cos x = 2sin²(x/2) حاصل می‌شود.', example: tex`\lim_{x\to0}\frac{1-\cos(2x)}{x^2}=2` },
  { id: 'exp', title: 'حد نمایی و لگاریتمی', group: 'حدهای ویژه', math: tex`\lim_{x\to0}\frac{e^x-1}{x}=1,\qquad\lim_{x\to0}\frac{\ln(1+x)}x=1`, text: 'فرمول‌های تکمیلی. در فرمول لگاریتمی، x نزدیک صفر و 1+x مثبت است.', example: tex`\lim_{x\to0}\frac{e^{2x}-1}{x}=2` },
  { id: 'infinity', title: 'حد تابع گویا در بی‌نهایت', group: 'حدهای ویژه', math: tex`\lim_{x\to\infty}\frac{a_mx^m+\cdots}{b_nx^n+\cdots}=\begin{cases}0&m<n\\a_m/b_n&m=n\end{cases}`, text: 'فرمول تکمیلی؛ ضرایب پیشرو ناصفرند. اگر درجهٔ صورت بزرگ‌تر باشد، علامت و جهت بی‌نهایت را بررسی کنید.', example: tex`\lim_{x\to\infty}\frac{2x^2+1}{x^2-3}=2` },
  { id: 'sides', title: 'شرط وجود حد دوسویه', group: 'پیوستگی', source: [7, 1], math: tex`\lim_{x\to a}f(x)=L\iff\lim_{x\to a^-}f(x)=\lim_{x\to a^+}f(x)=L`, text: 'در یک نقطهٔ داخلی دامنه، حد چپ و راست باید موجود و برابر باشند.', example: tex`\lim_{x\to0^-}\frac{|x|}x=-1\ne1=\lim_{x\to0^+}\frac{|x|}x` },
  { id: 'continuity', title: 'پیوستگی در نقطهٔ تجمع', group: 'پیوستگی', source: [2, 2], math: tex`\lim_{x\to a}f(x)=f(a)`, text: 'مقدار تابع تعریف شده، حد موجود، و حد با مقدار تابع برابر باشد.', example: tex`\lim_{x\to2}x^2=4=f(2)` },
  { id: 'uniform', title: 'پیوستگی یکنواخت', group: 'پیوستگی', source: [4, 3], math: tex`\forall\varepsilon>0\;\exists\delta>0\;\forall x,y\in E:\quad d(x,y)<\delta\Rightarrow d(f(x),f(y))<\varepsilon`, text: 'δ به نقطه وابسته نیست و برای تمام دامنه یکسان انتخاب می‌شود.' },
  { id: 'ivt', title: 'قضیهٔ مقدار میانی', group: 'قضیه‌ها', source: [6, '۴–۵'], math: tex`f(a)<\lambda<f(b)\Rightarrow\exists c\in(a,b):f(c)=\lambda`, text: 'f باید روی بازهٔ بستهٔ [a,b] پیوسته باشد.' },
  { id: 'monotone', title: 'حدهای یک‌طرفهٔ تابع صعودی', group: 'قضیه‌ها', source: [7, '۴–۶'], math: tex`f(x^-)=\sup_{a<t<x}f(t),\qquad f(x^+)=\inf_{x<t<b}f(t)`, text: 'برای تابع صعودی روی (a,b) و نقطهٔ داخلی x.' }
]

export const examples = [
  { label: 'حذف عامل مشترک', expression: '(x^2-4)/(x-2)', point: '2' },
  { label: 'حد مثلثاتی', expression: 'sin(x)/x', point: '0' },
  { label: 'حد چپ و راست', expression: 'abs(x)/x', point: '0' },
  { label: 'حد نامتناهی', expression: '1/x', point: '0' },
  { label: 'در بی‌نهایت', expression: '(2x^2+1)/(x^2-3)', point: 'Infinity' },
  { label: 'تابع نوسانی', expression: 'sin(1/x)', point: '0' }
]
