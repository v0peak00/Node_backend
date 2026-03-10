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
  Person.find({}).then((people) => {
    response.json(people)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find((person) => person.id === id)
  if(person) {
    persons = persons.filter((person) => person.id !== id)
    response.status(200).json(person)
  } else {
    response.status(404).end()
  }
})

app.post('/api/persons', (request, response) => {
  const person = request.body
  
  if(!person.name || !person.number) {
    return response.status(400).json({error: "Missing name or number!"})
  } 
  const dbPerson = new Person({
    name: person.name,
    number: person.number
  })

  dbPerson.save().then((result) => {
    console.log("New Person entry created!")
    response.status(201).json(result)
  })
  
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})