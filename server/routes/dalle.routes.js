import express from 'express';
//import { Configuration } from 'openai';
import * as dotenv from 'dotenv';
import OpenAIApi from 'openai';

dotenv.config();

const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY,
})

const router = express.Router();

router.route('/').get((req, res) => { 
    res.status(200).json({ message: 'Hello from openai routes!' });
})

router.route('/').post(async (req, res) => {
    try {
        const { prompt } = req.body;
        
        const response = await openai.createImage({
            prompt,
            n: 1,
            size: '1024x1024',
            respone_format: 'b64_json'
        })

        const image = response.data.data[0].b64_json

        res.status(200).json({ photo: image });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
})

export default router;