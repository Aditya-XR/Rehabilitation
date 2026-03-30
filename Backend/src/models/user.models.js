import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Password is only required if googleId is NOT present
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      select: false, // Prevents password from being returned in API calls by default
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true, 
  }
);

/**
 * Pre-save middleware to hash password before saving to DB
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to check if password is correct
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        //payload
        {
            _id : this._id
        },
        //secret
        process.env.ACCESS_TOKEN_SECRET,
        //options
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY || "1d"
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        //payload
        {
            _id : this._id
        },
        //secret
        process.env.REFRESH_TOKEN_SECRET,
        //options
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY || "1h"
        }
    )
}

const User = mongoose.model('User', userSchema);

export default User;