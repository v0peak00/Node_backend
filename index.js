require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(express.static('dist'))

morgan.token('personObject', function getPersonObject (req) {
  return JSON.stringify(req.body)
})
app.use(morgan('tiny', {skip: function (req, res) { return req.method === 'POST' }}))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :personObject'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  const count = 5
  const date = new Date(Date.now()).toString()

  response.send(`
    <div>
      <p>Phonebook has info for ${count} people </p>
      <p>${date} </p>
    </div>`)
})

app.get('/api/persons', (request, response) => {
  Person.find({})
  .then((people) => {
    response.json(people)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
  .then((person) => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch((error) => next(error))
})

app.post('/api/persons', (request, response) => {
  const { name, number } = request.body
  
  if(!name || !number) {
    return response.status(400).json({error: "Missing name or number!"})
  } 
  const person = new Person({
    name: name,
    number: number
  })

  person.save().then((result) => {
    response.status(201).json(result)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  console.log("name: " + name)
  console.log("number: " + number)
  Person.findById(request.params.id)
  .then((person) => {
    if (!person) {
      return response.status(404).end()
    }
    person.name = name
    person.nnumber = number

    return person.save().then((updatedPerson) => {
      response.json(updatedPerson)
    })
  })
  .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
  .then((person) => {
    response.status(200).json(person)
  })
  .catch((error) => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})