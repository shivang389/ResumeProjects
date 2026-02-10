import React, { useContext, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';

const FoodItem = ({ image = '', name = 'Unknown', price = 0, desc = 'No description available', id }) => {
    const [itemCount, setItemCount] = useState(0);
    const { cartItems = {}, addToCart, removeFromCart, url = '', currency = '$' } = useContext(StoreContext);

    // Ensure the image URL is valid
    const imageUrl = image ? `${url}/images/${image}` : '/default-food-image.jpg';

    return (
        <div className='food-item'>
            <div className='food-item-img-container'>
                <img className='food-item-image' src={imageUrl} alt={name} onError={(e) => e.target.src = '/default-food-image.jpg'} />
                
                {!cartItems[id] ? (
                    <img 
                        className='add' 
                        onClick={() => id && addToCart(id)} 
                        src={assets.add_icon_white} 
                        alt="Add to cart" 
                    />
                ) : (
                    <div className="food-item-counter">
                        <img 
                            src={assets.remove_icon_red} 
                            onClick={() => id && removeFromCart(id)} 
                            alt="Remove one item" 
                        />
                        <p>{cartItems[id]}</p>
                        <img 
                            src={assets.add_icon_green} 
                            onClick={() => id && addToCart(id)} 
                            alt="Add one more item" 
                        />
                    </div>
                )}
            </div>
            <div className="food-item-info">
                <div className="food-item-name-rating">
                    <p>{name}</p>
                    <img src={assets.rating_starts} alt="Rating stars" />
                </div>
                <p className="food-item-desc">{desc}</p>
                <p className="food-item-price">{currency}{price.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default FoodItem;
