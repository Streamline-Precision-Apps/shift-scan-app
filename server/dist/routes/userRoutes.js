
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="345d904a-ca6b-5a70-8f88-a3f3f775864d")}catch(e){}}();
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
//# debugId=345d904a-ca6b-5a70-8f88-a3f3f775864d
