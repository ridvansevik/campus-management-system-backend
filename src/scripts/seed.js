const db = require('../models');
const bcrypt = require('bcrypt');

// Bekleme fonksiyonu (Railway cold start için)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Bağlantı deneme mekanizması
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Veritabanına bağlanılıyor... (Deneme ${i + 1}/${retries})`);
      await db.sequelize.authenticate();
      console.log('✅ Veritabanı bağlantısı başarılı.');
      return true;
    } catch (err) {
      console.error(`❌ Bağlantı başarısız: ${err.message}`);
      if (i < retries - 1) {
        console.log(`⏳ ${delay / 1000} saniye bekleniyor...`);
        await wait(delay);
      }
    }
  }
  return false;
};

const seedDatabase = async () => {
  try {
    // 1. Bağlantıyı Garantile
    const isConnected = await connectWithRetry();
    if (!isConnected) {
      console.error('❌ Veritabanına bağlanılamadı, seed işlemi iptal edildi.');
      process.exit(1);
    }

    // 2. Tabloları Senkronize Et
    await db.sequelize.sync({ alter: true });
    console.log('🔄 Veritabanı senkronize edildi.');

    // --- 1. BÖLÜMLERİ GÜVENLİ EKLE (findOrCreate) ---
    // Bu yöntem varsa bulur, yoksa oluşturur. Hata vermez.
    const departmentsList = [
      { name: 'Bilgisayar Mühendisliği', code: 'CENG', faculty_name: 'Mühendislik Fakültesi' },
      { name: 'Elektrik-Elektronik Müh.', code: 'EEE', faculty_name: 'Mühendislik Fakültesi' },
      { name: 'Mimarlık', code: 'ARCH', faculty_name: 'Mimarlık Fakültesi' },
      { name: 'İşletme', code: 'BUS', faculty_name: 'İİBF' }
    ];

    for (const dept of departmentsList) {
      await db.Department.findOrCreate({
        where: { code: dept.code },
        defaults: dept
      });
    }
    console.log('🏢 Bölümler kontrol edildi/eklendi.');

    // ID'leri almak için veritabanından çekelim
    const cengDept = await db.Department.findOne({ where: { code: 'CENG' } });
    const eeeDept = await db.Department.findOne({ where: { code: 'EEE' } });
    const archDept = await db.Department.findOne({ where: { code: 'ARCH' } });

    // --- 2. ADMIN OLUŞTUR ---
    const adminEmail = 'admin@kampus.edu.tr';
    const adminExists = await db.User.findOne({ where: { email: adminEmail } });
    
    if (!adminExists) {
      console.log('🛡️ Admin oluşturuluyor...');
      await db.User.create({
        email: adminEmail,
        password_hash: 'Password123!',
        role: 'admin',
        is_verified: true,
        name: 'Sistem Yöneticisi',
        bio: 'Kampüs sistem yöneticisi.'
      });
    } else {
      console.log('🛡️ Admin zaten mevcut.');
    }

    // --- 3. ÖĞRETİM ÜYELERİ OLUŞTUR ---
    const facultyData = [
      { email: 'mehmet.hoca@kampus.edu.tr', name: 'Dr. Mehmet Yılmaz', title: 'Dr. Öğr. Üyesi', deptId: cengDept?.id, empNo: 'FAC-001' },
      { email: 'ayse.prof@kampus.edu.tr', name: 'Prof. Dr. Ayşe Demir', title: 'Prof. Dr.', deptId: eeeDept?.id, empNo: 'FAC-002' }
    ];

    for (const fac of facultyData) {
      if (!fac.deptId) continue;

      const exists = await db.User.findOne({ where: { email: fac.email } });
      if (!exists) {
        console.log(`👨‍🏫 Öğretim üyesi ekleniyor: ${fac.name}`);
        const newUser = await db.User.create({
          email: fac.email,
          password_hash: 'Password123!',
          role: 'faculty',
          is_verified: true,
          phone_number: '05551112233',
          address: 'Kampüs Lojmanları'
        });
        
        await db.Faculty.create({
          userId: newUser.id,
          employee_number: fac.empNo,
          title: fac.title,
          departmentId: fac.deptId,
          office_location: 'Mühendislik Binası A-Blok'
        });
      }
    }

    // --- 4. ÖĞRENCİLERİ OLUŞTUR ---
    const studentData = [
      { email: 'ali.veli@ogrenci.edu.tr', no: '2022001', deptId: cengDept?.id },
      { email: 'zeynep.kaya@ogrenci.edu.tr', no: '2022002', deptId: cengDept?.id },
      { email: 'can.türk@ogrenci.edu.tr', no: '2022003', deptId: eeeDept?.id },
      { email: 'elif.su@ogrenci.edu.tr', no: '2022004', deptId: archDept?.id },
      { email: 'burak.yilmaz@ogrenci.edu.tr', no: '2022005', deptId: cengDept?.id }
    ];

    for (const stu of studentData) {
      if (!stu.deptId) continue;

      const exists = await db.User.findOne({ where: { email: stu.email } });
      if (!exists) {
        console.log(`🎓 Öğrenci ekleniyor: ${stu.email}`);
        const newUser = await db.User.create({
          email: stu.email,
          password_hash: 'Password123!',
          role: 'student',
          is_verified: true,
          bio: 'Merhaba ben bir öğrenciyim.'
        });

        await db.Student.create({
          userId: newUser.id,
          student_number: stu.no,
          departmentId: stu.deptId,
          gpa: (Math.random() * 2 + 2).toFixed(2),
          current_semester: 3
        });
      }
    }

    console.log('✅ SEED İŞLEMİ BAŞARIYLA TAMAMLANDI.');
    console.log('👉 Admin Girişi: admin@kampus.edu.tr / Password123!');
    console.log('👉 Öğrenci Girişi: ali.veli@ogrenci.edu.tr / Password123!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Hatası:', error);
    process.exit(1);
  }
};

seedDatabase();