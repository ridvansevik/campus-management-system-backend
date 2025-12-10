const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Geçerli bir email adresi giriniz.',
    'any.required': 'Email alanı zorunludur.'
  }),
  
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d\\W_]{8,}$'))
    .required()
    .messages({
      'string.min': 'Şifre en az 8 karakter olmalıdır.',
      'string.pattern.base': 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.',
      'any.required': 'Şifre alanı zorunludur.'
    }),
  
  role: Joi.string().valid('student', 'faculty').required().messages({
    'any.required': 'Rol seçimi zorunludur.',
    'any.only': 'Rol sadece student veya faculty olabilir.'
  }),
  
  // Personal Information
  first_name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Ad en az 2 karakter olmalıdır.',
    'any.required': 'Ad alanı zorunludur.'
  }),
  last_name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Soyad en az 2 karakter olmalıdır.',
    'any.required': 'Soyad alanı zorunludur.'
  }),
  tc_identity_number: Joi.string().length(11).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'TC Kimlik No 11 haneli olmalıdır.',
    'string.pattern.base': 'TC Kimlik No sadece rakam içermelidir.',
    'any.required': 'TC Kimlik No zorunludur.'
  }),
  date_of_birth: Joi.date().max('now').optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  phone_number: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  country: Joi.string().optional(),
  
  // Department - Required for both student and faculty
  department_id: Joi.number().required().messages({
    'any.required': 'Bölüm seçimi zorunludur.'
  }),
  
  // Student-specific
  student_number: Joi.string().when('role', {
    is: 'student',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  
  // Faculty-specific
  employee_number: Joi.string().when('role', {
    is: 'faculty',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  title: Joi.string().valid('Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi', 'Arş. Gör.', 'Öğr. Gör.', 'Okutman')
    .when('role', {
      is: 'faculty',
      then: Joi.required().messages({
        'any.required': 'Öğretim üyesi için ünvan seçimi zorunludur.'
      }),
      otherwise: Joi.forbidden()
    }),
  office_location: Joi.string().when('role', {
    is: 'faculty',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  specialization: Joi.string().when('role', {
    is: 'faculty',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = { registerSchema, loginSchema };