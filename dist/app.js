import { firebaseConfig } from './firebase-config.js';
import { PETS } from './pets.js';
import { PRIMARY_VOCAB } from './primary-vocab.js';
import { expandQuestionBank, validateQuestionBank } from './question-bank.js';
import { normalizeProgress, completeMission, isBossMission } from './progression.js';
import { OPENING_STORY, missionStory } from './stories.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const WORDS=[
 {w:'rescue',th:'ช่วยเหลือ',wrong:['สำรวจ','ซ่อนตัว','เดินทาง'],ex:'The ranger came to ___ the lost bird.',mode:'meaning'},
 {w:'gentle',th:'อ่อนโยน',wrong:['เสียงดัง','รวดเร็ว','หิวโหย'],ex:'Be ___ when you hold the tiny rabbit.',mode:'meaning'},
 {w:'สะพาน',th:'bridge',wrong:['river','forest','mountain'],ex:'We cross the river on a ___.',mode:'reverse'},
 {w:'ร่องรอย',th:'clue',wrong:['cloud','cave','claw'],ex:'Maple found a ___ beside the tree.',mode:'reverse'},
 {w:'shelter',th:'ที่พักพิง',wrong:['เส้นทาง','คำตอบ','ความเร็ว'],ex:'The animals found a warm ___ from the rain.',mode:'context'},
 {w:'journey',th:'การเดินทาง',wrong:['การแข่งขัน','การพักผ่อน','คำสัญญา'],ex:'Our long ___ begins at sunrise.',mode:'context'},
 {w:'BRAVE',th:'BR_VE',answer:'A',wrong:['E','I','O'],ex:'กล้าหาญ',mode:'spelling'},
 {w:'FOREST',th:'FOR_ST',answer:'E',wrong:['A','I','U'],ex:'ป่า',mode:'spelling'},
 {w:'discover',th:'ค้นพบ',wrong:['ทำลาย','ลืม','ปิดบัง'],ex:'We may ___ a new animal today.',mode:'meaning'},
 {w:'ลำธาร',th:'stream',wrong:['storm','stone','steam'],ex:'A small ___ flows through the forest.',mode:'reverse'},
 {w:'protect',th:'ปกป้อง',wrong:['แลกเปลี่ยน','รวบรวม','กระโดด'],ex:'We must ___ the eggs from the storm.',mode:'context'},
 {w:'GLOW',th:'GL_W',answer:'O',wrong:['A','E','U'],ex:'เปล่งแสง',mode:'spelling'},
 {w:'kind',th:'ใจดี / มีเมตตา',answer:'kind',ex:'It is important to be ____ and help others.',mode:'analysis'},
 {w:'book',th:'หนังสือ',answer:'book',ex:'Open your ____ to page ten and read the story.',mode:'analysis'},
 {w:'brave',th:'กล้าหาญ',answer:'brave',ex:'The little fox was ____ enough to cross the river.',mode:'analysis'}
];
const VOCAB=[
 ['adventure','การผจญภัย','Our new ____ begins beyond the bridge.'],['careful','ระมัดระวัง','Be ____ when you cross the wet stones.'],['clever','ฉลาด','The ____ fox solved the puzzle quickly.'],['courage','ความกล้าหาญ','It takes ____ to help a frightened animal.'],['discover','ค้นพบ','We may ____ a secret path today.'],['enormous','ใหญ่มหึมา','An ____ tree stood in the valley.'],['friendly','เป็นมิตร','The ____ otter waved to Maple.'],['gather','รวบรวม','Please ____ the glowing leaves.'],['habitat','ถิ่นอาศัย','The forest is the deer’s natural ____.'],['journey','การเดินทาง','Their long ____ started at sunrise.'],['knowledge','ความรู้','Every new word gives us more ____.'],['listen','ฟัง','Stop and ____ to the birds.'],['mysterious','ลึกลับ','A ____ light appeared near the cave.'],['notice','สังเกตเห็น','Did you ____ the tiny footprints?'],['patient','อดทน','A good rescuer must be ____.'],['protect','ปกป้อง','We must ____ the eggs from the storm.'],['quiet','เงียบ','Stay ____ so we do not scare the rabbit.'],['return','กลับมา','The birds ____ home every evening.'],['shelter','ที่พักพิง','The animals found a warm ____ from the rain.'],['together','ด้วยกัน','We can solve the problem ____.'],['unusual','ไม่ธรรมดา','They found an ____ purple feather.'],['valuable','มีคุณค่า','Clean water is a ____ resource.'],['wander','เดินเตร่','Do not ____ far from the path.'],['whisper','กระซิบ','Please ____ the answer to your friend.'],['ancient','โบราณ','An ____ map was hidden in the box.'],['balance','ทรงตัว','The goat can ____ on a narrow ledge.'],['curious','อยากรู้อยากเห็น','The ____ cub looked inside the cave.'],['delicate','บอบบาง','The moth has ____ wings.'],['energy','พลังงาน','Healthy food gives us ____.'],['float','ลอย','Colorful leaves ____ on the stream.'],['generous','ใจกว้าง','The ____ bear shared its berries.'],['honest','ซื่อสัตย์','An ____ friend always tells the truth.'],['imagine','จินตนาการ','Close your eyes and ____ a magic world.'],['kind','ใจดี','It is important to be ____ and help others.'],['leader','ผู้นำ','A good ____ listens to the team.'],['memory','ความทรงจำ','The song brought back a happy ____.'],['nature','ธรรมชาติ','We learn many things from ____.'],['observe','สังเกต','Scientists ____ animals carefully.'],['promise','สัญญา','Maple made a ____ to return.'],['respect','เคารพ','We should ____ every living thing.'],['solution','วิธีแก้ปัญหา','They worked together to find a ____.'],['treasure','สมบัติ','Kindness is the greatest ____.'],['unique','มีเอกลักษณ์','Every rescued friend is ____.'],['wonder','ความมหัศจรรย์','The sky was filled with ____.'],['brilliant','ยอดเยี่ยม','Pip had a ____ idea.'],['compassion','ความเห็นอกเห็นใจ','Helping others shows ____.'],['environment','สิ่งแวดล้อม','We must care for the ____.'],['responsible','รับผิดชอบ','A ____ explorer leaves no trash.']
];
VOCAB.push(...PRIMARY_VOCAB.filter(row=>!VOCAB.some(existing=>existing[0]===row[0])));
WORDS.push(...expandQuestionBank(WORDS,VOCAB).slice(WORDS.length));
const questionIssues=validateQuestionBank(WORDS);if(questionIssues.length)console.warn('Question quality issues',questionIssues);
const MODES={meaning:'Meaning',reverse:'Reverse',context:'Context',spelling:'Spelling',analysis:'Sentence Quest',listening:'Listening'}, defaults={name:'',xp:0,stars:0,streak:1,rescued:['pip'],petIds:[1],egg:0,eggsHatched:0,completed:0,missionUnlocked:1,mastery:{},errors:{}};
let state={...defaults,...normalizeProgress(JSON.parse(localStorage.getItem('wqa.progress')||'{}')),session:[],index:0,score:0,selected:null,checked:false},db=null,authReady=Promise.resolve();
let doc,getDoc,setDoc,collection,query,orderBy,limit,getDocs,serverTimestamp;
const timed=(promise,ms=4500)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),ms))]);
const firebaseReady=(async()=>{try{if(!firebaseConfig?.projectId||firebaseConfig.projectId.includes('YOUR_'))return;const [appMod,firestoreMod,authMod]=await Promise.all([import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js')]);({doc,getDoc,setDoc,collection,query,orderBy,limit,getDocs,serverTimestamp}=firestoreMod);const fbApp=appMod.initializeApp(firebaseConfig);db=firestoreMod.getFirestore(fbApp);authReady=authMod.signInAnonymously(authMod.getAuth(fbApp));await timed(authReady)}catch(e){db=null;setCloud('offline');console.warn('Firebase offline fallback',e)}})();
const keyName=n=>n.trim().toLocaleLowerCase('en-US').replace(/[^a-z0-9ก-๙_-]/g,'-').replace(/-+/g,'-').slice(0,32);
function readLocalPlayers(){try{const saved=JSON.parse(localStorage.getItem('wqa.players')||'{}');return saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{}}catch{return {}}}
function saveLocal(){const progress={name:state.name,xp:state.xp,stars:state.stars,streak:state.streak,rescued:state.rescued,petIds:state.petIds,egg:state.egg,eggsHatched:state.eggsHatched,completed:state.completed,completedMissions:state.completedMissions,missionUnlocked:state.missionUnlocked,mastery:state.mastery,errors:state.errors};localStorage.setItem('wqa.progress',JSON.stringify(progress));if(state.name){const players=readLocalPlayers();players[keyName(state.name)]=progress;localStorage.setItem('wqa.players',JSON.stringify(players))}renderStats()}
async function syncPlayer(){if(!state.name)return;try{await timed(firebaseReady);if(!db)return;await timed(setDoc(doc(db,'players',keyName(state.name)),{displayName:state.name,xp:state.xp,stars:state.stars,streak:state.streak,rescued:state.rescued,petIds:state.petIds,egg:state.egg,eggsHatched:state.eggsHatched,completed:state.completed,completedMissions:state.completedMissions,missionUnlocked:state.missionUnlocked,mastery:state.mastery,errors:state.errors,lastPlayedAt:serverTimestamp()},{merge:true}));setCloud('cloud')}catch(e){setCloud('offline')}}
async function loadPlayer(name){if(keyName(state.name||'')!==keyName(name)){const saved=readLocalPlayers()[keyName(name)];state={...defaults,...normalizeProgress(saved||{petIds:[1],completedMissions:[]}),session:[],index:0,score:0}}state.name=name;try{await timed(firebaseReady);if(db){const snap=await timed(getDoc(doc(db,'players',keyName(name))));if(snap.exists())state={...state,...normalizeProgress(snap.data()),name};setCloud('cloud')}}catch(e){setCloud('offline')}saveLocal();renderLongProgress();syncPlayer();loadRanking()}
function setCloud(mode){const el=$('#cloud-state');el.textContent=mode==='cloud'?'☁️ บันทึกบน Cloud แล้ว':'📱 เล่นออฟไลน์';el.className=mode}
function renderStats(){$('#streak').textContent=state.streak;$('#stars').textContent=state.stars;$('#xp-now').textContent=state.xp;$('#egg-progress').style.width=`${state.egg}%`;$('#egg-label').textContent=`พลังฟักไข่ ${state.egg}% · ฟักแล้ว ${state.eggsHatched} ใบ`;$('#pet-count').textContent=state.petIds.length;$$('[data-player]').forEach(x=>x.textContent=state.name||'นักสำรวจ');$('.avatar').textContent=(state.name||'WQ').slice(0,2).toUpperCase()}
function show(name){$$('.screen').forEach(x=>x.classList.remove('active'));$(`#screen-${name}`)?.classList.add('active');$$('.mobile-nav button').forEach(x=>x.classList.toggle('active',x.dataset.go===name));window.scrollTo({top:0,behavior:'smooth'});if(name==='ranking')loadRanking()}
function showStoryDialog(story,buttonLabel){$('#story-title').textContent=story.boss?`👑 ${story.title}`:story.title;$('#story-en').textContent=story.en;$('#story-th').textContent=story.th;$('#story-continue').textContent=buttonLabel;const dialog=$('#story-dialog');if(!dialog.open)dialog.showModal()}
$('#story-continue').addEventListener('click',()=>{if('speechSynthesis'in window)speechSynthesis.cancel();$('#story-dialog').close()});
$$('[data-story-speak]').forEach(button=>button.addEventListener('click',()=>{if(!('speechSynthesis'in window))return;const lang=button.dataset.storySpeak,text=lang==='en'?$('#story-en').textContent:$('#story-th').textContent;const utterance=new SpeechSynthesisUtterance(text);utterance.lang=lang==='en'?'en-US':'th-TH';utterance.rate=.84;speechSynthesis.cancel();speechSynthesis.speak(utterance)}));
const shuffle=a=>{const copy=[...a];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy};
let audioCtx;function sfx(type){try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);const good=type==='correct'||type==='reward';o.frequency.setValueAtTime(good?520:180,audioCtx.currentTime);if(good)o.frequency.exponentialRampToValueAtTime(type==='reward'?980:760,audioCtx.currentTime+.18);g.gain.setValueAtTime(.001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.16,audioCtx.currentTime+.02);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.28);o.start();o.stop(audioCtx.currentTime+.3)}catch(e){}}
function startMission(){
  const mission=Number(state.mission)||Number(state.missionUnlocked)||1;
  const story=missionStory(mission,PETS[Math.min(99,mission)].name);
  state.isBoss=mission%10===0;
  const eligible=mission<=50?WORDS.filter(q=>!q.level||q.level==='Pre-A1'||q.level==='A1'):WORDS;
  const themed=eligible.filter(q=>story.topics.includes(q.topic));
  const modes=Object.keys(MODES);
  const core=modes.map(m=>shuffle(themed.filter(x=>x.mode===m))[0]||shuffle(eligible.filter(x=>x.mode===m))[0]);
  const review=Object.entries(state.errors||{}).filter(([,count])=>count>0).map(([w])=>eligible.find(q=>q.w.toLowerCase()===w)).filter(Boolean);
  const pool=[...shuffle(review),...shuffle(themed),...shuffle(eligible)];
  const picked=[...core];
  for(const q of pool){if(picked.length>=10)break;if(q&&!picked.includes(q))picked.push(q)}
  let session=shuffle(picked),signature=session.map(q=>`${q.mode}:${q.w}`).join('|');
  const last=localStorage.getItem('wqa.lastSession');
  if(signature===last){const alternate=shuffle(eligible).find(q=>!session.includes(q)&&q.mode===session[0].mode);if(alternate){session[0]=alternate;signature=session.map(q=>`${q.mode}:${q.w}`).join('|')}}
  localStorage.setItem('wqa.lastSession',signature);
  state.session=session;state.index=0;state.score=0;state.hints=[];show('game');renderQuestion();showStoryDialog(story,'เริ่มด่านนี้')
}
function renderQuestion(){
  const q=state.session[state.index];state.selected=null;state.typed='';state.spellingGuesses=[];state.spellingLastGuess=null;state.analysisWrong=[];state.analysisLastGuess=null;state.hintCost=0;state.checked=false;
  $('#round-now').textContent=state.index+1;$('#round-total').textContent=state.session.length;
  $('#round-bar').style.width=`${state.index/state.session.length*100}%`;$('#mode-tag').textContent=MODES[q.mode];
  $('#hint-bar').hidden=q.mode!=='analysis';
  $('#question-help').textContent=q.mode==='analysis'?'วิเคราะห์ประโยค แล้วสะกดคำที่หายไป':q.mode==='reverse'?'เลือกคำภาษาอังกฤษที่ตรงกับคำนี้':q.mode==='context'?'เลือกคำเติมลงในประโยค':q.mode==='listening'?'กดฟังเสียง แล้วเลือกคำที่ได้ยิน':q.mode==='spelling'?'เลือกตัวอักษรที่หายไป':'คำนี้แปลว่าอะไร?';
  $('#game-title').textContent=q.mode==='listening'?'🔊 ฟังแล้วเลือกคำ':q.mode==='analysis'||q.mode==='context'?q.ex:q.mode==='spelling'?q.th:q.w;
  $('#game-title').classList.toggle('sentence-prompt',q.mode==='analysis'||q.mode==='context');
  $('#example').textContent=q.mode==='analysis'?Array(q.answer.length).fill('_').join('  '):q.mode==='spelling'?`คำแปล: ${q.ex}`:'';
  $('#feedback-text').textContent=q.mode==='analysis'?'เริ่มที่ 30 คะแนน · ใช้คำใบ้เมื่อจำเป็น':'เลือกคำตอบที่เหมาะที่สุด';$('#feedback-text').classList.remove('letter-correct','letter-wrong');
  $('#continue-btn').textContent='ตรวจคำตอบ';$('#continue-btn').disabled=true;$('#answers').classList.remove('hangman');
  if(q.mode==='analysis'){renderKeyboard();return}
  if(q.mode==='spelling'){renderSpelling();return}
  const correct=q.mode==='spelling'?q.answer:q.mode==='context'||q.mode==='listening'?q.w:q.th;
  const wrong=q.wrong;
  const choices=shuffle([correct,...wrong]);$('#answers').classList.remove('keyboard');
  $('#answers').innerHTML=choices.map((c,i)=>`<button data-choice="${encodeURIComponent(c)}"><b>${'ABCD'[i]}</b>${c}</button>`).join('');
  $$('[data-choice]').forEach(b=>b.onclick=()=>{$$('[data-choice]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.selected=decodeURIComponent(b.dataset.choice);$('#continue-btn').disabled=false;$('#feedback-text').textContent='พร้อมแล้ว กดตรวจคำตอบ';sfx('tap')})
}
function setLetterFeedback(message,kind){const el=$('#feedback-text');el.textContent=message;el.classList.toggle('letter-correct',kind==='correct');el.classList.toggle('letter-wrong',kind==='wrong')}
function renderKeyboard(){
  const q=state.session[state.index],letters='QWERTYUIOPASDFGHJKLZXCVBNM',last=state.analysisLastGuess;
  $('#answers').classList.remove('hangman');$('#answers').classList.add('keyboard');
  const slots=[...q.answer].map((_,i)=>`<span class="word-slot ${i<state.typed.length?'revealed':''}">${state.typed[i]?.toUpperCase()||'&nbsp;'}</span>`).join('');
  const status=last?last.correct?`✅ ถูกต้อง! เติม ${last.letter} แล้ว`:`❌ ${last.letter} ยังไม่ถูก ลองใหม่`:'กดตัวอักษรเพื่อเติมคำทีละตัว';
  $('#answers').innerHTML=`<div class="typed-word" id="typed-word" aria-label="สะกดได้ ${state.typed.length} จาก ${q.answer.length} ตัว">${slots}</div><div class="letter-status ${last?last.correct?'letter-correct':'letter-wrong':''}" role="status">${status}</div><div class="keys">${[...letters].map(l=>`<button type="button" data-letter="${l}" class="${state.analysisWrong.includes(l)?'letter-wrong':last?.correct&&last.letter===l?'letter-correct':''}" ${state.analysisWrong.includes(l)||state.checked?'disabled':''}>${l}</button>`).join('')}<button type="button" class="key-delete" data-delete ${state.typed.length===0||state.checked?'disabled':''}>⌫</button></div>`;
  $$('[data-letter]').forEach(button=>button.addEventListener('click',()=>guessAnalysisLetter(button.dataset.letter)));
  $('[data-delete]').addEventListener('click',()=>{if(state.checked)return;state.typed=state.typed.slice(0,-1);state.analysisWrong=[];state.analysisLastGuess=null;$('#continue-btn').disabled=true;setLetterFeedback('ลบตัวสุดท้ายแล้ว ลองสะกดต่อ','');renderKeyboard()});
}
function guessAnalysisLetter(letter){
  const q=state.session[state.index];if(!q||q.mode!=='analysis'||state.checked||state.typed.length>=q.answer.length||state.analysisWrong.includes(letter))return;
  const correct=letter.toLowerCase()===q.answer[state.typed.length].toLowerCase();
  state.analysisLastGuess={letter,correct};
  if(correct){state.typed+=letter.toLowerCase();state.analysisWrong=[];setLetterFeedback(`ถูกต้อง! เติม ${letter} แล้ว · ${state.typed.length}/${q.answer.length} ตัว`,'correct')}
  else{state.analysisWrong.push(letter);setLetterFeedback(`${letter} ยังไม่ใช่ตัวถัดไป ลองอีกครั้ง`,'wrong')}
  $('#continue-btn').disabled=state.typed.length!==q.answer.length;sfx(correct?'correct':'wrong');renderKeyboard();
}
function renderSpelling(){
  const q=state.session[state.index],guesses=state.spellingGuesses||[],misses=guesses.filter(letter=>letter!==q.answer).length;
  $('#answers').classList.remove('keyboard');$('#answers').classList.add('hangman');
  $('#game-title').textContent=guesses.includes(q.answer)?q.w:q.th;
  const last=state.spellingLastGuess,shown=guesses.includes(q.answer)||state.checked;
  const slots=[...q.w].map((letter,i)=>`<span class="word-slot ${q.th[i]==='_'?(shown?'revealed':'missing'):'given'}">${q.th[i]==='_'&&!shown?'&nbsp;':letter}</span>`).join('');
  const message=last?last===q.answer?`✅ ถูกต้อง! ตัว ${last} เติมลงช่องแล้ว`:`❌ ${last} ยังไม่ถูก · พลาด ${misses}/5`:`ทายตัวอักษรที่หายไป · พลาด ${misses}/5`;
  $('#answers').innerHTML=`<div class="hangman-word" aria-label="คำศัพท์ ${shown?q.w:q.th}">${slots}</div><div class="hangman-status ${last?last===q.answer?'letter-correct':'letter-wrong':''}" role="status">${misses>=5&&!shown?`พลาดครบ 5 ครั้ง · กดดูคำตอบ`:message}</div><div class="hangman-keys">${[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(letter=>`<button type="button" data-guess="${letter}" class="${guesses.includes(letter)?letter===q.answer?'letter-correct':'letter-wrong':''}" ${guesses.includes(letter)||guesses.includes(q.answer)||misses>=5||state.checked?'disabled':''}>${letter}</button>`).join('')}</div>`;
  $$('[data-guess]').forEach(button=>button.addEventListener('click',()=>{
    const letter=button.dataset.guess;
    if(state.spellingGuesses?.includes(letter)||state.checked)return;
    state.spellingGuesses=[...(state.spellingGuesses||[]),letter];
    state.spellingLastGuess=letter;
    const wrong=state.spellingGuesses.filter(guess=>guess!==q.answer).length;
    if(letter===q.answer||wrong>=5){state.selected=letter;$('#continue-btn').disabled=false}
    setLetterFeedback(letter===q.answer?`ถูกต้อง! เติม ${letter} แล้ว กดตรวจคำตอบ`:wrong>=5?`พลาดครบ 5 ครั้ง · กดดูคำตอบ`:`${letter} ยังไม่ถูก · เหลืออีก ${5-wrong} ครั้ง`,letter===q.answer?'correct':'wrong');
    sfx(letter===q.answer?'correct':'wrong');renderSpelling();
  }));
}
function useHint(type,cost){const q=state.session[state.index];if(q.mode!=='analysis'||state.checked||state.hints?.includes(type))return;state.hints=[...(state.hints||[]),type];state.hintCost+=cost;if(type==='first')$('#feedback-text').textContent=`ตัวแรกคือ “${q.answer[0].toUpperCase()}” · เหลือ ${30-state.hintCost} คะแนน`;if(type==='vowel')$('#feedback-text').textContent=`สระในคำ: ${[...q.answer].filter(x=>'aeiou'.includes(x)).join(', ').toUpperCase()} · เหลือ ${30-state.hintCost} คะแนน`;if(type==='translate')$('#feedback-text').textContent=`คำแปล: ${q.th} · เหลือ ${30-state.hintCost} คะแนน`;sfx('tap')}
function checkAnswer(){const q=state.session[state.index],answer=q.mode==='analysis'||q.mode==='spelling'?q.answer:q.mode==='context'||q.mode==='listening'?q.w:q.th;if(!state.checked){state.checked=true;const ok=(q.mode==='analysis'?state.typed:state.selected)===answer;if(q.mode!=='analysis'&&q.mode!=='spelling'){const chosen=$$('[data-choice]').find(x=>decodeURIComponent(x.dataset.choice)===state.selected),right=$$('[data-choice]').find(x=>decodeURIComponent(x.dataset.choice)===answer);chosen?.classList.add(ok?'correct':'wrong');right?.classList.add('correct')}if(q.mode==='spelling')$('#game-title').textContent=q.w;state.score+=ok?1:0;const key=q.mode==='reverse'?q.th:q.w.toLowerCase();state.mastery[key]=(state.mastery[key]||0)+(ok?1:0);if(!ok)state.errors[key]=(state.errors[key]||0)+1;else if(state.errors[key])state.errors[key]--;$('#feedback-text').textContent=ok?`ยอดเยี่ยม! ${q.mode==='analysis'?`ได้ ${30-state.hintCost} คะแนน`:'เก็บประกายคำศัพท์ได้แล้ว'} ✨`:`คำตอบคือ “${answer}” — เดี๋ยวเราจะพากลับมาฝึกอีกครั้ง`;$('#continue-btn').textContent=state.index===state.session.length-1?'ดูรางวัล':'ไปต่อ';sfx(ok?'correct':'wrong');return}state.index++;state.hints=[];if(state.index<state.session.length)renderQuestion();else finishMission()}
function finishMission(){
  const mission=Number(state.mission)||Number(state.missionUnlocked)||1;
  const {progress,reward}=completeMission(state,mission,state.score,state.session.length);
  state={...state,...progress};
  $('#result-score').textContent=`${state.score}/${state.session.length}`;
  $('#result-xp').textContent=`+${reward.earned} XP`;
  $('#result-stars').textContent=`+${state.score} ดาว`;
  const pet=reward.hatchedPetId?PETS[reward.hatchedPetId-1]:reward.newPetId?PETS[reward.newPetId-1]:null;
  $('#result-title').textContent=!reward.passed?'บอสยังไม่ผ่าน ลองอีกครั้ง!':reward.boss?'ชนะบอสและเปิดโลกใหม่!':pet?`ช่วย ${pet.name} สำเร็จ!`:'ภารกิจสำเร็จ!';
  $('#egg-hatch-message').textContent=reward.hatchedPetId?`🥚 ไข่ฟักแล้ว! พบ ${PETS[reward.hatchedPetId-1].name} เพื่อนใหม่`:`🥚 พลังฟักไข่ ${reward.egg}%`;
  $('#result-retry').hidden=reward.passed;
  state.mission=reward.passed?null:mission;
  saveLocal();syncPlayer();renderLongProgress();show('result');sfx(reward.passed?'reward':'wrong');
  if(reward.passed)showRescuePopup([reward.newPetId,reward.hatchedPetId].filter(Boolean));
}
function showRescuePopup(ids){
  if(!ids.length)return;
  const dialog=$('#rescue-popup'),container=$('#rescue-popup-pets');container.replaceChildren();
  $('#rescue-popup-title').textContent=ids.length>1?'ได้เพื่อนใหม่ 2 ตัว!':'ได้เพื่อนใหม่แล้ว!';
  for(const id of ids){
    const pet=PETS[id-1],card=document.createElement('article'),portrait=document.createElement('span'),details=document.createElement('div');
    const rarity=document.createElement('small'),name=document.createElement('h3'),trait=document.createElement('p'),story=document.createElement('p');
    card.className='rescue-popup-pet';portrait.className='pet-portrait';portrait.setAttribute('role','img');portrait.setAttribute('aria-label',pet.species);
    portrait.style.setProperty('--pet-image',`url('assets/pets-${pet.sheet}-25.png')`);
    portrait.style.setProperty('--pet-x',`${pet.cell%5*25}%`);portrait.style.setProperty('--pet-y',`${Math.floor(pet.cell/5)*25}%`);
    rarity.textContent=`${pet.rarity} · เพื่อน #${pet.id}`;name.textContent=pet.name;trait.textContent=`${pet.species} · ${pet.trait}`;story.textContent=pet.story;
    details.append(rarity,name,trait,story);card.append(portrait,details);container.append(card);
  }
  if(!dialog.open)dialog.showModal();
}
$('#rescue-popup-close').addEventListener('click',()=>$('#rescue-popup').close());
$('#rescue-popup-collection').addEventListener('click',()=>{$('#rescue-popup').close();show('collection')});
async function loadRanking(){
  const players=readLocalPlayers();if(state.name)players[keyName(state.name)]={name:state.name,xp:state.xp,stars:state.stars,petIds:state.petIds};
  let rows=Object.values(players).filter(player=>player&&typeof player.name==='string').map(player=>({displayName:player.name,xp:Number(player.xp)||0,stars:Number(player.stars)||0}));
  let source='ในเครื่องนี้';
  if(db)try{await timed(authReady);const snaps=await timed(getDocs(query(collection(db,'players'),orderBy('xp','desc'),limit(20))));if(!snaps.empty){rows=snaps.docs.map(doc=>doc.data());source='Firebase Cloud'}}catch(e){console.warn('Ranking unavailable',e)}
  rows.sort((a,b)=>(Number(b.xp)||0)-(Number(a.xp)||0)||(Number(b.stars)||0)-(Number(a.stars)||0)||(a.displayName||'').localeCompare(b.displayName||''));
  $('#ranking-source').textContent=`อันดับจาก${source} · เรียงตามคะแนน XP สะสม${source==='ในเครื่องนี้'?' (ยังไม่ใช่อันดับข้ามเครื่อง)':''}`;
  const list=$('#rank-list');list.replaceChildren();
  if(!rows.length){const empty=document.createElement('li');empty.className='rank-empty';empty.textContent='ยังไม่มีคะแนน เริ่มเล่นด่านแรกกันเลย';list.append(empty);return}
  rows.forEach((row,index)=>{const item=document.createElement('li'),rank=document.createElement('b'),avatar=document.createElement('span'),name=document.createElement('span'),score=document.createElement('strong'),stars=document.createElement('small');item.className=keyName(row.displayName||'')===keyName(state.name||'')?'me':'';rank.textContent=index+1;avatar.className='rank-avatar';avatar.textContent=(row.displayName||'?').slice(0,2).toUpperCase();name.className='rank-name';name.textContent=row.displayName||'นักสำรวจ';score.className='rank-score';score.textContent=`${Number(row.xp)||0} XP`;stars.className='rank-stars';stars.textContent=`⭐ ${Number(row.stars)||0}`;item.append(rank,avatar,name,score,stars);list.append(item)})
}
$('#name-form').addEventListener('submit',async e=>{e.preventDefault();const n=$('#player-name').value.trim();if(!n)return;$('#start-btn').disabled=true;$('#start-btn').textContent='กำลังเปิดแผนที่…';await loadPlayer(n);show('map');$('#start-btn').disabled=false;$('#start-btn').textContent='เริ่มผจญภัย';const storyKey=`wqa.storySeen.${keyName(n)}`;if(!localStorage.getItem(storyKey)){localStorage.setItem(storyKey,'1');showStoryDialog(OPENING_STORY,'เปิดแผนที่')}});
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.go)));$$('[data-play]').forEach(b=>b.addEventListener('click',startMission));$('#continue-btn').addEventListener('click',checkAnswer);$('#listen-word').addEventListener('click',()=>{const q=state.session[state.index];if('speechSynthesis'in window){speechSynthesis.cancel();const spoken=q.mode==='analysis'?q.ex.replace('____',q.answer):q.mode==='reverse'?q.th:q.w;const u=new SpeechSynthesisUtterance(spoken);u.lang='en-US';u.rate=.78;speechSynthesis.speak(u);sfx('tap')}else $('#feedback-text').textContent='อุปกรณ์นี้ยังไม่มีเสียงอ่านภาษาอังกฤษ'});$('#reset-player').addEventListener('click',()=>{localStorage.removeItem('wqa.progress');location.reload()});
$$('[data-hint]').forEach(b=>b.addEventListener('click',()=>useHint(b.dataset.hint,Number(b.dataset.cost))));
document.addEventListener('keydown',e=>{const q=state.session[state.index];if(!q||q.mode!=='analysis'||!$('#screen-game').classList.contains('active')||state.checked)return;if(e.key==='1')useHint('first',5);else if(e.key==='2')useHint('vowel',10);else if(e.key==='3')useHint('translate',15);else if(/^[a-z]$/i.test(e.key))guessAnalysisLetter(e.key.toUpperCase());else if(e.key==='Backspace'&&state.typed.length){state.typed=state.typed.slice(0,-1);state.analysisWrong=[];state.analysisLastGuess=null;renderKeyboard();$('#continue-btn').disabled=true}});
function addCollectionWorlds(){const anchor=$('.egg-vault');if(!anchor)return;const groups=[{title:'🌊 มหาสมุทรประกาย · 🏜️ ทะเลทรายดาวตก',set:'ocean',pets:['Pearl','Echo','Coral','Sandy','Nova','Scout']},{title:'🌴 พงไพรสีรุ้ง · 🌼 ทุ่งดอกไม้',set:'jungle',pets:['Tango','Posty','Mellow','Pompom','Daisy','Dot']},{title:'💎 นครคริสตัล · 🍬 อาณาจักรขนมหวาน',set:'candy',pets:['Gem','Berry','Jelly','Sunny','Minto','Flora']}];let html='<div class="expanded-worlds">';for(const group of groups){html+=`<h2 class="world-title">${group.title} <small>6 ตัว</small></h2><div class="collection-grid compact ${group.set==='candy'?'mythic':''}">`;group.pets.forEach((name,i)=>{html+=`<article class="pet"><span class="sprite ${group.set} s${i+1}"></span><div><small>${group.set==='candy'?'MYTHIC':'EPIC'}</small><h2>${name}</h2><p>Rescue Friend</p></div></article>`});html+='</div>'}html+='<h2 class="world-title">🌌 ประตูลับ <small>Legendary · 2 ตัว</small></h2><div class="collection-grid compact mythic"><article class="pet mystery"><span>?</span><div><small>LEGENDARY</small><h2>ยังไม่เปิดเผย</h2><p>ผ่าน Boss ทุกโลก</p></div></article><article class="pet mystery"><span>?</span><div><small>LEGENDARY</small><h2>เพื่อนลับ</h2><p>Master คำศัพท์ 500 คำ</p></div></article></div></div>';anchor.insertAdjacentHTML('beforebegin',html)}
addCollectionWorlds();
/* legacy long collection builder retained for reference
function addLongGame(){const sets=['ocean','jungle','candy','forest','mountain','fantasy'],worlds=[['🏜️','ทะเลทรายดาวตก'],['🌊','มหาสมุทรประกาย'],['🌴','พงไพรสีรุ้ง'],['🌼','ทุ่งดอกไม้'],['🌋','ภูเขาไฟมิตรภาพ'],['❄️','หุบเขาน้ำแข็ง'],['☁️','นครเหนือเมฆ'],['🌙','ป่าราตรี'],['💎','นครคริสตัล'],['🍬','อาณาจักรขนมหวาน'],['💭','เกาะแห่งความฝัน'],['🌠','ทางช้างเผือก']],names=['Sahara','Dune','Amber','Cactus','Comet','Marina','Splash','Nori','Wave','Tide','Tango','Rio','Mango','Vine','Cocoa','Daisy','Honey','Clover','Poppy','Sunny','Ember','Flare','Lava','Spark','Ash','Snowy','Icicle','Polar','Flurry','Glace','Cirrus','Breeze','Skye','Feather','Zephyr','Nocti','Twinkle','Shadow','Velvet','Nova','Prism','Quartz','Ruby','Opal','Glimmer','Toffee','Jellybean','Cookie','Candy','Mallow','Dreamy','Wish','Dozy','Cloudlet','Mirage','Cosmo','Orbit','Galaxy','Astro','Meteor'];const anchor=$('.egg-vault');let html='<div class="long-collection">';worlds.forEach((w,wi)=>{html+=`<h2 class="world-title">${w[0]} ${w[1]} <small>${wi<4?'Uncommon':wi<8?'Epic':'Mythic'} · 5 ตัว</small></h2><div class="collection-grid compact ${wi>=8?'mythic':''}">`;for(let j=0;j<5;j++){const n=names[wi*5+j],set=sets[(wi+j)%sets.length];html+=`<article class="pet"><span class="sprite ${set} s${j%6+1}"></span><div><small>${wi<4?'UNCOMMON':wi<8?'EPIC':'MYTHIC'}</small><h2>${n}</h2><p>Friend #${41+wi*5+j}</p></div></article>`}html+='</div>'}html+='</div>';anchor.insertAdjacentHTML('beforebegin',html);const eye=$('#screen-collection .eyebrow');if(eye)eye.textContent='RESCUE JOURNAL · 100 FRIENDS';const intro=$('#screen-collection .map-head p:last-child');if(intro)intro.textContent='เพื่อนสะสม 100 ตัว จากสัตว์จริงและสัตว์มหัศจรรย์ใน 22 โลก';const hero=$('#screen-collection .collection-hero h2');if(hero)hero.textContent='ช่วยให้ครบทั้ง 100 ตัว';const count=$('#pet-count');if(count&&count.nextSibling)count.nextSibling.nodeValue='/100';const map=$('#screen-map'),after=map.querySelector('.next-world');const stage=document.createElement('section');stage.className='world-selector';stage.innerHTML='<div class="world-selector-head"><div><p class="eyebrow">100 MISSIONS</p><h2>เลือกโลกและด่าน</h2></div><p>แต่ละด่านสุ่ม 10 ข้อจากคลัง '+WORDS.length+' โจทย์</p></div><div class="world-grid">'+worlds.slice(0,10).map((w,i)=>`<article class="world-card ${i?'locked-world':''}"><span>${w[0]}</span><div><small>WORLD ${i+1}</small><h3>${w[1]}</h3><p>ด่าน ${i*10+1}–${i*10+10}</p></div><button ${i?'disabled':'data-play'}>${i?'🔒':'เล่น'}</button></article>`).join('')+'</div>';after.insertAdjacentElement('afterend',stage);stage.querySelectorAll('[data-play]').forEach(b=>b.addEventListener('click',startMission))}
*/
function buildLongGame(){const sets=['ocean','jungle','candy','forest','mountain','fantasy'];const worlds=['ทะเลทรายดาวตก','มหาสมุทรประกาย','พงไพรสีรุ้ง','ทุ่งดอกไม้','ภูเขาไฟมิตรภาพ','หุบเขาน้ำแข็ง','นครเหนือเมฆ','ป่าราตรี','นครคริสตัล','อาณาจักรขนมหวาน','เกาะแห่งความฝัน','ทางช้างเผือก'];const icons=['🏜️','🌊','🌴','🌼','🌋','❄️','☁️','🌙','💎','🍬','💭','🌠'];const names=['Sahara','Dune','Amber','Cactus','Comet','Marina','Splash','Nori','Wave','Tide','Tigris','Rio','Mango','Vine','Cocoa','Bloom','Honey','Clover','Poppy','Sunbeam','Ember','Flare','Lava','Spark','Ash','Snowy','Icicle','Polar','Flurry','Glace','Cirrus','Breeze','Skye','Feather','Zephyr','Nocti','Twinkle','Shadow','Velvet','Novella','Prism','Quartz','Ruby','Opal','Glimmer','Toffee','Jellybean','Cookie','Candy','Mallow','Dreamy','Wish','Dozy','Cloudlet','Mirage','Cosmo','Orbit','Galaxy','Astro','Meteor'];const anchor=$('.egg-vault');let html='<div class="long-collection">';for(let wi=0;wi<worlds.length;wi++){html+=`<h2 class="world-title">${icons[wi]} ${worlds[wi]} <small>5 ตัว</small></h2><div class="collection-grid compact ${wi>=8?'mythic':''}">`;for(let j=0;j<5;j++){const set=sets[(wi+j)%sets.length];html+=`<article class="pet"><span class="sprite ${set} s${j+1}"></span><div><small>${wi<4?'UNCOMMON':wi<8?'EPIC':'MYTHIC'}</small><h2>${names[wi*5+j]}</h2><p>Friend #${41+wi*5+j}</p></div></article>`}html+='</div>'}html+='</div>';anchor.insertAdjacentHTML('beforebegin',html);$('#screen-collection .eyebrow').textContent='RESCUE JOURNAL · 100 FRIENDS';const intro=$('#screen-collection .map-head p:last-child');if(intro)intro.textContent='เพื่อนสะสม 100 ตัว จากสัตว์จริงและสัตว์มหัศจรรย์ใน 22 โลก';$('#screen-collection .collection-hero h2').textContent='ช่วยให้ครบทั้ง 100 ตัว';const count=$('#pet-count');if(count&&count.nextSibling)count.nextSibling.nodeValue='/100';const after=$('#screen-map .next-world'),stage=document.createElement('section');stage.className='world-selector';stage.innerHTML=`<div class="world-selector-head"><div><p class="eyebrow">100 MISSIONS</p><h2>เลือกโลกและด่าน</h2></div><p>แต่ละด่านสุ่ม 10 ข้อจากคลัง ${WORDS.length} โจทย์</p></div><div class="world-grid">${worlds.slice(0,10).map((w,i)=>`<article class="world-card ${i?'locked-world':''}"><span>${icons[i]}</span><div><small>WORLD ${i+1}</small><h3>${w}</h3><p>ด่าน ${i*10+1}–${i*10+10}</p></div><button ${i?'disabled':'data-play'}>${i?'🔒':'เล่น'}</button></article>`).join('')}</div>`;after.insertAdjacentElement('afterend',stage);stage.querySelectorAll('[data-play]').forEach(b=>b.addEventListener('click',startMission))}
buildLongGame();
function renderPetAtlas(){
  const collection=$('#screen-collection'),anchor=collection.querySelector('.egg-vault');
  collection.querySelectorAll('.world-title,.collection-grid,.expanded-worlds,.long-collection').forEach(node=>node.remove());
  let html='<div class="pet-atlas">';
  for(let group=0;group<4;group++){
    const friends=PETS.slice(group*25,(group+1)*25);
    html+=`<section class="pet-atlas-world"><h2 class="world-title">${['🌿','🌊','🏔️','✨'][group]} ${friends[0].world} <small>25 ตัว</small></h2><div class="collection-grid compact">`;
    for(const pet of friends){
      const x=pet.cell%5*25,y=Math.floor(pet.cell/5)*25;
      html+=`<article class="pet atlas-card" data-pet-id="${pet.id}"><span class="pet-portrait" role="img" aria-label="${pet.species}" style="--pet-image:url('assets/pets-${pet.sheet}-25.png');--pet-x:${x}%;--pet-y:${y}%"></span><div><small>${pet.rarity} · #${pet.id}</small><h2>${pet.name}</h2><p>${pet.species} · ${pet.trait}</p><p class="pet-story">${pet.story}</p></div></article>`;
    }
    html+='</div></section>';
  }
  html+='</div>';anchor.insertAdjacentHTML('beforebegin',html);
}
renderPetAtlas();
$('#screen-result .rewards').insertAdjacentHTML('beforebegin','<p id="egg-hatch-message" role="status"></p>');
$('#screen-result .result-actions').insertAdjacentHTML('beforeend','<button class="primary" id="result-retry" hidden>ลองสู้บอสอีกครั้ง</button>');
$('#result-retry').addEventListener('click',()=>startMission());
// One completed rescue round reveals one friend; all earlier missions remain replayable.
function renderLongProgress(){
  const rescuedCount=state.petIds.length;
  const counter=$('#pet-count');if(counter)counter.textContent=rescuedCount;
  const intro=$('#screen-collection .map-head p:last-child');
  if(intro)intro.textContent='เพื่อนสะสม 100 ตัว จากสัตว์จริงและสัตว์มหัศจรรย์ใน 4 ดินแดน';
  const missionCopy=$('#screen-map .mission-card p:not(.eyebrow)');
  if(missionCopy)missionCopy.textContent='เล่น 10 ข้อคละ 6 รูปแบบ · ทุกด่านที่ 10 เป็นบอส ต้องถูกอย่างน้อย 7 ข้อ';
  $$('#screen-collection article.pet').forEach((card,index)=>{
    const rescued=state.petIds.includes(index+1);
    card.classList.toggle('locked',!rescued);
    card.setAttribute('aria-label',`${rescued?'ช่วยสำเร็จ':'ยังไม่ช่วย'}: ${card.querySelector('h2')?.textContent||`เพื่อนหมายเลข ${index+1}`}`);
  });
  $('.egg-vault p').textContent=`พลังฟักไข่ ${state.egg}% · ฟักแล้ว ${state.eggsHatched} ใบ · ทุก 5 ภารกิจที่สำเร็จมีโอกาสพบเพื่อน Mythic`;
  const worlds=['ป่ากระซิบ','มหาสมุทรประกาย','พงไพรสีรุ้ง','ทุ่งดอกไม้','ภูเขาไฟมิตรภาพ','หุบเขาน้ำแข็ง','นครเหนือเมฆ','ป่าราตรี','นครคริสตัล','อาณาจักรขนมหวาน'];
  const icons=['🌿','🌊','🌴','🌼','🌋','❄️','☁️','🌙','💎','🍬'];
  const grid=$('.world-selector .world-grid');
  if(!grid)return;
  const unlocked=Math.min(100,Math.max(1,Number(state.missionUnlocked)||1));
  const trail=$$('#screen-map .trail .level');
  trail.forEach((button,i)=>{
    const mission=i+1;
    button.classList.toggle('done',mission<unlocked);
    button.classList.toggle('current',mission===unlocked);
    button.classList.toggle('locked',mission>unlocked);
    button.classList.toggle('boss',mission===5&&mission>unlocked);
    button.disabled=mission>unlocked;
    button.innerHTML=mission<unlocked?'✓':mission===unlocked?`${mission}<span>เล่น</span>`:'🔒';
    button.setAttribute('aria-label',`ด่าน ${mission}${mission>unlocked?' ยังไม่ปลดล็อก':' เล่น'}`);
    if(!button.dataset.rescueBound){button.addEventListener('click',event=>{event.stopImmediatePropagation();state.mission=mission;startMission()},true);button.dataset.rescueBound='true'}
  });
  grid.innerHTML=worlds.map((world,wi)=>`<article class="world-card"><span>${icons[wi]}</span><div><small>WORLD ${wi+1}</small><h3>${world}</h3><p>ด่าน ${wi*10+1}–${wi*10+10}</p><div class="mission-grid">${Array.from({length:10},(_,j)=>{const n=wi*10+j+1,open=n<=unlocked;return `<button type="button" data-mission="${n}" ${open?'':'disabled'} aria-label="ด่าน ${n}${isBossMission(n)?' บอส':''}${open?' เล่นหรือเล่นซ้ำ':' ยังไม่ปลดล็อก'}">${n<unlocked?'✓':open?(isBossMission(n)?'👑':n):'🔒'}</button>`}).join('')}</div></div></article>`).join('');
  $$('[data-mission]').forEach(button=>button.addEventListener('click',()=>{state.mission=Number(button.dataset.mission);startMission()}));
  $$('#screen-map [data-play]').forEach(button=>{if(!button.dataset.rescueBound){button.addEventListener('click',()=>{state.mission=Number(state.missionUnlocked)||1},true);button.dataset.rescueBound='true'}});
}
renderLongProgress();
if(state.name){$('#player-name').value=state.name;$('#welcome-back').textContent=`ยินดีต้อนรับกลับ ${state.name}!`;$('#start-btn').textContent='เล่นต่อ'}renderStats();loadRanking();if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
