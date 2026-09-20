import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import type { FinanceState } from './finance';

type RecordRow = { state: FinanceState; revision: number; updatedAt: string };
type StoreFile = Record<string, RecordRow>;
const dataDir = path.join(process.cwd(), '.data');
const dataFile = path.join(dataDir, 'finance.json');
let queue: Promise<unknown> = Promise.resolve();

async function readStore(): Promise<StoreFile> {
  try { return JSON.parse(await readFile(dataFile, 'utf8')) as StoreFile; }
  catch (e: any) { if (e?.code === 'ENOENT') return {}; throw e; }
}
async function writeStore(store: StoreFile) {
  await mkdir(dataDir,{recursive:true});
  const tmp=dataFile+'.tmp';
  await writeFile(tmp,JSON.stringify(store,null,2),'utf8');
  await rename(tmp,dataFile);
}
export async function getFinance(userId:string){const store=await readStore();return store[userId]||null;}
export async function putFinance(userId:string,state:FinanceState,expectedRevision:number){
  let result:{ok:boolean;revision:number}= {ok:false,revision:expectedRevision};
  queue=queue.then(async()=>{
    const store=await readStore();
    const current=store[userId];
    const actual=current?.revision??0;
    if(actual!==expectedRevision){result={ok:false,revision:actual};return;}
    const revision=actual+1;
    store[userId]={state,revision,updatedAt:new Date().toISOString()};
    await writeStore(store);result={ok:true,revision};
  });
  await queue;return result;
}
