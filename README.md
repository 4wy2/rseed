# رصيد — Raseed

هذا هو **Source Code لمشروع رصيد نفسه** (النسخة المبسطة الحالية من `raseed-money.zo2zo1777.chatgpt.site`) وليس HTML محفوظًا من الموقع المنشور ولا مشروعًا مشابهًا له.

النسخة الحالية هي نظام مالي جامعي بسيط يركز على:

- الرصيد الحالي.
- الدخل المستلم خلال الشهر.
- مصروفات الشهر.
- الالتزامات والدخل الشهري المتكرر.
- تأكيد الدفع أو الاستلام حتى لا تُحسب العملية مرتين.
- سجل العمليات وإضافة/تعديل/حذف العملية.
- الوضع الفاتح والداكن.
- واجهة عربية Mobile-first.

## تشغيل المشروع محليًا

المتطلبات:

- Node.js 20 أو أحدث (يفضل 22).
- npm.

ثم:

```bash
npm install
npm run dev
```

افتح:

```text
http://localhost:3000
```

في التشغيل المحلي يتم حفظ بياناتك في:

```text
.data/finance.json
```

هذا الملف داخل `.gitignore` حتى لا ترفع بياناتك المالية الشخصية إلى GitHub بالخطأ.

## البناء Production

```bash
npm run build
npm start
```

## رفعه على GitHub

بعد فك الضغط:

```bash
git init
git add .
git commit -m "Initial Raseed source"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/raseed.git
git push -u origin main
```

> رفع الكود إلى GitHub يعمل مباشرة. لتشغيل الموقع كخدمة حقيقية تحتاج منصة تشغل Next.js مثل Vercel/Cloudflare/Render. GitHub Pages وحده لا يشغل API Routes الخاصة بـ Next.js.

## الفرق بين النسخة المحلية والنسخة المنشورة

كود الواجهة، نموذج البيانات، الحسابات والمنطق المالي هي نفس بنية مشروع رصيد الحالي. النسخة المنشورة داخل ChatGPT كانت تستخدم خدمات مُدارة لتسجيل الدخول وقاعدة Cloudflare D1.

أسرار المنصة، مفاتيح الدخول، وربط قاعدة البيانات ليست Source Code ولا يمكن وضعها بأمان في ZIP. لذلك هذا التصدير يحتوي على:

- `app/chatgpt-auth.ts`: adapter محلي + دعم هيدر تعريف المستخدم في الاستضافة.
- `app/api/finance/route.ts`: نفس واجهة API لكن بحفظ JSON محلي حتى يعمل فورًا.
- `drizzle/0000_finance_workspaces.sql`: مخطط قاعدة البيانات المستخدمة في الاستضافة.
- `production/cloudflare/`: ملاحظات إعادة ربط Cloudflare D1 إذا أردت نشر نفس المعمارية.

## أهم الملفات

```text
app/
  page.tsx                 الصفحة الرئيسية
  money-app.tsx            واجهة رصيد الحالية وكل التفاعلات
  globals.css              التصميم Responsive / Light / Dark
  chatgpt-auth.ts           طبقة تعريف المستخدم
  api/finance/route.ts      API الحفظ والتحميل

lib/
  finance.ts                نموذج البيانات والتحقق والحسابات الأساسية
  simple-finance.ts         ملخص النسخة البسيطة الحالية
  local-store.ts            التخزين المحلي للتشغيل بدون خدمات خارجية

components/ui/              مكونات Dialog / Tabs / Table / Toast
public/favicon.svg          Asset شعار الموقع
db/schema.ts                مخطط بيانات Production
drizzle/*.sql               Migration قاعدة البيانات
package.json                جميع dependencies وإصداراتها
```

## Dependencies

لا يتم تضمين مجلد `node_modules` داخل ZIP لأنه ملف مولّد وقد يصل إلى مئات الميجابايت ولا يُرفع عادةً إلى GitHub. جميع المكتبات المطلوبة مثبتة ومحددة في `package.json`، و`npm install` يعيد إنشاء `node_modules`.

المكتبات الرئيسية:

- Next.js
- React
- TypeScript
- Lucide React
- Radix UI (Dialog / AlertDialog / Tabs)
- Sonner
- Zod

## ملاحظات البيانات

- كل مبلغ داخل نموذج البيانات يُخزن بوحدة **halala/cents** كعدد صحيح، مثال: `25 SAR = 2500`، لتجنب أخطاء الكسور العشرية.
- الدخل المتكرر لا يدخل الرصيد حتى تضغط تأكيد الاستلام.
- الالتزام لا يُخصم حتى تأكيد الدفع.
- عند تأكيد التزام، يُنشأ Transaction مرتبط بالشهر، لذلك لا يُخصم مرتين.
- التحقق يمنع العمليات المستقبلية والتكرار غير الصحيح للالتزام نفسه في الشهر نفسه.

## الترخيص

المشروع في هذا ZIP مخصص لك. أضف الترخيص الذي يناسبك قبل نشره كمشروع مفتوح المصدر.
