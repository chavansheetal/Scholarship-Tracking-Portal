const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Ensure db directory exists
const dbDir = path.join(__dirname, 'db_json');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

function getFilePath(modelName) {
  return path.join(dbDir, `${modelName.toLowerCase()}s.json`);
}

function readData(modelName) {
  const filePath = getFilePath(modelName);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeData(modelName, data) {
  const filePath = getFilePath(modelName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Global flag
let isMockActive = false;

function activateMockMode() {
  if (isMockActive) return;
  isMockActive = true;

  // Helper to match mongo queries
  function matches(doc, query) {
    if (!query) return true;
    
    // Handle $or
    if (query.$or && Array.isArray(query.$or)) {
      return query.$or.some(q => matches(doc, q));
    }
    // Handle $and
    if (query.$and && Array.isArray(query.$and)) {
      return query.$and.every(q => matches(doc, q));
    }

    for (let key in query) {
      if (key.startsWith('$')) continue;
      
      let val = query[key];
      
      // Handle nested keys like "personalDetails.aadhaar"
      let docVal = doc;
      const parts = key.split('.');
      for (let part of parts) {
        docVal = docVal ? docVal[part] : undefined;
      }

      // Handle operators like $ne
      if (val && typeof val === 'object') {
        if ('$ne' in val) {
          if (docVal === val.$ne) return false;
          continue;
        }
      }

      if (docVal !== val) {
        // loose equality for numbers/strings (e.g. Aadhaar checks)
        if (String(docVal) !== String(val)) return false;
      }
    }
    return true;
  }

  // Override Model.find
  mongoose.Model.find = async function(query) {
    const data = readData(this.modelName);
    return data.filter(doc => matches(doc, query));
  };

  // Override Model.findOne
  mongoose.Model.findOne = async function(query) {
    const data = readData(this.modelName);
    const found = data.find(doc => matches(doc, query));
    if (!found) return null;
    
    // Return an object that has .save() and can be modified
    const docInstance = new this(found);
    // Bind save method
    docInstance.save = async function() {
      const all = readData(this.constructor.modelName);
      const idx = all.findIndex(d => d.id === this.id || d.appId === this.appId || d._id === this._id);
      if (idx !== -1) {
        all[idx] = this.toObject();
      } else {
        all.push(this.toObject());
      }
      writeData(this.constructor.modelName, all);
      return this;
    };
    return docInstance;
  };

  // Override Model.findOneAndUpdate
  mongoose.Model.findOneAndUpdate = async function(query, update, options = {}) {
    const data = readData(this.modelName);
    const idx = data.findIndex(doc => matches(doc, query));
    if (idx === -1) return null;

    let updatedDoc = { ...data[idx] };
    const setUpdate = update.$set || update;
    
    // Apply updates
    for (let key in setUpdate) {
      const parts = key.split('.');
      let target = updatedDoc;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!target[parts[i]]) target[parts[i]] = {};
        target = target[parts[i]];
      }
      target[parts[parts.length - 1]] = setUpdate[key];
    }

    data[idx] = updatedDoc;
    writeData(this.modelName, data);
    return new this(updatedDoc);
  };

  // Override Model.findOneAndDelete
  mongoose.Model.findOneAndDelete = async function(query) {
    const data = readData(this.modelName);
    const idx = data.findIndex(doc => matches(doc, query));
    if (idx === -1) return null;
    const removed = data.splice(idx, 1)[0];
    writeData(this.modelName, data);
    return new this(removed);
  };

  // Override Model.countDocuments
  mongoose.Model.countDocuments = async function(query) {
    const data = readData(this.modelName);
    return data.filter(doc => matches(doc, query)).length;
  };

  // Override Model.updateMany
  mongoose.Model.updateMany = async function(query, update) {
    const data = readData(this.modelName);
    let matchedCount = 0;
    const setUpdate = update.$set || update;

    data.forEach((doc, idx) => {
      if (matches(doc, query)) {
        matchedCount++;
        let updatedDoc = { ...doc };
        for (let key in setUpdate) {
          const parts = key.split('.');
          let target = updatedDoc;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!target[parts[i]]) target[parts[i]] = {};
            target = target[parts[i]];
          }
          target[parts[parts.length - 1]] = setUpdate[key];
        }
        data[idx] = updatedDoc;
      }
    });

    if (matchedCount > 0) {
      writeData(this.modelName, data);
    }
    return { matchedCount, modifiedCount: matchedCount };
  };

  // Override save on new documents
  mongoose.Model.prototype.save = async function() {
    const modelName = this.constructor.modelName;
    const all = readData(modelName);
    const obj = this.toObject();
    if (!obj._id) obj._id = new mongoose.Types.ObjectId().toString();
    
    const idx = all.findIndex(d => (obj.id && d.id === obj.id) || (obj.appId && d.appId === obj.appId) || d._id === obj._id);
    if (idx !== -1) {
      all[idx] = obj;
    } else {
      all.push(obj);
    }
    writeData(modelName, all);
    return this;
  };
}

module.exports = {
  activateMockMode,
  isMockActive: () => isMockActive
};
