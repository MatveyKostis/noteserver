import * as fs from "node:fs/promises";
import express from "express"
import {json} from "express";
import cors from "cors";
import pool from "./db/connect.js"

const app = express();
const port = 3000;

app.use(express.json());



async function getData() {
    const file = (await fs.readFile("./data.json")).toString()
    const data = JSON.parse(file);
    console.log(data)
    return data
}
async function putData(data) {
    await fs.writeFile("./data.json", JSON.stringify(data))
}

app.use(cors())

app.get('/', (req, res) => {
    const {name} = req.query
    console.log(name)
    res.send(name).status(429);

})

app.post('/signup', async (req, res, next) => {
    const {username, password} = req.body
    try{
        const session = await pool.connect()
        const result = await session.query(`
    INSERT INTO users (name, password) VALUES ($1, $2) RETURNING *
    `, [username, password])
    } catch (e) {
        next({status: 400, message: "idk_something"})
        return
    }
    res.status(200).send({
        "status": "success",
        "message": "go_login"
    })
    // const data = (await fs.readFile("./data.json")).toString()
    // const file = JSON.parse(data)
    // if (req.body.username.length >= 10) {
    //     next({status: 400, message: "too_long_name"})
    //     return
    // }
    // const users = file.users
    // const user = users.find((item) => item.username === req.body.username)
    // if (user) {
    //     next({status: 400, message: "user_exists"})
    //     return
    // }
    // users.push(req.body)
    // await fs.writeFile("./data.json", JSON.stringify(file))

})

app.post("/auth", async (req, res, next) => {
    const {username, password} = req.body
    try {
        const session = await pool.connect()
        const result = await session.query(`
        select id, name from users where name = $1 and password = $2
        `, [username, password])
        if (result.rows.length === 0) {
            throw new Error();
        }
        res.status(200).send({
            status: "success",
            message: "login_success",
            id: result.rows[0].id
        })
    } catch (e) {
        next({status: 401, message: "smthing_wrong"})
    }



})


app.post("/note", async (req, res, next) => {
    const {text, userid, topic} = req.body
    try {
        const session = await pool.connect()
        const result = await session.query(`
        insert into notes (text, "user", topic) values ($1, $2, $3)
        `, [text, userid, topic])
        console.log(result)
        res.status(200).send({
            status: "success",
            message: "created"
        });
    } catch (e) {
        console.log(e)
        next({status: 400, message: "user_exists"})
    }

});

app.get("/note", async (req, res, next) => {
    const { user } = req.query
    try {
        const session = await pool.connect()
        const result = await session.query(`
            select * from notes where "user" = $1
        `, [user])
        res.json(result.rows)
    } catch (e) {
        console.log(e)
        res.status(400).send({
            status: "err",
            message: "no_notes_for_you"
        })
    }
})

app.use((req, res) => {
    res.status(404).send({
        "status": "err",
        "message": "unknown_endpoint"
    })
})

app.use((err, req, res, next) => {
    console.log("uh oh, an error: " + err.status)
    res.status(err.status).send({
        "status": "err",
        "message": err.message
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})