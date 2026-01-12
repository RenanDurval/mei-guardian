const express = require('express');
const router = express.Router();
const cnpjController = require('../controllers/cnpjController');
const dasController = require('../controllers/dasController');
const authMiddleware = require('../middlewares/authMiddleware');

// CNPJ Routes
router.post('/cnpj', authMiddleware, cnpjController.addCnpj);
router.get('/cnpj', authMiddleware, cnpjController.listCnpjs);
router.post('/cnpj/:id/sync', authMiddleware, cnpjController.syncStatus);

// DAS Routes
router.post('/das/generate', authMiddleware, dasController.generateDasForYear);
router.get('/das', authMiddleware, dasController.listDas);
router.post('/das/:id/pay', authMiddleware, dasController.simulatePay);

const invoiceController = require('../controllers/invoiceController');

// Invoice Routes
router.post('/invoices', authMiddleware, invoiceController.createInvoice);
router.get('/invoices', authMiddleware, invoiceController.listInvoices);

module.exports = router;
