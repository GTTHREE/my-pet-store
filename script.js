    let cartCount = 0;
    let cart = [];

    function addToCart(productName, price) {
    cartCount = cartCount + 1;

    cart.push({
    name: productName,
    price: price
    });

    document.getElementById("cart-count").textContent = cartCount;

    console.log(productName);
    console.log(price);
    }
    function showCart() {
    let message = "Your Cart:\n\n";
    let total = 0;

    for (let item of cart) {
        message = message + item.name + " - $" + item.price + "\n";
        total = total + item.price;
    }

    message = message + "\nTotal: $" + total.toFixed(2);

    alert(message);
    }
    
