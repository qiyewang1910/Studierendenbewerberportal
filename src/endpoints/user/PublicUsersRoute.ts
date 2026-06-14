import { Router, Request, Response } from 'express';
import { UserService } from './UserService';

const router = Router();

// 1.Get - all users
router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ "Error": "Internal server error" });
    }
});

// 1.Get - user by ID
router.get('/:userID', async (req: Request, res: Response) => {
    try {
        const userID = req.params.userID;
        const user = await UserService.getUser(userID);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ "Error": "User not found" });
        }
    } catch (error: any) {
        res.status(500).json({ "Error": "Internal server error" });
    }
});

// 2. Post
router.post('/', async (req: Request, res: Response) => {
    try {
        const userData = req.body;  
        const newUser = await UserService.createUser(userData);
        res.status(201).json(newUser);
    } catch (error: any) {
        res.status(400).json({ "Error": error.message });
    }
});
       

// 3. Put
router.put('/:userID', async (req: Request, res: Response) => {
    const userID = req.params.userID;
    const updateData = req.body;
    try {
        const updatedUser = await UserService.updateUser(userID, updateData);
        if (updatedUser) { 
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ "Error": "User not found" });
        }
    } catch (error: any) {
        res.status(400).json({ "Error": error.message });
    }
});

// 4. Delete
router.delete('/:userID', async (req: Request, res: Response) => {
    const userID = req.params.userID;
    try {
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

