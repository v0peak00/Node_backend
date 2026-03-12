const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI_PHONEBOOK

console.log('connecting to', url)
mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z]{3,}$/.test(v)
      },
      message: props => `${props.value} is not a valid name (minimum 3 characters)!`
    },
    required: true

  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{2}-\d{7}$|^\d{3}-\d{8}$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: true
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)