import { type FinanceState, dateIn, monthOf, occurrences, shiftMonth, sum, today } from './finance';

export function simpleSummary(state:FinanceState, month:string, date=today()) {
  const current=month===monthOf(date);
  const asOf=month<monthOf(date)?dateIn(month,31):date;
  const posted=state.transactions.filter(t=>t.date>=state.openingDate&&t.date<=asOf);
  const monthly=posted.filter(t=>monthOf(t.date)===month).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
  const balance=asOf<state.openingDate?0:state.openingBalance+posted.reduce((n,t)=>n+(t.type==='income'?t.amount:-t.amount),0);
  const schedule=occurrences(state,current?shiftMonth(month,1):month,asOf);
  const due=schedule.filter(o=>o.month<=month&&!o.paid&&o.rule.type==='expense');
  const rows=schedule.filter(o=>o.month===month||(o.month<month&&!o.paid&&o.rule.type==='expense'));
  if(current) for(const rule of state.recurring){
    if(rows.some(o=>o.rule.id===rule.id))continue;
    const next=schedule.find(o=>o.rule.id===rule.id&&o.month>month);
    if(next) rows.push(next);
  }
  rows.sort((a,b)=>a.date.localeCompare(b.date));
  return {current,asOf,balance,monthly,income:sum(monthly.filter(t=>t.type==='income')),spent:sum(monthly.filter(t=>t.type==='expense')),due:due.reduce((n,o)=>n+o.rule.amount,0),rows};
}
