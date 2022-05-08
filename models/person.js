const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
mongoose
  .connect(url)
  .then((_result) => console.log('Successfully connected to Mongo DB'))
  .catch((error) => console.log('Error connecting to Mongo DB:', error.message))

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
    unique: true,
  },
  number: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function (v) {
        return /^\d{2,3}-[0-9|_]+/.test(v) || /^[0-9]+$/.test(v)
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
