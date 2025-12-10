const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * Department Routes
 * 
 * Public routes for listing departments (used in registration forms)
 * Protected routes for management (admin only)
 */

// Public routes - accessible without authentication
router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);

// Protected routes - admin only
router.post('/', protect, authorize('admin'), departmentController.createDepartment);
router.put('/:id', protect, authorize('admin'), departmentController.updateDepartment);
router.delete('/:id', protect, authorize('admin'), departmentController.deleteDepartment);
router.get('/:id/stats', protect, authorize('admin'), departmentController.getDepartmentStats);

module.exports = router;

