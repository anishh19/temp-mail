import 'reflect-metadata';
import express from 'express';
import { NODE_ENV, PORT, ORIGIN, CREDENTIALS, LOG_FORMAT } from '@config';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { logger, stream } from '@utils/logger';
import { connectMongodb } from '@database';
import mail from '@/routes/mail';
const expressListRoutes = require('express-list-routes');

class App {
  public app: express.Application;
  public port: number;
  public env: string;

  constructor() {
    this.app = express();
    this.port = parseInt(PORT, 10);
    this.env = NODE_ENV || 'development';

    this.initializeMiddlewares();
    logger.info('Middlewares initialized');

    this.connectToDatabase();
    logger.info('Database connected');

    this.initializeRoutes();
    logger.info('Routes initialized');
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`ENV: ${this.env} Server listening on the port ${this.port}`);
    });
  }

  private initializeMiddlewares() {
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(hpp());
    this.app.use(helmet());
  }

  private async connectToDatabase() {
    await connectMongodb();
  }

  private initializeRoutes() {
    this.app.use('/v1/mail', mail);
    if (this.env === 'development') {
      expressListRoutes(this.app);
    }
  }
}
export default App;
