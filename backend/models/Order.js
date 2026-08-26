import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  qty: Number,
  image: String,
});

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    date: { type: String },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    packagingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payment: { type: String, default: "Cash on Delivery" },
    transactionId: { type: String, default: null },
    address: { type: String, required: true },
    customer: {
      fullName: { type: String },
      mobile: { type: String },
    },
    userMobile: { type: String },
    status: { type: String, default: "Pending" },
    deliveryMessage: { type: String, default: "Pending Admin Confirmation" },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
