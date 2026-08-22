import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import tripsRoutes from './routes/trips.routes';
import stopsRoutes from './routes/stops.routes';
import citiesRoutes from './routes/cities.routes';
import activitiesRoutes from './routes/activities.routes';
import shareRoutes from './routes/share.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/trips', tripsRoutes);
app.use('/stops', stopsRoutes);
app.use('/cities', citiesRoutes);
app.use('/activities', activitiesRoutes);
app.use('/share', shareRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
