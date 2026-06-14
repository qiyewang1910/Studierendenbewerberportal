import { Router, Request, Response } from 'express';
import UserService  from './UserService';

const router = Router();

// Get all users
router.get('/', async (_req, res) => {
    try {
        const users = await UserService.getAllUsers();
        const filtered = users.map(u => { const { password, ...rest } = u.toJSON() as any; return rest; });
        res.status(200).json(filtered);
    } catch (error: any) {
        res.status(500).json({ "Error": "Internal server error" });
    }
});

// Get user by ID
router.get('/:userID', async (req, res) => {
    try {
        const userID = req.params.userID;
        const user = await UserService.getUser(userID, true, userID);
        if (user) {
            const { password, ...rest } = user.toJSON() as any;
            res.status(200).json(rest);
        } else {
            res.status(404).json({ "Error": "User not found" });
        }
    } catch (error: any) {
        res.status(500).json({ "Error": "Internal server error" });
    }
});

// Create user
router.post('/', async (req: Request, res: Response) => {
    try {
        const userData = req.body;  
        const newUser = await UserService.createUser(userData);
        const { password, ...rest } = newUser.toJSON() as any;
        res.status(201).json(rest);
    } catch (error: any) {
        res.status(400).json({ "Error": error.message });
    }
});
       

// Update user
router.put('/:userID', async (req: Request, res: Response) => {
    try {
        const userID = req.params.userID;
        const updateData = req.body;
        const updatedUser = await UserService.updateUser(userID, true, userID, updateData);
        if (updatedUser) {
            const { password, ...rest } = updatedUser.toJSON() as any;
            res.status(200).json(rest);
        } else {
            res.status(404).json({ "Error": "User not found" });
        }
    } catch (error: any) {
        res.status(400).json({ "Error": error.message });
    }
});

// Delete user
router.delete('/:userID', async (req: Request, res: Response) => {
    try {
        const userID = req.params.userID;
        const isDeleted = await UserService.deleteUser(userID);
        if (isDeleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ "Error": "User not found" });
        }
    } catch (error: any) {
        res.status(500).json({ "Error": error.message });
    }
});

export default router;
