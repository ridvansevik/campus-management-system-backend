const { Department, Student, Faculty } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * Department Controller
 * 
 * Handles all department-related operations following layered architecture.
 * Used for registration forms, profile management, and department listing.
 */

// @desc    Get all departments
// @route   GET /api/v1/departments
// @access  Public
exports.getAllDepartments = asyncHandler(async (req, res, next) => {
  const departments = await Department.findAll({
    attributes: ['id', 'name', 'code', 'faculty_name'],
    order: [['faculty_name', 'ASC'], ['name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: departments.length,
    data: departments
  });
});

// @desc    Get department by ID with details
// @route   GET /api/v1/departments/:id
// @access  Public
exports.getDepartmentById = asyncHandler(async (req, res, next) => {
  const department = await Department.findByPk(req.params.id, {
    attributes: ['id', 'name', 'code', 'faculty_name', 'created_at', 'updated_at'],
    include: [
      {
        model: Student,
        as: 'students',
        attributes: ['id', 'student_number', 'userId'],
        limit: 10 // Limit for performance
      },
      {
        model: Faculty,
        as: 'facultyMembers',
        attributes: ['id', 'employee_number', 'title', 'userId']
      }
    ]
  });

  if (!department) {
    return next(new ErrorResponse('Bölüm bulunamadı.', 404));
  }

  res.status(200).json({
    success: true,
    data: department
  });
});

// @desc    Create new department (Admin only)
// @route   POST /api/v1/departments
// @access  Private/Admin
exports.createDepartment = asyncHandler(async (req, res, next) => {
  const { name, code, faculty_name } = req.body;

  // Check if department with same code exists
  const existingDept = await Department.findOne({ where: { code } });
  if (existingDept) {
    return next(new ErrorResponse('Bu kod ile kayıtlı bir bölüm zaten var.', 400));
  }

  const department = await Department.create({
    name,
    code,
    faculty_name
  });

  res.status(201).json({
    success: true,
    message: 'Bölüm başarıyla oluşturuldu.',
    data: department
  });
});

// @desc    Update department (Admin only)
// @route   PUT /api/v1/departments/:id
// @access  Private/Admin
exports.updateDepartment = asyncHandler(async (req, res, next) => {
  const { name, code, faculty_name } = req.body;

  let department = await Department.findByPk(req.params.id);

  if (!department) {
    return next(new ErrorResponse('Bölüm bulunamadı.', 404));
  }

  // Check if new code conflicts with another department
  if (code && code !== department.code) {
    const existingDept = await Department.findOne({ where: { code } });
    if (existingDept) {
      return next(new ErrorResponse('Bu kod ile kayıtlı başka bir bölüm var.', 400));
    }
  }

  department = await department.update({
    name: name || department.name,
    code: code || department.code,
    faculty_name: faculty_name || department.faculty_name
  });

  res.status(200).json({
    success: true,
    message: 'Bölüm başarıyla güncellendi.',
    data: department
  });
});

// @desc    Delete department (Admin only)
// @route   DELETE /api/v1/departments/:id
// @access  Private/Admin
exports.deleteDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findByPk(req.params.id);

  if (!department) {
    return next(new ErrorResponse('Bölüm bulunamadı.', 404));
  }

  // Check if department has students or faculty
  const studentCount = await Student.count({ where: { departmentId: req.params.id } });
  const facultyCount = await Faculty.count({ where: { departmentId: req.params.id } });

  if (studentCount > 0 || facultyCount > 0) {
    return next(new ErrorResponse(
      'Bu bölüme kayıtlı öğrenci veya öğretim üyesi bulunmaktadır. Önce ilişkileri kaldırın.',
      400
    ));
  }

  await department.destroy();

  res.status(200).json({
    success: true,
    message: 'Bölüm başarıyla silindi.',
    data: {}
  });
});

// @desc    Get department statistics
// @route   GET /api/v1/departments/:id/stats
// @access  Private/Admin
exports.getDepartmentStats = asyncHandler(async (req, res, next) => {
  const department = await Department.findByPk(req.params.id);

  if (!department) {
    return next(new ErrorResponse('Bölüm bulunamadı.', 404));
  }

  const studentCount = await Student.count({ where: { departmentId: req.params.id } });
  const facultyCount = await Faculty.count({ where: { departmentId: req.params.id } });

  res.status(200).json({
    success: true,
    data: {
      department: {
        id: department.id,
        name: department.name,
        code: department.code,
        faculty_name: department.faculty_name
      },
      statistics: {
        totalStudents: studentCount,
        totalFaculty: facultyCount
      }
    }
  });
});

