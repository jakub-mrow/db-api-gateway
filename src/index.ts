import { recipes } from "@prisma/client";

const express = require('express');
const pool = require('./dbconfig/db_connector');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config()

const prisma = new PrismaClient()

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}.`);
});


app.get('/users', async (req, res) => {
    await pool.connect();

    const query = 'SELECT * FROM Users';
    const dbResponse = await pool.query(query);

    res.json(dbResponse.rows);
})

app.post('/user', async (req, res) => {
    try {
        const username: string = req.body["username"];
        const password: string = req.body["password"];

        await pool.connect();

        const query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}');`
        const dbResponse = await pool.query(query);
        console.log(dbResponse)

        const responseMessage: Object = {msg: "User has been created successfully"}
        res.status(201).send(responseMessage)
        
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
