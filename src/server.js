const app = require('./app');
require('dotenv').config();

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Crypto Research API listening on port ${port}`);
});
