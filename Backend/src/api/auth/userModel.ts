import mongoose, { Document, Schema, SchemaTypeOptions } from "mongoose";
import bcrypt from "bcrypt";

export interface UserDocument extends Document {
  name: string;
  email: string;
  username: string;
  password: string;
  department?: string;
  role: string;
  plantCode?: string;
  userType: "user" | "supplier";
  supplierCode?: string;
  isPaid?: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePasswords(value: string): Promise<boolean>;
}
const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: true,
    },
    plantCode: {
      type: String,
      required: false,
    },
    userType: {
      type: String,
      enum: ["user", "supplier"],
      default: "user",
      required: true,
    },
    supplierCode: ({
      type: String,
      required: false,
      unique: true,
      sparse: true, // Allows null values to be non-unique
      validate: {
        validator: function(this: UserDocument, value: string) {
          // Only required if userType is supplier
          if (this.userType === "supplier") {
            return !!(value && value.trim().length > 0);
          }
          return true;
        },
        message: "Supplier code is required for supplier accounts",
      },
    } as SchemaTypeOptions<string>),
    isPaid: {
      type: Boolean,
      default: false,
      required: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {},
  },
);

// hash password before save to db
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

userSchema.methods.comparePasswords = async function (value: string) {
  return await bcrypt.compare(value, this.password);
};

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete (ret as any).password;
    return ret;
  },
});

// Create indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ supplierCode: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ createdAt: -1 });

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
