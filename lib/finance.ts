import { z } from 'zod';

const centsSchema = z.number().int().min(0).max(100000000000);
const idSchema = z.string().min(1).max(100);
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v);
const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
export const transactionSchema = z.object({
  id: idSchema,
  amount: centsSchema.refine(v => v > 0),
  type: z.enum(['expense','income']),
  categoryId: idSchema,
  merchant: z.string().max(100),
  date: dateSchema,
  payment: z.enum(['card','cash','transfer']),
  note: z.string().max(500),
  need: z.enum(['need','want','unspecified']),
  tags: z.array(z.string().max(40)).max(10),
  recurringId: z.string().max(100).optional(),
  occurrenceMonth: monthSchema.optional(),
});
export const stateSchema = z.object({
  initialized: z.boolean(),
  openingBalance: centsSchema,
  openingDate: dateSchema,
  reserved: centsSchema,
  categories: z.array(z.object({
    id: idSchema,
    name: z.string().min(1).max(40),
    icon: z.string().max(30),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  })).max(100),
  transactions: z.array(transactionSchema).max(20000),
  recurring: z.array(z.object({
    id: idSchema,
    name: z.string().min(1).max(80),
    amount: centsSchema.refine(v => v > 0),
    type: z.enum(['expense','income']),
    categoryId: idSchema,
    day: z.number().int().min(1).max(31),
    startMonth: monthSchema,
    endMonth: monthSchema.optional(),
    subscription: z.boolean(),
  })).max(100),
  budgets: z.record(monthSchema, z.object({
    total: centsSchema,
    categories: z.record(idSchema, centsSchema),
  })),
  goals: z.array(z.object({
    id: idSchema,
    name: z.string().min(1).max(80),
    target: centsSchema.refine(v => v > 0),
    saved: centsSchema,
    date: dateSchema,
  })).max(100),
});

export type FinanceState = z.infer<typeof stateSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type Category = FinanceState['categories'][number];
export type Recurring = FinanceState['recurring'][number];
export type Goal = FinanceState['goals'][number];

export const money = (n:number,d=0) => new Intl.NumberFormat('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n/100);
export const toCents = (v:string|number) => Math.round(Number(v)*100);
export const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const monthOf = (d:string) => d.slice(0,7);
export const daysIn = (m:string) => new Date(Number(m.slice(0,4)),Number(m.slice(5,7)),0).getDate();
export function shiftMonth(m:string,delta:number){const d=new Date(Number(m.slice(0,4)),Number(m.slice(5,7))-1+delta,1,12);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
export const dateIn = (m:string,d:number) => `${m}-${String(Math.min(d,daysIn(m))).padStart(2,'0')}`;
export const monthName = (m:string) => new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{month:'long',year:'numeric'}).format(new Date(m+'-15T12:00:00'));
export const dayName = (d:string) => new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{day:'numeric',month:'short'}).format(new Date(d+'T12:00:00'));
export const uid = () => crypto.randomUUID();
export const sum = (ts:Transaction[]) => ts.reduce((a,t)=>a+t.amount,0);

export const defaultCategories:Category[] = [
  {id:'food',name:'الأكل والمطاعم',icon:'food',color:'#bbf49c'},
  {id:'coffee',name:'القهوة',icon:'coffee',color:'#d4b1ff'},
  {id:'fuel',name:'البنزين',icon:'fuel',color:'#8ecbff'},
  {id:'shopping',name:'التسوق',icon:'shopping',color:'#ffbf91'},
  {id:'entertainment',name:'الترفيه',icon:'entertainment',color:'#f2a7c8'},
  {id:'internet',name:'الإنترنت',icon:'internet',color:'#88dccc'},
  {id:'gym',name:'النادي',icon:'gym',color:'#dfd38a'},
  {id:'university',name:'الجامعة',icon:'university',color:'#aaadff'},
  {id:'subscriptions',name:'الاشتراكات',icon:'subscriptions',color:'#98c5ae'},
  {id:'car',name:'السيارة',icon:'car',color:'#d7b49a'},
  {id:'income',name:'الدخل',icon:'income',color:'#bbf49c'},
  {id:'other',name:'أخرى',icon:'other',color:'#adb8c5'},
];

export function emptyState(date=today()):FinanceState {
  return {
    initialized:false,
    openingBalance:0,
    openingDate:date,
    reserved:0,
    categories:defaultCategories,
    transactions:[],
    recurring:[],
    budgets:{[monthOf(date)]:{total:260000,categories:{food:100000,fuel:30000,coffee:15000,entertainment:20000,internet:17500,gym:39000,other:38500}}},
    goals:[],
  };
}

export function getBudget(s:FinanceState,m:string){const key=Object.keys(s.budgets).filter(k=>k<=m).sort().pop();return key?s.budgets[key]:{total:0,categories:{}};}

export function occurrences(s:FinanceState,throughMonth:string,asOf:string){
  const out:{rule:Recurring,date:string,month:string,paid:boolean,transaction?:Transaction}[]=[];
  for(const r of s.recurring){
    let m=r.startMonth>monthOf(s.openingDate)?r.startMonth:monthOf(s.openingDate),guard=0;
    while(m<=throughMonth&&guard++<1200){
      if(r.endMonth&&m>r.endMonth)break;
      const date=dateIn(m,r.day);
      if(date>=s.openingDate){
        const transaction=s.transactions.find(t=>t.recurringId===r.id&&t.occurrenceMonth===m&&t.date<=asOf);
        out.push({rule:r,date,month:m,paid:!!transaction,transaction});
      }
      m=shiftMonth(m,1);
    }
  }
  return out.sort((a,b)=>a.date.localeCompare(b.date));
}

export function summarize(s:FinanceState,m:string,date=today()){
  const last=dateIn(m,31),current=monthOf(date)===m,asOf=m<monthOf(date)?last:date;
  const tx=s.transactions.filter(t=>t.date>=s.openingDate&&t.date<=asOf),monthly=tx.filter(t=>monthOf(t.date)===m);
  const expenses=monthly.filter(t=>t.type==='expense'),income=sum(monthly.filter(t=>t.type==='income')),spent=sum(expenses);
  const balance=s.openingBalance+tx.reduce((a,t)=>a+(t.type==='income'?t.amount:-t.amount),0);
  const scheduled=occurrences(s,m,asOf),pending=scheduled.filter(o=>!o.paid),commitments=pending.filter(o=>o.rule.type==='expense').reduce((a,o)=>a+o.rule.amount,0);
  const goalReserve=s.goals.reduce((a,g)=>a+g.saved,0),reserved=s.reserved+goalReserve,available=balance-commitments-reserved;
  const budget=getBudget(s,m),budgetLeft=budget.total-spent-commitments;
  const days=daysIn(m),day=current?Number(date.slice(8)):days,daysLeft=current?days-day+1:0;
  const startDay=monthOf(s.openingDate)===m?Number(s.openingDate.slice(8)):1,observedDays=Math.max(1,day-startDay+1);
  const variable=expenses.filter(t=>!t.recurringId),todaySpent=sum(variable.filter(t=>t.date===date));
  const beforeToday=Math.max(0,Math.min(available+todaySpent,budgetLeft+todaySpent));
  const daily=current?Math.floor(beforeToday/daysLeft):0,remainingToday=Math.max(0,daily-todaySpent);
  const futureDays=Math.max(0,days-day),weekday=new Date(date+'T12:00:00Z').getUTCDay(),weekDays=Math.min(daysLeft,7-((weekday+1)%7));
  const weekly=current?Math.min(Math.max(0,Math.min(available,budgetLeft)),remainingToday+daily*Math.max(0,weekDays-1)):0;
  const rate=sum(variable)/observedDays;
  const expectedIncome=pending.filter(o=>o.rule.type==='income'&&o.date>=date).reduce((a,o)=>a+o.rule.amount,0);
  const forecast=balance+expectedIncome-commitments-rate*futureDays;
  const byCategory=s.categories.filter(c=>c.id!=='income').map(c=>({...c,spent:sum(expenses.filter(t=>t.categoryId===c.id)),budget:budget.categories[c.id]||0}));
  const pace=budget.total>0?spent/budget.total*100:0,monthPace=day/days*100;
  const points=Array.from({length:days},(_,i)=>{
    const dt=dateIn(m,i+1);
    const cash=s.openingBalance+s.transactions.filter(t=>t.date>=s.openingDate&&t.date<=dt).reduce((a,t)=>a+(t.type==='income'?t.amount:-t.amount),0);
    if(i+1<=day)return {day:i+1,actual:cash/100,projected:i+1===day?balance/100:undefined};
    const planned=pending.filter(o=>o.date<=dt).reduce((a,o)=>a+(o.rule.type==='income'&&o.date>=date?o.rule.amount:o.rule.type==='expense'?-o.rule.amount:0),0);
    return {day:i+1,actual:undefined,projected:(balance+planned-rate*(i+1-day))/100};
  });
  return {current,asOf,monthly,expenses,income,spent,balance,commitments,reserved,available,budget,budgetLeft,days,day,daysLeft,todaySpent,daily,remainingToday,weekly,forecast,rate,observedDays,expectedIncome,byCategory,pace,monthPace,points,pending};
}

export function demoState(date=today()):FinanceState {
  const m=monthOf(date),prev=shiftMonth(m,-1),day=Number(date.slice(8));
  const s=emptyState(prev+'-01');s.initialized=true;s.openingBalance=23500;s.reserved=15000;
  s.budgets={[prev]:{total:260000,categories:{food:85000,fuel:30000,coffee:15000,shopping:15000,entertainment:15000,internet:17500,gym:39000,subscriptions:2900,other:40600}},[m]:{total:260000,categories:{food:85000,fuel:30000,coffee:15000,shopping:15000,entertainment:15000,internet:17500,gym:39000,subscriptions:2900,other:40600}}};
  s.recurring=[
    {id:'stipend',name:'مكافأة الجامعة',amount:99000,type:'income',categoryId:'income',day:1,startMonth:prev,subscription:false},
    {id:'salary',name:'العمل الجزئي',amount:100000,type:'income',categoryId:'income',day:1,startMonth:prev,subscription:false},
    {id:'support',name:'دخل إضافي',amount:64100,type:'income',categoryId:'income',day:10,startMonth:prev,subscription:false},
    {id:'gym-monthly',name:'اشتراك النادي',amount:39000,type:'expense',categoryId:'gym',day:3,startMonth:prev,subscription:true},
    {id:'internet-monthly',name:'باقة الإنترنت',amount:17500,type:'expense',categoryId:'internet',day:22,startMonth:prev,subscription:true},
    {id:'streaming',name:'اشتراك ترفيه',amount:2900,type:'expense',categoryId:'subscriptions',day:25,startMonth:prev,subscription:true},
  ];
  const add=(mm:string,dd:number,a:number,c:string,n:string,type:'expense'|'income'='expense',r?:string)=>s.transactions.push({id:`demo-${mm}-${s.transactions.length}`,amount:Math.round(a*100),type,categoryId:c,merchant:n,date:dateIn(mm,dd),payment:'card',note:'',need:c==='coffee'||c==='shopping'||c==='entertainment'?'want':'need',tags:c==='fuel'?['الجامعة']:[],...(r?{recurringId:r,occurrenceMonth:mm}:{})});
  for(const mm of [prev,m]){
    const max=mm===m?day:daysIn(mm);
    for(const r of s.recurring)if(r.day<=max)add(mm,r.day,r.amount/100,r.categoryId,r.name,r.type,r.id);
    for(let d=1;d<=max;d++){
      if(d%5!==0)add(mm,d,mm===m?19+(d*7)%29:23+(d*11)%34,'food',d%3===0?'البيك':'وجبة اليوم');
      if(d%3===0)add(mm,d,14+(d%4)*3,'coffee',d%2?'قهوة مختصة':'دانكن');
      if([2,9,16,24].includes(d))add(mm,d,60+(d%3)*10,'fuel','محطة الوقود');
      if(d===12)add(mm,d,89,'shopping','نون');
      if(d===15)add(mm,d,45,'entertainment','سينما');
    }
  }
  s.goals=[{id:'laptop-demo',name:'لابتوب جديد',target:600000,saved:18000,date:shiftMonth(m,9)+'-15'}];
  return s;
}

export function validateRelations(s:FinanceState){
  const unique=(rows:{id:string}[])=>new Set(rows.map(r=>r.id)).size===rows.length;
  if(!unique(s.transactions)||!unique(s.categories)||!unique(s.recurring)||!unique(s.goals))return false;
  const cats=new Set(s.categories.map(c=>c.id));
  const seen=new Set<string>();
  for(const t of s.transactions){
    if(!cats.has(t.categoryId)||t.date<s.openingDate||t.date>today())return false;
    if(t.recurringId){
      if(!t.occurrenceMonth||!s.recurring.some(r=>r.id===t.recurringId))return false;
      const k=t.recurringId+':'+t.occurrenceMonth;
      if(seen.has(k))return false;
      seen.add(k);
    }
  }
  return s.recurring.every(r=>cats.has(r.categoryId))&&s.goals.every(g=>g.saved<=g.target);
}
