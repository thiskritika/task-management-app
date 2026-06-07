const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Alternative: Without using next parameter
userSchema.pre('save', function() {
  const user = this;
  
  if (!user.isModified('password')) {
    return Promise.resolve();
  }
  
  return bcrypt.genSalt(10)
    .then(salt => bcrypt.hash(user.password, salt))
    .then(hashedPassword => {
      user.password = hashedPassword;
    })
    .catch(error => {
      throw error;
    });
});

// Compare method
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);