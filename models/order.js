const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: true,
            trim: true
        },
        customerPhone: {
            type: String,
            required: true,
            trim: true
        },
        deliveryAddress: {
            type: String,
            required: true,
            trim: true
        },
        items: [
            {
                foodId: {
                    type: Number,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                }
            }
        ],
        total: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Delivered", "Cancelled"],
            default: "Pending"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);