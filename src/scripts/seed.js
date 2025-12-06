const db = require('../models');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  try {
    // Veritabanı tablolarını senkronize et (Değişiklik varsa uygula)
    await db.sequelize.sync({ alter: true });
    console.log('🔄 Veritabanı senkronize edildi.');

    // --- 1. BÖLÜMLERİ EKLE ---
    let cengDept, eeeDept, archDept; // ID'leri tutmak için
    
    const deptCount = await db.Department.count();
    if (deptCount === 0) {
      console.log('🏢 Bölümler ekleniyor...');
      cengDept = await db.Department.create({ name: 'Bilgisayar Mühendisliği', code: 'CENG', faculty_name: 'Mühendislik Fakültesi' });
      eeeDept = await db.Department.create({ name: 'Elektrik-Elektronik Müh.', code: 'EEE', faculty_name: 'Mühendislik Fakültesi' });
      archDept = await db.Department.create({ name: 'Mimarlık', code: 'ARCH', faculty_name: 'Mimarlık Fakültesi' });
      await db.Department.create({ name: 'İşletme', code: 'BUS', faculty_name: 'İİBF' });
    } else {
      console.log('ℹ️ Bölümler zaten var, veritabanından çekiliyor...');
      cengDept = await db.Department.findOne({ where: { code: 'CENG' } });
      eeeDept = await db.Department.findOne({ where: { code: 'EEE' } });
      archDept = await db.Department.findOne({ where: { code: 'ARCH' } });
    }

    // --- 2. ADMIN OLUŞTUR ---
    const adminEmail = 'admin@kampus.edu.tr';
    const adminExists = await db.User.findOne({ where: { email: adminEmail } });
    
    if (!adminExists) {
      console.log('🛡️ Admin oluşturuluyor...');
      await db.User.create({
        email: adminEmail,
        password_hash: 'Password123!', // Hook bunu hashleyecek
        role: 'admin',
        is_verified: true,
        name: 'Sistem Yöneticisi',
        bio: 'Kampüs sistem yöneticisi.'
      });
    }

    // --- 3. ÖĞRETİM ÜYELERİ OLUŞTUR ---
    const facultyData = [
      { email: 'mehmet.hoca@kampus.edu.tr', name: 'Dr. Mehmet Yılmaz', title: 'Dr. Öğr. Üyesi', deptId: cengDept.id, empNo: 'FAC-001' },
      { email: 'ayse.prof@kampus.edu.tr', name: 'Prof. Dr. Ayşe Demir', title: 'Prof. Dr.', deptId: eeeDept.id, empNo: 'FAC-002' }
    ];

    for (const fac of facultyData) {
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
      { email: 'ali.veli@ogrenci.edu.tr', no: '2022001', deptId: cengDept.id },
      { email: 'zeynep.kaya@ogrenci.edu.tr', no: '2022002', deptId: cengDept.id },
      { email: 'can.türk@ogrenci.edu.tr', no: '2022003', deptId: eeeDept.id },
      { email: 'elif.su@ogrenci.edu.tr', no: '2022004', deptId: archDept.id }, // Farklı fakülte
      { email: 'burak.yilmaz@ogrenci.edu.tr', no: '2022005', deptId: cengDept.id }
    ];

    for (const stu of studentData) {
      const exists = await db.User.findOne({ where: { email: stu.email } });
      if (!exists) {
        console.log(`🎓 Öğrenci ekleniyor: ${stu.email}`);
        const newUser = await db.User.create({
          email: stu.email,
          password_hash: 'Password123!',
          role: 'student',
          is_verified: true, // Test için direkt onaylı
          bio: 'Merhaba ben bir öğrenciyim.'
        });

        await db.Student.create({
          userId: newUser.id,
          student_number: stu.no,
          departmentId: stu.deptId,
          gpa: (Math.random() * 2 + 2).toFixed(2), // 2.00 - 4.00 arası rastgele not
          current_semester: 3
        });
      }
    }

    console.log('✅ SEED İŞLEMİ BAŞARIYLA TAMAMLANDI.');
    console.log('👉 Admin Girişi: admin@kampus.edu.tr / Password123!');
    console.log('👉 Öğrenci Girişi: ali.veli@ogrenci.edu.tr / Password123!');
    
    process.exit();
  } catch (error) {
    console.error('❌ Seed Hatası:', error);
    process.exit(1);
  }
};

seedDatabase();