const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/models');

// Testlere başlamadan önce veritabanını hazırla
beforeAll(async () => {
  // Test ortamında tabloları sıfırdan oluştur (Veriler silinir!)
  await db.sequelize.sync({ force: true });
});

// Tüm testler bitince bağlantıyı kapat
afterAll(async () => {
  await db.sequelize.close();
});

describe('Auth Endpoints Integration Tests', () => {
  
  const testUser = {
    email: 'test@student.edu.tr',
    password: 'Password123!',
    role: 'student',
    student_number: '12345'
  };

  let verifyToken; // Email doğrulama için saklayacağız
  let userToken;   // Login sonrası token için

  // --- 1. REGISTER TESTİ ---
  it('POST /api/v1/auth/register should create a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Kayıt başarılı');
    
    // Veritabanından token'ı çekelim (Verification testi için)
    const user = await db.User.findOne({ where: { email: testUser.email } });
    expect(user).toBeTruthy();
    expect(user.is_verified).toBe(false); // Başlangıçta pasif olmalı
    
    // Hashli token DB'de duruyor, ama biz testi basitleştirmek için 
    // verifyEmail endpoint'ini mocklamak yerine,
    // direkt veritabanından kullanıcıyı aktif edelim.
    // (Gerçek verify testi için token'ı mail logundan parse etmek gerekir, bu karmaşık olur)
    user.is_verified = true;
    await user.save();
  });

  // --- 2. DUPLICATE EMAIL TESTİ ---
  it('POST /api/v1/auth/register should fail for duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(400); // 400 Bad Request
    expect(res.body.success).toBe(false);
  });

  // --- 3. LOGIN TESTİ ---
  it('POST /api/v1/auth/login should return tokens for valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    
    userToken = res.body.data.accessToken; // Sonraki testler için sakla
  });

  // --- 4. LOGIN FAIL TESTİ ---
  it('POST /api/v1/auth/login should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  // --- 5. PROTECTED ROUTE TESTİ (/me) ---
  it('GET /api/v1/users/me should return user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${userToken}`); // Token'ı header'a ekle

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
  });

  // --- 6. UNAUTHORIZED TESTİ ---
  it('GET /api/v1/users/me should fail without token', async () => {
    const res = await request(app).get('/api/v1/users/me');

    expect(res.statusCode).toEqual(401);
  });
});