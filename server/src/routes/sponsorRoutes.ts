import express from 'express';
import { Sponsor } from '../src/models/Sponsor';

const router = express.Router();


router.get('/', (req, res) => { 
    try{
        const sponsors = await Sponsor.find();
        res.json(sponsors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sponsors' });
    }


    });
    export default router;