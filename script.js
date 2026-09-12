 let cartCount = 0;
 let cart = [];

function addToCart(productName, price) {
    cartCount = cartCount + 1;

    cart.push({
        name: productName,
        price: price
    });

    document.getElementById("cart-count").textContent = cartCount;
}

function showCart() {
    document.getElementById("cart-drawer").classList.add("open");
    updateCartDisplay();
}

function closeCart() {
    document.getElementById("cart-drawer").classList.remove("open");
}

function updateCartDisplay() {
    let cartItems = document.getElementById("cart-items");
    let cartTotal = document.getElementById("cart-total");

    cartItems.innerHTML = "";

    let total = 0;

    for (let item of cart) {
        cartItems.innerHTML += `
            <p>${item.name} - $${item.price.toFixed(2)}</p>
        `;

        total = total + item.price;
    }

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    }

    cartTotal.textContent = total.toFixed(2);
}
