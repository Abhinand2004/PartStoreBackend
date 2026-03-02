import express from 'express';
import { getTags } from './tag-controller.js';
import { validate } from '../../middleware/validate-middleware.js';
import { getTagsSchema } from './tag-validation.js';

const router = express.Router();

router.get('/', validate(getTagsSchema), getTags);

export default router;
