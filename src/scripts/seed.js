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
      { name: 'Elektrik-Elektronik Mühendisliği', code: 'EEE', faculty_name: 'Mühendislik Fakültesi' },
      { name: 'Makine Mühendisliği', code: 'ME', faculty_name: 'Mühendislik Fakültesi' },
      { name: 'İnşaat Mühendisliği', code: 'CE', faculty_name: 'Mühendislik Fakültesi' },
      { name: 'Endüstri Mühendisliği', code: 'IE', faculty_name: 'Mühendislik Fakültesi' },
      { name: 'Mimarlık', code: 'ARCH', faculty_name: 'Mimarlık Fakültesi' },
      { name: 'İç Mimarlık', code: 'IA', faculty_name: 'Mimarlık Fakültesi' },
      { name: 'İşletme', code: 'BUS', faculty_name: 'İktisadi ve İdari Bilimler Fakültesi' },
      { name: 'İktisat', code: 'ECON', faculty_name: 'İktisadi ve İdari Bilimler Fakültesi' },
      { name: 'Hukuk', code: 'LAW', faculty_name: 'Hukuk Fakültesi' },
      { name: 'Tıp', code: 'MED', faculty_name: 'Tıp Fakültesi' },
      { name: 'Hemşirelik', code: 'NURS', faculty_name: 'Sağlık Bilimleri Fakültesi' }
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
        first_name: 'Admin',
        last_name: 'Yönetici',
        phone_number: '05001234567',
        bio: 'Kampüs sistem yöneticisi.'
      });
    } else {
      console.log('🛡️ Admin zaten mevcut.');
    }

    // --- 3. ÖĞRETİM ÜYELERİ OLUŞTUR ---
    const facultyData = [
      { 
        email: 'mehmet.yilmaz@kampus.edu.tr', 
        firstName: 'Mehmet', 
        lastName: 'Yılmaz',
        title: 'Dr. Öğr. Üyesi', 
        deptId: cengDept?.id, 
        empNo: 'FAC-001',
        specialization: 'Yapay Zeka ve Makine Öğrenmesi'
      },
      { 
        email: 'ayse.demir@kampus.edu.tr', 
        firstName: 'Ayşe', 
        lastName: 'Demir',
        title: 'Prof. Dr.', 
        deptId: eeeDept?.id, 
        empNo: 'FAC-002',
        specialization: 'Güç Sistemleri'
      }
    ];

    for (const fac of facultyData) {
      if (!fac.deptId) continue;

      const exists = await db.User.findOne({ where: { email: fac.email } });
      if (!exists) {
        console.log(`👨‍🏫 Öğretim üyesi ekleniyor: ${fac.firstName} ${fac.lastName}`);
        const newUser = await db.User.create({
          email: fac.email,
          password_hash: 'Password123!',
          role: 'faculty',
          is_verified: true,
          first_name: fac.firstName,
          last_name: fac.lastName,
          phone_number: '05551112233',
          address: 'Kampüs Lojmanları, Ankara',
          city: 'Ankara',
          country: 'Türkiye'
        });
        
        await db.Faculty.create({
          userId: newUser.id,
          employee_number: fac.empNo,
          title: fac.title,
          departmentId: fac.deptId,
          office_location: 'Mühendislik Binası A-Blok',
          office_phone: '03121234567',
          specialization: fac.specialization,
          hire_date: new Date(),
          status: 'active'
        });
      }
    }

    // --- 4. ÖĞRENCİLERİ OLUŞTUR ---
    const studentData = [
      { 
        email: 'ali.veli@ogrenci.edu.tr', 
        firstName: 'Ali', 
        lastName: 'Veli',
        no: '2022001', 
        deptId: cengDept?.id,
        tcNo: '12345678901'
      },
      { 
        email: 'zeynep.kaya@ogrenci.edu.tr', 
        firstName: 'Zeynep', 
        lastName: 'Kaya',
        no: '2022002', 
        deptId: cengDept?.id,
        tcNo: '12345678902'
      },
      { 
        email: 'can.turk@ogrenci.edu.tr', 
        firstName: 'Can', 
        lastName: 'Türk',
        no: '2022003', 
        deptId: eeeDept?.id,
        tcNo: '12345678903'
      },
      { 
        email: 'elif.su@ogrenci.edu.tr', 
        firstName: 'Elif', 
        lastName: 'Su',
        no: '2022004', 
        deptId: archDept?.id,
        tcNo: '12345678904'
      },
      { 
        email: 'burak.yilmaz@ogrenci.edu.tr', 
        firstName: 'Burak', 
        lastName: 'Yılmaz',
        no: '2022005', 
        deptId: cengDept?.id,
        tcNo: '12345678905'
      }
    ];

    for (const stu of studentData) {
      if (!stu.deptId) continue;

      const exists = await db.User.findOne({ where: { email: stu.email } });
      if (!exists) {
        console.log(`🎓 Öğrenci ekleniyor: ${stu.firstName} ${stu.lastName}`);
        const newUser = await db.User.create({
          email: stu.email,
          password_hash: 'Password123!',
          role: 'student',
          is_verified: true,
          first_name: stu.firstName,
          last_name: stu.lastName,
          tc_identity_number: stu.tcNo,
          date_of_birth: new Date('2002-01-15'),
          gender: 'male',
          phone_number: '05551234567',
          address: 'Örnek Mahallesi, Örnek Sokak No:1',
          city: 'Ankara',
          country: 'Türkiye',
          bio: 'Merhaba ben bir öğrenciyim.'
        });

        await db.Student.create({
          userId: newUser.id,
          student_number: stu.no,
          departmentId: stu.deptId,
          gpa: (Math.random() * 2 + 2).toFixed(2),
          cgpa: (Math.random() * 2 + 2).toFixed(2),
          current_semester: 3,
          enrollment_date: new Date('2022-09-15'),
          status: 'active'
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