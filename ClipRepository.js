"use strict";

class ClipRepository {

  constructor (datastore) {
    this._datastore = datastore || require('./ClipDatastore.js');
  }

  createClip (clip) {
    return new Promise ((res, rej) => {
      this._datastore.insert(clip, (e, clip) => {
        if(e) rej(e)
        else res(clip._id);
      });
    });
  }

  getClip (id) {

    return new Promise((res, rej) => {
      this._datastore.findOne({_id: id}, function(e, clip) {
        if(e) rej(e)
        else res(clip);
      });
    });

  }

  updateClip () {

  }

}

module.exports = ClipRepository;