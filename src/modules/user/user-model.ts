import prisma from '../../config/db.js';
import bcrypt from 'bcryptjs';

// No explicit "model" file needed like Mongoose, as Prisma generates the client.
// However, we can add helper functions here if needed.

export const matchPassword = async (enteredPassword: string, hashedPassword: string) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
