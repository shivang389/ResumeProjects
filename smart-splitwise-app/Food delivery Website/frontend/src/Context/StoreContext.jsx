import { createContext, useEffect, useState } from "react";
import { food_list, menu_list } from "../assets/assets";
import axios from "axios";
export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const url = "http://localhost:4000";
    const [food_list, setFoodList] = useState([]);
    const [cartItems, setCartItems] = useState({});  // Initialize as an empty object to avoid undefined errors
    const [token, setToken] = useState("");
    const currency = "₹";
    const deliveryCharge = 50;

    // Add item to the cart
    const addToCart = async (itemId) => {
        setCartItems((prev) => {
            // Ensure cartItems is never undefined and handle the addition
            const updatedCart = { ...prev };
            if (!updatedCart[itemId]) {
                updatedCart[itemId] = 1;
            } else {
                updatedCart[itemId] += 1;
            }
            return updatedCart;
        });

        // Make API call to update the cart on the server
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
        }
    };

    // Remove item from the cart
    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            // Handle case where item count is 1 or more
            const updatedCart = { ...prev };
            if (updatedCart[itemId] > 1) {
                updatedCart[itemId] -= 1;
            } else {
                delete updatedCart[itemId];  // Remove the item if its quantity is 0
            }
            return updatedCart;
        });

        // Make API call to remove the item from the cart on the server
        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
        }
    };

    // Get total amount for the cart
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            try {
                if (cartItems[item] > 0) {
                    const itemInfo = food_list.find((product) => product._id === item);
                    if (itemInfo) {
                        totalAmount += itemInfo.price * cartItems[item];
                    }
                }
            } catch (error) {
                console.error("Error calculating total:", error);
            }
        }
        return totalAmount;
    };

    // Fetch the food list from the API
    const fetchFoodList = async () => {
        try {
            const response = await axios.get(url + "/api/food/list");
            setFoodList(response.data.data);
        } catch (error) {
            console.error("Error fetching food list:", error);
        }
    };

    // Load the cart data from the server
    const loadCartData = async (token) => {
        try {
            const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
            setCartItems(response.data.cartData || {});  // Ensure cartItems is set to an empty object if not available
        } catch (error) {
            console.error("Error loading cart data:", error);
        }
    };

    // Load the food list and cart data when the component mounts
    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            if (localStorage.getItem("token")) {
                const storedToken = localStorage.getItem("token");
                setToken(storedToken);
                await loadCartData(storedToken);
            }
        }
        loadData();
    }, []);

    // Provide the context to children components
    const contextValue = {
        url,
        food_list,
        menu_list,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        token,
        setToken,
        loadCartData,
        setCartItems,
        currency,
        deliveryCharge,
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
