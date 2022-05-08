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

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => response.json(persons))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) =>
      person ? response.json(person) : response.status(404).end()
    )
    .catch((error) => next(error))
})

app.get('/info', (request, response) => {
  Person.countDocuments().then((count) =>
    response.send(
      `<div>Phonebook has info for ${count} people</div></br><div>${new Date()}</div>`
    )
  )
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response
      .status(400)
      .json({ error: '"name" and "number" must both be present' })
  }

  const person = { name, number }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((_result) => response.status(204).end())
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  // name and number should not be empty
  if (!name || !number) {
    return response
      .status(400)
      .json({ error: '"name" and "number" must both be present' })
  }

  const person = new Person({ name, number })
  person
    .save()
    .then((savedPerson) => response.json(savedPerson))
    .catch((error) => next(error))
})

// Error handling middleware
app.use((error, request, response, next) => {
  console.log(error.message)

  // If cast/validation error, we return bad request error
  if (error.name === 'CastError')
    return response.status(400).send({ error: 'Malformed id' })
  if (error.name === 'ValidationError' || error.name === 'MongoServerError')
    return response.status(400).send({ error: error.message })

  // Otherwise forward it to next middleware
  next(error)
})

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server started on port ${PORT}`)
