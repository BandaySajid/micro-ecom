import express from 'express';
import controller from './controller.js';
import { auth } from './middleware/auth.js';

const router: express.Router = new (express.Router as any)();

router.post('/create', auth, controller.handle_create_order);
router.get('/orders', auth, controller.handle_get_orders);
router.put('/update', auth, controller.handle_update_order);
router.delete('/delete', auth, controller.handle_delete_order);

export default router;