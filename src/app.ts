import express from 'express'
import { buildSchema } from 'graphql'
import { graphqlHTTP } from 'express-graphql'
import { Sequelize, DataTypes } from 'sequelize'
import { readFileSync } from 'fs'

let sequelize = new Sequelize('sqlite:db.sqlite', { logging: false })

type TODO = {
    id: number
    title: string
    completed: boolean
    createdAt: number
    updatedAt: number
}

let Todo = sequelize.define('Todo', {
    title: DataTypes.STRING,
    completed: DataTypes.BOOLEAN
})

const PORT = process.env.PORT || 4000

sequelize.sync()

let schema = buildSchema(readFileSync(__dirname + '/../src/schema.gql').toString('utf-8'))

let resolvers = {
    findAll: async () => {
        return await Todo.findAll()
    },
    findById: async ({ id }: Partial<TODO>) => {
        return await Todo.findByPk(id)
    },
    create: async ({ title }: Partial<TODO>) => {
        return await Todo.create({ title, completed: false })
    },
    update: async ({ id, title }: Partial<TODO>) => {
        let todo = await Todo.findByPk(id)
        if (!todo) {
            return 'Todo not found'
        }
        await todo.update({ title })
        return todo
    },
    delete: async ({ id }: Partial<TODO>) => {
        let todo = await Todo.findByPk(id)
        await Todo.destroy({ where: { id } })
        return todo
    },
    markComplete: async ({ id }: Partial<TODO>) => {
        let todo = await Todo.findByPk(id)
        if (!todo) {
            return 'Todo not found'
        }
        await todo.update({ completed: true })
        return todo
    }
}

let app = express()
app.use('/', graphqlHTTP({ schema, rootValue: resolvers, graphiql: true }))
app.listen(PORT, () => console.log('http://localhost:' + PORT))
