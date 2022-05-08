const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config() // import before next line
const Person = require('./models/person')

const app = express()

// Middleware
app.use(express.static('build'))
app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
]

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => response.json(persons))
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)

  const person = persons.find((person) => person.id === id)
  return person ? response.json(person) : response.status(404).end()
})

app.get('/', (request, response) => {
  response.send(`<div>Go to <a href="/info">info</a></div>`)
})

app.get('/info', (request, response) => {
  response.send(
    `<div>Phonebook has info for ${
      persons.length
    } people</div></br><div>${new Date()}</div>`
  )
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response
      .status(400)
      .json({ error: "'name' and 'number' must both be present" })
  }

  const person = { name, number }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => response.status(204).end())
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response) => {
  const { name, number } = request.body

  // name and number should not be empty
  if (!name || !number) {
    return response
      .status(400)
      .json({ error: "'name' and 'number' must both be present" })
  }

  const person = new Person({ name, number })
  person.save().then((savedPerson) => response.json(savedPerson))
})

// Error handling middleware
app.use((error, request, response, next) => {
  console.log(error.message)

  // If cast error, we return bad request error
  if (error.name === 'CastError')
    return response.status(400).send({ error: 'Malformed id' })

  // Otherwise forward it to next mw
  next(error)
})

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server started on port ${PORT}`)
