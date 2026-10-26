const express = require('express');
const {
  getMarketList,
  getCoinDetails,
  getHistoricalChart,
  search,
} = require('../controllers/coins.controller');

const router = express.Router();

router.get('/', getMarketList);
router.get('/search', search);
router.get('/:id/chart', getHistoricalChart);
router.get('/:id', getCoinDetails);

module.exports = router;
