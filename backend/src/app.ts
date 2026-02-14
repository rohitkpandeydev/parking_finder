import express, { Express } from 'express';
import cors from 'cors';
import routes from './routes/index';
import { checkDatabaseConnection } from './config/database';
import { initializeSchema } from './config/schema';
import { env } from './config/env';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const startServer = async (): Promise<void> => {
  try {
    await checkDatabaseConnection();
    await initializeSchema();

    app.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
