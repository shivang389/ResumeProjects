import { useEffect, useState } from 'react'
import './Orders.css'
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets, url, currency } from '../../assets/assets';

const Order = () => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        setOrders(response.data.data.reverse());
      } else {
        toast.error("Error fetching orders");
      }
    } catch (error) {
      toast.error("Network error while fetching orders");
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: event.target.value
      });
      if (response.data.success) {
        await fetchAllOrders();
        toast.success("Order status updated");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Network error while updating status");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className='order add'>
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => {
          const safeAddress = order.address || {}; // Prevents undefined errors

          return (
            <div key={index} className='order-item'>
              <img src={assets.parcel_icon} alt="Parcel Icon" />
              <div>
                <p className='order-item-food'>
                  {order.items.map((item, idx) => (
                    <span key={idx}>
                      {item.name} x {item.quantity}
                      {idx < order.items.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
                <p className='order-item-name'>
                  {safeAddress.firstName ? `${safeAddress.firstName} ${safeAddress.lastName}` : "No Name Provided"}
                </p>
                <div className='order-item-address'>
                  <p>{safeAddress.street ? `${safeAddress.street},` : "No Street"}</p>
                  <p>{safeAddress.city ? `${safeAddress.city}, ${safeAddress.state}, ${safeAddress.country}, ${safeAddress.zipcode}` : "No Address Provided"}</p>
                </div>
                <p className='order-item-phone'>
                  {safeAddress.phone || "No Phone Number"}
                </p>
              </div>
              <p>Items: {order.items.length}</p>
              <p>{currency}{order.amount}</p>
              <select onChange={(e) => statusHandler(e, order._id)} value={order.status}>
                <option value="Food Processing">Food Processing</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Order;
