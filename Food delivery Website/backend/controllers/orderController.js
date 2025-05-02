import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Config variables
const currency = "inr";
const deliveryCharge = 50;
const frontend_URL = 'http://localhost:5173';

// Placing User Order using Stripe
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        if (!address) {
            return res.status(400).json({ success: false, message: "Address is required" });
        }

        const newOrder = new orderModel({ userId, items, amount, address });
        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        const line_items = items.map((item) => ({
            price_data: {
                currency,
                product_data: { name: item.name },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency,
                product_data: { name: "Delivery Charge" },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error processing order" });
    }
};

// Placing User Order using COD
const placeOrderCod = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        if (!address) {
            return res.status(400).json({ success: false, message: "Address is required" });
        }

        const newOrder = new orderModel({ userId, items, amount, address, payment: true });
        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error placing order" });
    }
};

// Listing Orders for Admin Panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// User Orders for Frontend
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching user orders" });
    }
};

// Updating Order Status
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Status Updated Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error updating status" });
    }
};

// Verifying Order Payment Status
const verifyOrder = async (req, res) => {
    try {
        const { orderId, success } = req.body;
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Payment Verified" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment Failed, Order Deleted" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error verifying payment" });
    }
};

export { placeOrder, listOrders, userOrders, updateStatus, verifyOrder, placeOrderCod };
