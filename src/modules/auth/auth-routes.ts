import express from 'express';
import { loginUser, registerUser } from './auth-controller.js';
import { validate } from '../../middleware/validate-middleware.js';
import { registerSchema, loginSchema } from './auth-validation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

export default router;
