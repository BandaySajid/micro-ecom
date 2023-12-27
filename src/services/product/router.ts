import express from 'express';
import validation_schema from './middleware/validator.js';
import controller from './controller.js';
import { auth, verify_admin } from './middleware/auth.js';

const router: express.Router = new (express.Router as any)();

router.post('/create', auth, verify_admin, validation_schema.product_validation_schema, validation_schema.validate_product, controller.handle_create_product);
router.get('/products', auth, controller.handle_get_products);
router.put('/update', auth, verify_admin, controller.handle_update_product);
router.delete('/delete', auth, verify_admin, controller.handle_delete_product);

export default router;