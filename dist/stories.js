export const OPENING_STORY={
  audioId:'opening',
  title:'เรื่องราวของ Word Quest',
  en:'Maple found a glowing map. Each new English word lights a path to an animal waiting for help. Read, listen, and solve the word puzzles. Together, we can bring every friend home.',
  th:'เมเปิลพบแผนที่เรืองแสง คำศัพท์ภาษาอังกฤษแต่ละคำจะส่องทางไปหาเพื่อนสัตว์ที่รอความช่วยเหลือ อ่าน ฟัง และไขปริศนาคำศัพท์ แล้วพาเพื่อนทุกตัวกลับบ้านไปด้วยกัน'
};

const WORLDS=[
  ['ป่ากระซิบ','Whispering Forest','mist covers the old bridge and the trees whisper clues','หมอกคลุมสะพานเก่า และต้นไม้กระซิบบอกเบาะแส',['animals','actions']],
  ['มหาสมุทรประกาย','Shimmering Ocean','bright waves hide a trail of glowing shells','คลื่นระยิบระยับซ่อนเส้นทางเปลือกหอยเรืองแสง',['animals','places']],
  ['พงไพรสีรุ้ง','Rainbow Jungle','colorful leaves point toward a secret clearing','ใบไม้หลากสีชี้ทางไปยังลานลับ',['animals','weather']],
  ['ทุ่งดอกไม้','Flower Meadow','the wind carries messages between the flowers','สายลมพาข้อความเดินทางระหว่างดอกไม้',['weather','describing']],
  ['ภูเขาไฟมิตรภาพ','Friendship Volcano','warm stones mark a safe path up the mountain','ก้อนหินอุ่น ๆ บอกทางปลอดภัยขึ้นภูเขา',['actions','weather']],
  ['หุบเขาน้ำแข็ง','Ice Valley','snowy footprints lead across the quiet valley','รอยเท้าบนหิมะพาข้ามหุบเขาเงียบสงบ',['clothes','weather']],
  ['นครเหนือเมฆ','Cloud City','floating bridges connect the houses in the sky','สะพานลอยฟ้าเชื่อมบ้านเหนือก้อนเมฆ',['places','weather']],
  ['ป่าราตรี','Moonlit Woods','moonlight reveals symbols on the sleeping trees','แสงจันทร์เผยสัญลักษณ์บนต้นไม้ที่หลับใหล',['time','describing']],
  ['นครคริสตัล','Crystal City','sparkling crystals reflect hidden words','ผลึกประกายสะท้อนคำศัพท์ที่ซ่อนอยู่',['describing','school']],
  ['อาณาจักรขนมหวาน','Candy Kingdom','sweet paths twist around a colorful castle','ทางเดินแสนหวานคดเคี้ยวรอบปราสาทสีสด',['food','family']]
];
const BEATS=[
  ['A new friend is waiting near the first path.','เพื่อนใหม่รออยู่ใกล้ทางเส้นแรก'],
  ['Find the clue beside the little bridge.','หาเบาะแสข้างสะพานเล็ก'],
  ['Follow the sound and listen carefully.','ตามเสียงไปและตั้งใจฟัง'],
  ['Choose the right words to open the gate.','เลือกคำที่ถูกต้องเพื่อเปิดประตู'],
  ['A lost sign needs a reader who can help.','ป้ายที่หายไปต้องการนักอ่านมาช่วย'],
  ['Put the missing letters back in place.','เติมตัวอักษรที่หายไปให้ถูกที่'],
  ['A puzzle is hidden along the winding trail.','ปริศนาซ่อนอยู่ตามทางคดเคี้ยว'],
  ['Use what you learned to guide your friend.','ใช้สิ่งที่เรียนรู้พาเพื่อนไปต่อ'],
  ['The next doorway is almost in sight.','ประตูถัดไปใกล้เข้ามาแล้ว'],
  ['The guardian waits at the final gate. Show what you know!','ผู้พิทักษ์รอที่ประตูสุดท้าย แสดงสิ่งที่เรียนรู้กันเถอะ']
];

export function missionStory(mission,friendName){
  if(!Number.isInteger(mission)||mission<1||mission>100)throw new Error('Invalid mission');
  const world=WORLDS[Math.floor((mission-1)/10)],beat=BEATS[(mission-1)%10],name=friendName||'your friend';
  return {
    audioId:String(mission).padStart(3,'0'),
    title:`ด่าน ${mission} · ${world[0]}`,
    en:`In ${world[1]}, ${world[2]}. ${beat[0]} ${name} is counting on you.`,
    th:`ใน${world[0]} ${world[3]} ${beat[1]} ${name} กำลังรอคุณช่วย`,
    topics:world[4],
    boss:mission%10===0
  };
}
