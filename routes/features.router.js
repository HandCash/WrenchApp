const express = require("express");
const router = express.Router();
const controller = require('../controllers/features.controller')
const auth = require("../middleware/auth.middleware");

// send a test transaction on the user's behalf
router.get('/auth/test-send', auth, controller.sendTransaction);

// send a multisend test transaction on the user's behalf
router.get('/auth/test-multi-send', auth, controller.sendMultisendTransaction);

// send a multisend test transaction on the user's behalf
router.get('/auth/test-data', auth, controller.sendDataTransaction);

// fetch a transaction
router.post('/auth/get-transaction', auth, controller.getTransaction);

// fetch a transaction
router.post('/auth/encrypt', auth, controller.postEncrypt);

module.exports = router;
