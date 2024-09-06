import { useState, useEffect, useContext } from "react";
import { userLoginContext } from "../../contexts/userLoginContext";
import { MdDeleteOutline } from "react-icons/md";
import "./Cart.css";

function Cart() {
  let { currentUser } = useContext(userLoginContext);
  let [cart, setCart] = useState([]);

  // Fetch the user's cart
  async function getUserCart() {
    try {
      let res = await fetch(`http://localhost:4000/user-api/cart/${currentUser.username}`);
      let data = await res.json();
      setCart(data.payload.products);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  }

  useEffect(() => {
    if (currentUser.username) {
      getUserCart();
    }
  }, [currentUser.username]);

  // Delete a product from the cart
  async function deleteProduct(productId) {
    try {
      let res = await fetch(`http://localhost:4000/user-cart/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        console.log('product deleted');
        getUserCart(); // Refresh the cart after deletion
      } else {
        console.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  return (
    <div>
      {cart.length === 0 ? (
        <p className="display-1 text-center text-danger">Cart is empty</p>
      ) : (
        <table className="table text-center">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Price</th>
              <th>Brand</th>
              <th>Action</th> {/* Add an action column for the delete button */}
            </tr>
          </thead>
          <tbody>
            {cart.map((cartItem) => (
              <tr key={cartItem.id}>
                <td>{cartItem.id}</td>
                <td>{cartItem.title}</td>
                <td>{cartItem.price}</td>
                <td>{cartItem.brand}</td>
                <td>
                  <button
                    className="btn"
                    onClick={() => deleteProduct(cartItem.id)}
                  >
                    <MdDeleteOutline className="text-danger fs-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Cart;
