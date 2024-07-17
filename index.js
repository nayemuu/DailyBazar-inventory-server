import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { connectToDatabase } from './connectToDatabase.js';
import authRoutes from './routes/authRoutes.js';
import locationRoutes from './routes/locationRoutes.js';

dotenv.config();
const app = express();
const port = process.env.PORT;

// middlewares
app.use(express.static(`${__dirname}/public/`));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ root: __dirname });
});

// router middleware
app.use('/api/auth', authRoutes);
app.use('/api/location', locationRoutes);

// error handling middleware
function errorHandler(err, req, res, next) {
  console.log('error = ', err);
  if (res.headersSent) {
    next('error - headers already sent');
  } else if (err?.message) {
    res.status(500).send({ message: err.message });
  } else {
    res.status(500).send({
      message:
        'there was an error, express did not give any message for this error',
    });
  }
}

app.use(errorHandler);

app.listen(port, async () => {
  await connectToDatabase();
  console.log(`response address is = http://localhost:${port}`);
});
