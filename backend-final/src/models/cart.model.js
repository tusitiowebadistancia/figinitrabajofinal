import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1
      }
    }
  ]
});

const Cart = mongoose.model("carts", cartSchema);

export default Cart;