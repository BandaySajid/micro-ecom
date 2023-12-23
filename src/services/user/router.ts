import express from "express";
import controller from "./controller.js";
import validate from "./middleware/validator.js";
import { auth } from './middleware/auth.js';

const router: express.Router = new (express.Router as any)();

router.post('/signup', validate.user_validation_schema, validate.validate_user, controller.handle_signup);
router.post('/signin', controller.handle_signin);
router.put('/update', auth, controller.handle_update_user);
router.delete('/delete', auth, controller.handle_delete_user);

export default router;