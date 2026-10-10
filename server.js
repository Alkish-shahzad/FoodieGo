
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const Order = require("./models/Order");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend files
app.use(express.static(path.join(__dirname, "public")));

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Backend status
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "FoodieGo backend is running!"
    });
});

// Temporary test route
app.get("/api/test-check", (req, res) => {
    res.type("text").send("FoodieGo UPDATED SERVER is working!");
});

// Database status
app.get("/api/db-status", (req, res) => {
    const connected = mongoose.connection.readyState === 1;

    res.json({
        success: true,
        connected,
        message: connected
            ? "MongoDB connected!"
            : "MongoDB not connected!"
    });
});

// Place order
app.post("/api/orders", async (req, res) => {
    try {
        const {
            customerName,
            customerPhone,
            deliveryAddress,
            items
        } = req.body || {};

        if (
            typeof customerName !== "string" ||
            !customerName.trim() ||
            typeof customerPhone !== "string" ||
            !customerPhone.trim() ||
            typeof deliveryAddress !== "string" ||
            !deliveryAddress.trim() ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter your name, phone, address and add food to your cart."
            });
        }

        const allowedFoods = {
            1: { name: "Cheese Pizza", price: 850 },
            2: { name: "Classic Burger", price: 550 },
            3: { name: "Chicken Biryani", price: 450 },
            4: { name: "French Fries", price: 300 }
        };

        const validatedItems = items.map((item) => {
            const id = Number(item?.id);
            const quantity = Number(item?.quantity);
            const food = allowedFoods[id];

            if (
                !food ||
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 99
            ) {
                throw new Error("Invalid food item or quantity.");
            }

            return {
                foodId: id,
                name: food.name,
                price: food.price,
                quantity
            };
        });

        const total = validatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const order = await Order.create({
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            deliveryAddress: deliveryAddress.trim(),
            items: validatedItems,
            total
        });

        console.log("Order saved successfully:", order._id);

        return res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            orderId: order._id,
            total: order.total,
            status: order.status
        });
    } catch (error) {
        console.error("Order error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Unable to place order."
        });
    }
});

// Unknown API route
app.use("/api", (req, res) => {
    return res.status(404).json({
        success: false,
        message: `API route not found: ${req.method} ${req.originalUrl}`
    });
});

// Other request errors
app.use((err, req, res, next) => {
    console.error("Request error:", err.message);

    if (res.headersSent) {
        return next(err);
    }

    return res.status(err.status || 500).json({
        success: false,
        message: err.status === 400
            ? "Invalid request data."
            : "Server error. Please try again."
    });
});

// Connect database, then start server
async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI .env file mein nahi mili.");
        }

        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`FoodieGo running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Connection error:", error.message);
    }
}

startServer();
