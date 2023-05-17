import { recipes, users } from "@prisma/client";

const express = require('express');
const pool = require('./dbconfig/db_connector');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

require('dotenv').config()

const prisma = new PrismaClient()

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}.`);
});


app.get('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.users.findFirst({
            where: {
                username
            }
        })

        if (!user){
            return res.status(401).json({message: "Invalid username or password"})
        }

        const passwordMatch: boolean = await bcrypt.compare(password, user.password);

        if (!passwordMatch){
            return res.status(401).json({message: "Invalid username or password"});
        }

        res.json({message: "Login successfull"});


    } catch(error){
        console.error(error);
        res.status(500).json({message: "Internal server error"})
    }
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
