require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`\n🔧 Kaam Karao Backend Server`);
  console.log(`📡 Running on http://0.0.0.0:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🚀 API:    http://localhost:${PORT}/api/request`);
  console.log(`⏰ Started at: ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}\n`);
});
