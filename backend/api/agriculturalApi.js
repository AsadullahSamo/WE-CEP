const express = require('express');
const router = express.Router();
const agriculturalController = require('../controllers/agriculturalController');

// Get all data
router.get('/', agriculturalController.getAllData);

// Get data by year
router.get('/year/:year', agriculturalController.getDataByYear);

// Get data by crop
router.get('/crop/:crop', agriculturalController.getDataByCrop);

// Get data by region
router.get('/region/:region', agriculturalController.getDataByRegion);

// Add new data
router.post('/', agriculturalController.addData);

// Update data
router.put('/:id', agriculturalController.updateData);

// Delete data
router.delete('/:id', agriculturalController.deleteData);

module.exports = router; 