const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
mongoose
  .connect(url)
  .then((result) => console.log('Successfully connected to Mongo DB'))
  .catch((error) => console.log('Error connecting to Mongo DB:', error.message))

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
