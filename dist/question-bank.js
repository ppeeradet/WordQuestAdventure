const rotate=(items,offset)=>items.map((_,i)=>items[(i+offset)%items.length]);
const uniq=items=>[...new Set(items.filter(Boolean))];
export function expandQuestionBank(base,vocab){
  const questions=[...base];
  const distractors=(word,topic,language)=>{
    const candidates=vocab.filter(row=>row[0]!==word&&(row[4]||'adventure')===topic).map(row=>row[language==='en'?0:1]);
    const fallback=vocab.filter(row=>row[0]!==word).map(row=>row[language==='en'?0:1]);
    return rotate(uniq([...candidates,...fallback]),word.length).slice(0,3);
  };
  for(const [word,thai,example,level='A2',topic='adventure'] of vocab){
    const common={w:word,th:thai,ex:example,level,topic};
    if(!questions.some(q=>q.w===word&&q.mode==='analysis'))questions.push({...common,answer:word,mode:'analysis'});
    questions.push({...common,wrong:distractors(word,topic,'th'),mode:'meaning'});
    questions.push({...common,w:thai,th:word,wrong:distractors(word,topic,'en'),mode:'reverse'});
    questions.push({...common,wrong:distractors(word,topic,'en'),mode:'context'});
    questions.push({...common,wrong:distractors(word,topic,'en'),mode:'listening'});
    const upper=word.toUpperCase(),vowel=[...upper].find(x=>'AEIOU'.includes(x))||upper[0];
    questions.push({...common,w:upper,th:upper.replace(vowel,'_'),answer:vowel,wrong:['A','E','I','O','U'].filter(x=>x!==vowel).slice(0,3),ex:thai,mode:'spelling'});
  }
  for(const q of questions.filter(q=>q.mode==='context'&&!q.level))q.wrong=distractors(q.w,'adventure','en');
  return questions;
}
export function validateQuestionBank(questions){
  const issues=[];
  for(const [index,q] of questions.entries()){
    const answer=q.mode==='analysis'||q.mode==='spelling'?q.answer:q.mode==='context'||q.mode==='listening'?q.w:q.th;
    if(!q.w||!q.th||!answer)issues.push(`${index}: missing answer`);
    if(q.mode==='analysis'||q.mode==='context'){
      if((q.ex?.match(/_{3,}/g)||[]).length!==1)issues.push(`${index}: expected one sentence blank`);
    }
    if(q.mode!=='analysis'){
      if(q.wrong?.length!==3||new Set([answer,...(q.wrong||[])]).size!==4)issues.push(`${index}: invalid options`);
    }
  }
  return issues;
}
