import { GeneralEvent, recipes, users } from "@prisma/client";

const express = require('express');
const pool = require('./dbconfig/db_connector');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require('crypto');
const fileUpload = require("express-fileupload");

require('dotenv').config()

const prisma = new PrismaClient()

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());

const s3Client = new S3Client({
    region: 'eu-central-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  })


app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}.`);
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await prisma.users.findFirst({
        where: {
            username
        }
    })

    if (!user){
        return res.status(401).json({id: 0, username: "Invalid username or password"})
    }

    bcrypt.compare(password, user.password, function(error, result){
        if (error){
            console.error('Error:', error);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (result){
            console.log('Password match');
            const responseUser = { id: user.id, username: user.username};
            res.json(responseUser);
        } else {
            return res.status(401).json({id: 0, username: "Invalid username or password"});
        }
    });

})

app.post('/register', async (req, res) => {
    try {   
        const { username, password } = req.body;

        const existingUser = await prisma.users.findFirst({
            where: {
                username
            }
        })

        if (existingUser){
            return res.status(409).json({message: "User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.users.create({
            data: {
                username,
                password: hashedPassword
            }
        })

        res.json({message: "User registered succesfully"})
        
    } catch (error) {
        res.status(500).send({msg: `Internal server error: ${(error as Error).message}`})
    }
})

app.get("/recipes", async (req, res) => {
    const recipes: recipes[] = await prisma.recipes.findMany({
        take: 20
    });
    res.json(recipes);
})


app.get("/recipes/:recipeId", async (req, res) => {
    const recipe = await prisma.recipes.findUnique({
        where: {
            id: parseInt(req.params.recipeId)
        }
    })

    res.json(recipe);
})


app.get("/cake_recipes", async (req, res) => {
    const veganRecipes: recipes[] = await prisma.recipes.findMany({
        take: 20,
        where: {
            title: {
                contains: "Cake"
            }
        }
    })

    res.json(veganRecipes)
})


app.get("/salad_recipes", async (req, res) => {
    const saladRecipes: recipes[] = await prisma.recipes.findMany({
        take: 20,
        where: {
            title: {
                contains: "Salad"
            }
        }
    })

    res.json(saladRecipes)
})


app.get("/nearby_events", async (req, res) => {
    const nearbyEvents: GeneralEvent[] = await prisma.GeneralEvent.findMany();

    res.json(nearbyEvents);
})


app.post("/nearby_events", async (req, res) => {
    const nearbyEventData = req.data;

    const newNearbyEvent: GeneralEvent = await prisma.GeneralEvent.create({
        data: nearbyEventData
    });

    res.json(newNearbyEvent);
})


app.get("/users/:userId/events", async (req, res) => {
    const userId = parseInt(req.params.userId);

    const user = await prisma.users.findUnique({
        where: { id: userId },
    });

    if (!user){
        return res.status(400).json({message: "User not found"})
    }

    const userEvents: Event[] = await prisma.Event.findMany({
        where: {
            userId: userId
        },
    });

    return res.json(userEvents);
})


app.post("/users/:userId/events", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const eventData = req.body;

    const user = await prisma.users.findUnique({
        where: { id: userId },
    });

    if (!user){
        return res.status(400).json({message: "User not found"})
    }
    
    const createdEvent: Event = await prisma.Event.create({
        data: {
            ...eventData,
            userId: userId
        }
    })

    res.json(createdEvent)
})


app.delete("/events/:eventId", async (req, res) => {
    const eventId = parseInt(req.params.eventId);

    await prisma.Event.delete({
        where: { id: eventId },
      });

    res.json({message: "Event deleted successfully"})   
})


app.get("/events/:eventId", async (req, res) => {
    const eventId = parseInt(req.params.eventId);

    const event = await prisma.Event.findFirst({
        where: { id: eventId },
      });

    res.json(event)   
})


const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

app.post('/upload', async (req, res) => {
    const file = req.files.file;

    const fileName = generateFileName();

    const uploadParams = {
        Bucket: 'eventsapp-mobile',
        Body: file.data,
        Key: fileName,
        ContentType: file.mimetype
      }

    await s3Client.send(new PutObjectCommand(uploadParams));

    const imageUrl = `https://eventsapp-mobile.s3.eu-central-1.amazonaws.com/${fileName}`;
    res.json({ imageUrl });
  });
