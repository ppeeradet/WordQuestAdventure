export const TOTAL_MISSIONS=100;
export const BOSS_PASS_SCORE=7;
export const isBossMission=mission=>Number.isInteger(mission)&&mission>0&&mission%10===0;
const uniqueSorted=values=>[...new Set(values.filter(n=>Number.isInteger(n)&&n>=1&&n<=100))].sort((a,b)=>a-b);

export function normalizeProgress(raw={}){
  const unlocked=Math.min(100,Math.max(1,Number(raw.missionUnlocked)||1));
  const migrated=Array.from({length:Math.min(100,1+Math.max(0,Number(raw.completed)||0))},(_,i)=>i+1);
  const completedMissions=uniqueSorted(Array.isArray(raw.completedMissions)?raw.completedMissions:Array.from({length:unlocked-1},(_,i)=>i+1));
  return {
    ...raw,
    missionUnlocked:unlocked,
    petIds:uniqueSorted(Array.isArray(raw.petIds)?raw.petIds:migrated),
    completedMissions,
    eggsHatched:Math.max(0,Number(raw.eggsHatched)||0),
    // Egg progress follows distinct cleared stages, never replay count or stale cloud snapshots.
    egg:(completedMissions.length%5)*20,
    errors:raw.errors&&typeof raw.errors==='object'?raw.errors:{}
  };
}

// Merge two copies of the same named player's progress without discarding rescues.
export function mergeProgress(local={},cloud={}){
  const a=normalizeProgress(local),b=normalizeProgress(cloud);
  const higher=(field)=>Math.max(Number(a[field])||0,Number(b[field])||0);
  const counters=(field)=>Object.fromEntries([...new Set([...Object.keys(a[field]||{}),...Object.keys(b[field]||{})])].map(key=>[key,Math.max(Number(a[field]?.[key])||0,Number(b[field]?.[key])||0)]));
  return normalizeProgress({...a,xp:higher('xp'),stars:higher('stars'),streak:higher('streak'),completed:higher('completed'),missionUnlocked:higher('missionUnlocked'),eggsHatched:higher('eggsHatched'),petIds:uniqueSorted([...a.petIds,...b.petIds]),completedMissions:uniqueSorted([...a.completedMissions,...b.completedMissions]),mastery:counters('mastery'),errors:counters('errors')});
}

export function completeMission(progress,mission,score,total=10,random=Math.random){
  const current=normalizeProgress(progress);
  if(!Number.isInteger(mission)||mission<1||mission>TOTAL_MISSIONS||mission>current.missionUnlocked)throw new Error('Mission is locked');
  if(!Number.isInteger(score)||score<0||score>total)throw new Error('Invalid score');
  const boss=isBossMission(mission),passed=!boss||score>=BOSS_PASS_SCORE;
  const next={...current,petIds:[...current.petIds],completedMissions:[...current.completedMissions]};
  const earned=passed?score*5+10:score*2;
  next.xp=(Number(next.xp)||0)+earned;
  next.stars=(Number(next.stars)||0)+score;
  next.completed=(Number(next.completed)||0)+1;
  let newPetId=null,hatchedPetId=null;
  if(passed){
    const firstClear=!next.completedMissions.includes(mission);
    if(firstClear)next.completedMissions.push(mission);
    if(mission===next.missionUnlocked&&next.missionUnlocked<100)next.missionUnlocked++;
    const missionPet=Math.min(100,mission+1);
    if(firstClear&&!next.petIds.includes(missionPet)){next.petIds.push(missionPet);newPetId=missionPet}
    next.egg=(next.completedMissions.length%5)*20;
    if(firstClear&&next.completedMissions.length%5===0){
      next.eggsHatched=(Number(next.eggsHatched)||0)+1;
      const candidates=Array.from({length:25},(_,i)=>i+76).filter(id=>!next.petIds.includes(id));
      if(candidates.length){hatchedPetId=candidates[Math.floor(Math.max(0,Math.min(.999999,random()))*candidates.length)];next.petIds.push(hatchedPetId)}
    }
  }
  next.petIds=uniqueSorted(next.petIds);next.completedMissions=uniqueSorted(next.completedMissions);
  return {progress:next,reward:{boss,passed,earned,newPetId,hatchedPetId,egg:next.egg}};
}
