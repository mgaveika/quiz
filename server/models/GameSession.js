const mongoose = require('mongoose')

const ParticipantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  answer: { // pašreizējā atbilde
    type: String,
    default: null
  },
  score: { // kopējie punkti
    type: Number,
    default: 0
  },
  connected: { // vai lietotājs ir pieslēdzies
    type: Boolean,
    default: true
  },
  isPlayer: { // false, ja skatītājs
    type: Boolean,
    default: true
  },
  answersHistory: [ // visas atbildes sesijas laikā
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      answer: String,
      correct: Boolean,
      timeTaken: Number, // sekundēs
    }
  ],
  ready: { // ready toggle lobby 
    type: Boolean,
    default: false
  },
})

const GameSessionSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  participants: [ParticipantSchema],
  currentQuestion: { // pašreizējais jautājums p/k
    type: Number,
    default: 0
  },
  questionStartTime: { // jautājuma sākuma laiks
    type: Date
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  settings: {
    timePerQuestion: { // sekundēs
      type: Number,
      default: 30
    },
    allowSpectators: {
      type: Boolean,
      default: true
    },
    privateRoom: {
      type: Boolean,
      default: true
    },
  },
}, { timestamps: true })

module.exports = mongoose.model('GameSession', GameSessionSchema)
