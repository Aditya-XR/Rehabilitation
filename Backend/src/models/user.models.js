import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { USER_ROLES } from "../constants.js";

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
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationExpiry: {
      type: Date,
      default: null,
      select: false,
    },
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      default: null,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
  },
  {
    timestamps: true, 
  }
);

userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

/**
 * Pre-save middleware to hash password before saving to DB
 */
userSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return;

  if (!this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance method to check if password is correct
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }

  return await bcrypt.compare(candidatePassword, this.password);
};


userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        //payload
        {
            _id : this._id,
            role: this.role
        },
        //secret
        env.auth.accessTokenSecret,
        //options
        {
            expiresIn: env.auth.accessTokenExpiry
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
        env.auth.refreshTokenSecret,
        //options
        {
            expiresIn: env.auth.refreshTokenExpiry
        }
    )
}

userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    googleId: this.googleId,
    avatar: this.avatar,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
