import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import residentRoutes from './routes/residentRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Society Management API is operational'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Society Management API is operational.'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resident', residentRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/polls', pollRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

app.use(errorMiddleware);

export default app;
