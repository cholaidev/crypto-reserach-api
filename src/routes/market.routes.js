const express = require('express');
const { getGlobalMarketStats } = require('../controllers/coins.controller');

const router = express.Router();

router.get('/global', getGlobalMarketStats);

module.exports = router;
