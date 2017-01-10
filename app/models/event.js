const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: String,
  location: String,
  description: String,
});

module.exports = mongoose.model('Event', eventSchema);
