/**
 * AI Fitness Trainer — Express Server
 * Entry point: registers middleware, routes, and starts listening.
 */

require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const path         = require('path');
const connectDB    = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// ─── Database ─────────────────────────────────────────────────────────────────
connectDB();

// ─── Security & parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:3000').split(','),
  credentials: true,
}));

// Rate limiting: 100 requests / 15 min per IP
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX)       || 100,
  message:  { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Static uploads ──────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./src/routes/auth'));
app.use('/api/users',     require('./src/routes/users'));
app.use('/api/workouts',  require('./src/routes/workouts'));
app.use('/api/metrics',   require('./src/routes/metrics'));
app.use('/api/calories',  require('./src/routes/calories'));
app.use('/api/exercises', require('./src/routes/exercises'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/diet',      require('./src/routes/diet'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'healthy',
    service:   'AI Fitness Trainer — Backend',
    env:       process.env.NODE_ENV || 'development',
    timestamp: new Date(),
  });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
