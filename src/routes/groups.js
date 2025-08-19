import express from 'express';
import GroupsController from '../controller/groupsController.js';

const router = express.Router();

router.get('/', GroupsController.getAllGroups);
router.get('/:groupId', GroupsController.getGroupById);

export default router;
