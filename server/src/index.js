import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import contentRoutes from './routes/content.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://washingtonamedu_db_user:GLbNRaKpH60O6eHY@affiliate-content-facto.qqexvx7.mongodb.net/?appName=Affiliate-Content-Factory';

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'affiliate-content-factory-api' });
});

app.use('/api/content', contentRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
