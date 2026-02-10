import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems = {}, food_list = [], removeFromCart, getTotalCartAmount, url = '', currency = '$', deliveryCharge = 0 } = useContext(StoreContext);
  const navigate = useNavigate();

  // Ensure cartItems is not empty and food_list is available
  const cartItemsArray = food_list.filter(item => cartItems[item._id] > 0);

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p> <p>Title</p> <p>Price</p> <p>Quantity</p> <p>Total</p> <p>Remove</p>
        </div>
        <br />
        <hr />
        {/* Render cart items */}
        {cartItemsArray.length > 0 ? (
          cartItemsArray.map((item, index) => (
            <div key={index}>
              <div className="cart-items-title cart-items-item">
                <img src={url + "/images/" + item.image} alt={item.name || 'Food Item'} />
                <p>{item.name || 'Item Name'}</p>
                <p>{currency}{item.price || 0}</p>
                <div>{cartItems[item._id]}</div>
                <p>{currency}{(item.price || 0) * cartItems[item._id]}</p>
                <p className="cart-items-remove-icon" onClick={() => removeFromCart(item._id)}>x</p>
              </div>
              <hr />
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p><p>{currency}{getTotalCartAmount() || 0}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p><p>{currency}{getTotalCartAmount() === 0 ? 0 : deliveryCharge}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b><b>{currency}{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + deliveryCharge}</b>
            </div>
          </div>
          <button onClick={() => navigate('/order')}>PROCEED TO CHECKOUT</button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="promo code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
