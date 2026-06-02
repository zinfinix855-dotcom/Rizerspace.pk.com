const { z } = require("zod");

// Auth schemas
const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long").max(100),
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

// Order schemas
const shippingAddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State / Province is required"),
  zip: z.string().min(1, "Zip / Postal Code is required"),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean().optional()
});

const billingAddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State / Province is required"),
  zip: z.string().min(1, "Zip / Postal Code is required"),
  country: z.string().min(1, "Country is required")
}).optional();

const customerInfoSchema = z.object({
  fullName: z.string().min(2, "Full Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(5, "Valid Phone Number is required")
});

const orderProductItemSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID format"),
  variantId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid variant ID format").optional(),
  quantity: z.number().int().positive("Quantity must be a positive integer")
});

const placeOrderSchema = z.object({
  products: z.array(orderProductItemSchema).min(1, "Order must contain at least one product"),
  customerInfo: customerInfoSchema,
  shippingAddress: shippingAddressSchema,
  billingAddress: billingAddressSchema.optional(),
  sameAsShipping: z.boolean().default(true),
  orderNotes: z.string().max(500, "Order notes cannot exceed 500 characters").optional(),
  paymentMethod: z.enum(["Stripe", "PayPal", "JazzCash", "EasyPaisa", "COD", "Bank Transfer"]),
  couponCode: z.string().optional()
}).superRefine((data, ctx) => {
  if (!data.sameAsShipping && !data.billingAddress) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Billing address is required when it is not the same as shipping",
      path: ["billingAddress"]
    });
  }
});

// Marketplace listing schema
const createListingSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID format"),
  price: z.number().positive("Price must be greater than zero"),
  condition: z.enum(["MISB", "MIB", "Loose"]),
  description: z.string().optional(),
  images: z.array(z.string().url("Invalid image URL")).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  placeOrderSchema,
  createListingSchema
};
