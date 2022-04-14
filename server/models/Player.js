const mongoose = require('mongoose');
const _ = require('underscore');

let PlayerModel = {};

const setName = (name) => _.escape(name).trim();
//const setFavThing = (thing) => _.escape(thing).trim();

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  color: {
    type: String,
    required: true,
    trim: true,
  },
  items:{
    type: Array,
    required: false,
    default: [false, false, false, false],
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

PlayerSchema.statics.toApi = (doc) => ({
  name: doc.name,
  color: doc.color,
  items: doc.items,
});

DomoSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    // Convert the string ownerId to an object id
    owner: mongoose.Types.ObjectId(ownerId),
  };
  return DomoModel.find(search).select('name color items').lean().exec(callback);
};

PlayerModel = mongoose.model('Player', PlayerSchema);

module.exports = PlayerModel;
