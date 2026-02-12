import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './config/database';
import routes from './routes/index';

// Ensure .env is loaded regardless of PM2 working directory.
// - In dev (ts-node), __dirname is backend/src → ../.env is backend/.env
// - In prod (dist), __dirname is backend/dist → ../.env is backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
// Fallback: also try current working directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
