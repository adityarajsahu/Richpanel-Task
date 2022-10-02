const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name cannot be blank']
    },
    email: {
        type: String,
        required: [true, 'Email cannot be blank']
    }, 
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    }
})

userSchema.statics.findAndValidate = async function (email, password) {
    const foundUser = await this.findOne({ email });
    const isValid = await bcrypt.compare(password, foundUser.password);
    return isValid ? foundUser : false;
}

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

module.exports = mongoose.model('User', userSchema);