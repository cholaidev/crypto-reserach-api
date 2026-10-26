const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
const healthRoutes = require('./routes/health.routes');
const coinsRoutes = require('./routes/coins.routes');
const marketRoutes = require('./routes/market.routes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Crypto Research API is running',
    version: '1.0.0',
  });
});

app.use('/api', healthRoutes);
app.use('/api/coins', coinsRoutes);
app.use('/api/market', marketRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
