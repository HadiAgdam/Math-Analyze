export const proofReferences = {
  definition: { label: 'تعریف حد در فضای متری و معیار دنباله‌ای', file: 1, page: 1 },
  algebra: { label: 'قضایای جمع، ضرب و خارج‌قسمت حدها', file: 1, page: 3 },
  inequalities: { label: 'استدلال با نامساوی برای تابع گویا/گنگ', file: 2, page: 1 },
  continuity: { label: 'تعریف پیوستگی', file: 2, page: 2 },
  composition: { label: 'پیوستگی ترکیب و معیار دنباله‌ای پیوستگی', file: 2, page: 4 },
  sides: { label: 'حدهای یک‌طرفه و شرط پیوستگی', file: 7, page: 1 },
  classification: { label: 'ناپیوستگی نوع اول و دوم', file: 7, page: 2 },
  oscillation: { label: 'مثال نوسان سینوسِ معکوس متغیر', file: 7, page: 3 },
  squeeze: { label: 'قضیهٔ محصورسازی حد (فشردگی حد): صورت استاندارد تکمیلی؛ نامساویِ متناظر در جزوهٔ ۲، صفحهٔ ۱', supplemental: true },
  infinity: { label: 'تعریف‌های ε–B و M–δ و برآورد چندجمله‌ای: تکمیلی', supplemental: true },
  elementary: { label: 'پیوستگی توابع ابتدایی و نامساوی‌های مثلثاتی در رادیان: تکمیلی', supplemental: true }
}

export const analysisExamples = [
  { label: 'تعریف ε–δ برای تابع گویا', expression: '(x^2-4)/(x-2)', point: '2', method: 'epsilon' },
  { label: 'حد با نامساوی و محصورسازی', expression: 'x^2*sin(1/x)', point: '0', method: 'squeeze' },
  { label: 'مثال گویا/گنگ جزوه', expression: 'rationalSplit(x)', point: '0', method: 'auto' },
  { label: 'رد حد با معیار دنباله‌ای', expression: 'sin(1/x)', point: '0', method: 'sequential' },
  { label: 'تعریف حد نامتناهی', expression: '1/x^2', point: '0', method: 'epsilon' },
  { label: 'تعریف حد در بی‌نهایت', expression: '(2x^2+1)/(x^2-3)', point: 'Infinity', method: 'epsilon' },
  { label: 'بررسی ناپیوستگی رفع‌شدنی', expression: '(x^2-4)/(x-2)', point: '2', task: 'continuity', pointValue: '7', method: 'auto' },
  { label: 'ناپیوستگی پرشی جزءصحیح', expression: 'floor(x)', point: '0', task: 'continuity', method: 'auto' },
  { label: 'قضیهٔ پیوستگی ترکیب', expression: 'sin(x^2)+sqrt(x+1)', point: '0', method: 'theorems' }
]
