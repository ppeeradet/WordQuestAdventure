# Word Quest Adventure

เกมเว็บเรียนรู้คำศัพท์โครงการใหม่ แยกจาก PetRescue เดิมโดยสมบูรณ์ มี 100 ด่าน สัตว์สะสม 100 ตัว โจทย์ 6 แบบรวม Listening บอสและไข่ฟัก

## เล่นและเผยแพร่

ตัวเกมอยู่ใน `dist/` เปิดผ่าน local HTTP server เพื่อทดสอบ และรัน `npm test` ตรวจ 100 ด่าน หากสร้าง repository ใหม่และ push ไป `main`, GitHub Pages workflow จะเผยแพร่ `dist/`; ปัจจุบันยังไม่มี URL สาธารณะที่ตรวจยืนยันแล้ว

## เป้าหมาย implementation

- Static-first PWA พร้อม deploy บน GitHub Pages
- Firebase Firestore สำหรับ cloud progress และ ranking พร้อม local fallback เมื่อกฎ/เครือข่ายไม่พร้อม; ยังไม่เปิด cloud write สาธารณะ
- Touch-first responsive บน phone, iPad/tablet และ computer

รายละเอียดผลิตภัณฑ์ โครงสร้างข้อมูล และ technical plan อยู่ใน `docs/GAME_DESIGN_V1.md`
