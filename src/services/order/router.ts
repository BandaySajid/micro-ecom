import express from 'express';
import controller from './controller.js';
import { auth, verify_admin } from './middleware/auth.js';

const router: express.Router = new (express.Router as any)();

router.post('/create', auth, controller.handle_create_order);
router.get('/orders', auth, controller.handle_get_orders);
router.put('/update', auth, verify_admin, controller.handle_update_order);
router.put('/cancel', auth, controller.handle_cancel_order);
router.delete('/delete', auth, controller.handle_delete_orders);

export default router;