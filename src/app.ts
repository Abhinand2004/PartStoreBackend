import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Partstore API is running' });
});

// Import Routes
import authRoutes from './modules/auth/auth-routes.js';
import productRoutes from './modules/product/product-routes.js';
import categoryRoutes from './modules/category/category-routes.js';
import orderRoutes from './modules/order/order-routes.js';
import cartRoutes from './modules/cart/cart-routes.js';
import blogRoutes from './modules/blog/blog-routes.js';
import brandRoutes from './modules/brand/brand-routes.js';
import tagRoutes from './modules/tag/tag-routes.js';
import pageRoutes from './modules/page/page-routes.js';


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/pages', pageRoutes);


// Error Handler Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;
