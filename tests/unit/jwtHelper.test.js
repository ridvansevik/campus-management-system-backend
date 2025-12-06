const { generateTokens } = require('../../src/utils/jwtHelper');
const jwt = require('jsonwebtoken');

// .env değişkenlerini mock'layalım (taklit edelim)
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRE = '10m';
process.env.JWT_REFRESH_EXPIRE = '1d';

describe('JWT Helper Unit Tests', () => {
  
  it('should generate valid access and refresh tokens', () => {
    const mockUser = { id: 1, role: 'student', email: 'test@test.com' };
    
    const tokens = generateTokens(mockUser);

    // 1. Tokenlar tanımlı mı?
    expect(tokens).toHaveProperty('accessToken');
    expect(tokens).toHaveProperty('refreshToken');

    // 2. Access Token doğru veriyi içeriyor mu?
    const decodedAccess = jwt.verify(tokens.accessToken, process.env.JWT_SECRET);
    expect(decodedAccess.id).toBe(mockUser.id);
    expect(decodedAccess.role).toBe(mockUser.role);

    // 3. Refresh Token doğru veriyi içeriyor mu?
    const decodedRefresh = jwt.verify(tokens.refreshToken, process.env.JWT_SECRET);
    expect(decodedRefresh.id).toBe(mockUser.id);
  });

});