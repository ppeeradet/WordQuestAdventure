export const TOTAL_MISSIONS=100;
export const BOSS_PASS_SCORE=7;
export const isBossMission=mission=>Number.isInteger(mission)&&mission>0&&mission%10===0;
const uniqueSorted=values=>[...new Set(values.filter(n=>Number.isInteger(n)&&n>=1&&n<=100))].sort((a,b)=>a-b);

export function normalizeProgress(raw={}){
  const unlocked=Math.min(100,Math.max(1,Number(raw.missionUnlocked)||1));
  const migrated=Array.from({length:Math.min(100,1+Math.max(0,Number(raw.completed)||0))},(_,i)=>i+1);
  return {
    ...raw,
    missionUnlocked:unlocked,
    petIds:uniqueSorted(Array.isArray(raw.petIds)?raw.petIds:migrated),
    completedMissions:uniqueSorted(Array.isArray(raw.completedMissions)?raw.completedMissions:Array.from({length:unlocked-1},(_,i)=>i+1)),
    eggsHatched:Math.max(0,Number(raw.eggsHatched)||0),
    egg:Math.max(0,Math.min(99,Number(raw.egg)||0)),
    errors:raw.errors&&typeof raw.errors==='object'?raw.errors:{}
  };
}

export function completeMission(progress,mission,score,total=10,random=Math.random){
  if(!Number.isInteger(mission)||mission<1||mission>TOTAL_MISSIONS||mission>progress.missionUnlocked)throw new Error('Mission is locked');
  if(!Number.isInteger(score)||score<0||score>total)throw new Error('Invalid score');
  const boss=isBossMission(mission),passed=!boss||score>=BOSS_PASS_SCORE;
  const next={...progress,petIds:[...progress.petIds],completedMissions:[...progress.completedMissions]};
  const earned=passed?score*5+10:score*2;
  next.xp=(Number(next.xp)||0)+earned;
  next.stars=(Number(next.stars)||0)+score;
  next.completed=(Number(next.completed)||0)+1;
  let newPetId=null,hatchedPetId=null;
  if(passed){
    if(!next.completedMissions.includes(mission))next.completedMissions.push(mission);
    if(mission===next.missionUnlocked&&next.missionUnlocked<100)next.missionUnlocked++;
    const missionPet=Math.min(100,mission+1);
    if(!next.petIds.includes(missionPet)){next.petIds.push(missionPet);newPetId=missionPet}
    next.egg=(Number(next.egg)||0)+20;
    if(next.egg>=100){
      next.egg-=100;next.eggsHatched=(Number(next.eggsHatched)||0)+1;
      const candidates=Array.from({length:25},(_,i)=>i+76).filter(id=>!next.petIds.includes(id));
      if(candidates.length){hatchedPetId=candidates[Math.floor(Math.max(0,Math.min(.999999,random()))*candidates.length)];next.petIds.push(hatchedPetId)}
    }
  }
  next.petIds=uniqueSorted(next.petIds);next.completedMissions=uniqueSorted(next.completedMissions);
  return {progress:next,reward:{boss,passed,earned,newPetId,hatchedPetId,egg:next.egg}};
}
