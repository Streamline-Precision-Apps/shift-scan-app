import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
const router = Router();
// User routes
router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);
export default router;
//# sourceMappingURL=userRoutes.js.map