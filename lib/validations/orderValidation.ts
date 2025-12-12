// lib/validations/orderValidation.ts
import { z } from 'zod';

// Pincode validation - exactly 6 digits
const pincodeSchema = z
    .string()
    .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits')
    .refine((val) => parseInt(val) >= 100000 && parseInt(val) <= 999999, {
        message: 'Invalid pincode',
    });

// Weight validation - 10g to 50000g (50kg)
const weightSchema = z
    .number()
    .min(10, 'Minimum weight is 10 grams')
    .max(50000, 'Maximum weight is 50,000 grams (50 kg)');

// Phone validation - 10 digits
const phoneSchema = z
    .string()
    .regex(/^\d{10}$/, 'Phone must be exactly 10 digits');

// Create order validation schema
export const createOrderSchema = z.object({
    // Pickup address (selected from merchant addresses)
    pickup_address_id: z
        .string()
        .min(1, 'Please select a pickup address'),

    // Delivery address fields
    delivery_name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name too long'),

    delivery_phone: phoneSchema,

    delivery_address_line1: z
        .string()
        .min(5, 'Address must be at least 5 characters')
        .max(200, 'Address too long'),

    delivery_address_line2: z
        .string()
        .max(200, 'Address too long')
        .optional(),

    delivery_city: z
        .string()
        .min(2, 'City name required')
        .max(100, 'City name too long'),

    delivery_state: z
        .string()
        .min(2, 'State name required')
        .max(100, 'State name too long'),

    delivery_pincode: pincodeSchema,

    // Order details
    weight: weightSchema,

    invoice_amount: z
        .number()
        .min(0.01, 'Amount must be greater than 0')
        .max(1000000, 'Amount too high'),

    payment_type: z.enum(['prepaid', 'cod'], {
        message: 'Select payment type',
    }),

    // Items (at least one)
    items: z
        .array(
            z.object({
                name: z.string().min(1, 'Item name required'),
                quantity: z.number().min(1, 'Quantity must be at least 1'),
                price: z.number().min(0, 'Price must be 0 or more'),
            })
        )
        .min(1, 'At least one item required'),

    // Optional dimensions
    dimensions: z
        .object({
            length: z.number().positive('Length must be positive').optional(),
            breadth: z.number().positive('Breadth must be positive').optional(),
            height: z.number().positive('Height must be positive').optional(),
        })
        .optional(),
});

export type CreateOrderFormData = z.infer<typeof createOrderSchema>;

// Helper function to validate pincode only
export const validatePincode = (pincode: string): boolean => {
    return pincodeSchema.safeParse(pincode).success;
};

// Helper function to validate weight only
export const validateWeight = (weight: number): boolean => {
    return weightSchema.safeParse(weight).success;
};
