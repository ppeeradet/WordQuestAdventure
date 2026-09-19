export function rankPlayers(entries,limit=20){
  const byName=new Map();
  for(const entry of entries){
    if(!entry||typeof entry.displayName!=='string'||typeof entry.nameKey!=='string')continue;
    const displayName=entry.displayName.trim(),nameKey=entry.nameKey.trim();
    if(!displayName||!nameKey)continue;
    const xp=Math.max(0,Number(entry.xp)||0),stars=Math.max(0,Number(entry.stars)||0);
    const previous=byName.get(nameKey);
    if(!previous||xp>previous.xp||(xp===previous.xp&&stars>previous.stars))byName.set(nameKey,{displayName,nameKey,xp,stars});
  }
  return [...byName.values()].sort((a,b)=>b.xp-a.xp||b.stars-a.stars||a.displayName.localeCompare(b.displayName)).slice(0,limit);
}
