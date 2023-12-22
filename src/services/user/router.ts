import express from "express";
import controller from "./controller.js";
import validate from "./middleware/validator.js";

const router: express.Router = new (express.Router as any)();

router.post('/signup', validate.user_validation_schema, validate.validate_user, controller.signup);
router.post('/signin', controller.signin);
router.put('/update', controller.update_user);
router.delete('/delete', controller.delete_user);

export default router;