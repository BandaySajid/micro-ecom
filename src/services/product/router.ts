import express from 'express';
import validation_schema from './middleware/validator.js';
import controller from './controller.js';
import { auth } from './middleware/auth.js';

const router: express.Router = new (express.Router as any)();

router.post('/create', auth, validation_schema.product_validation_schema, validation_schema.validate_product, controller.handle_create_product);
router.get('/products', auth, controller.handle_get_products);
router.put('/update', auth, controller.handle_update_product);
router.delete('/delete', auth, controller.handle_delete_product);

export default router;