// 1. 商品资料。价格用“分”保存，避免小数计算误差。
const products = {
    bowl: { name: 'Premium Dog Bowl', price: 2999, image: 'dog-bowl.jpg' },
    bed: { name: 'Cozy Cat Bed', price: 4999, image: 'cat-bed.svg' },
    bag: { name: 'Pet Travel Bag', price: 3999, image: 'travel-bag.svg' }
};
const storageKey = 'pawora-cart-v1';
const drawer = document.getElementById('cart-drawer');
const cartItems = document.getElementById('cart-items');
let cart = loadCart();
let toastTimer;

function money(cents) {
    return '$' + (cents / 100).toFixed(2);
}

// 2. 仅保存商品 ID 和数量。读取时检查内容，损坏的数据不会让页面崩溃。
function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (!Array.isArray(saved)) return [];
        const valid = [];
        for (const item of saved) {
            if (!item || !Object.hasOwn(products, item.id)) continue;
            if (!Number.isInteger(item.quantity) || item.quantity < 1) continue;
            if (valid.some(existing => existing.id === item.id)) continue;
            valid.push({ id: item.id, quantity: Math.min(item.quantity, 99) });
        }
        return valid;
    } catch {
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {
        // 浏览器禁用存储时，本次访问仍然可以正常使用购物车。
    }
}

function announce(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => status.classList.remove('visible'), 2600);
}

// 3. 修改数据后统一更新显示，数量和总价始终来自同一份 cart。
function addToCart(id) {
    const item = cart.find(item => item.id === id);
    if (item && item.quantity >= 99) {
        announce('Maximum quantity is 99 per item.');
        return;
    }
    if (item) item.quantity += 1;
    else cart.push({ id, quantity: 1 });
    updateCartDisplay();
    announce(products[id].name + ' added to your bag.');
}

function changeQuantity(id, amount) {
    const item = cart.find(item => item.id === id);
    if (!item) return;
    item.quantity = Math.min(99, item.quantity + amount);
    if (item.quantity <= 0) cart = cart.filter(item => item.id !== id);
    updateCartDisplay();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartDisplay();
}

function updateCartDisplay() {
    let count = 0;
    let total = 0;
    cartItems.innerHTML = '';
    for (const item of cart) {
        const product = products[item.id];
        count += item.quantity;
        total += product.price * item.quantity;
        // 模板内只使用上面固定的商品资料和已验证的数量，不插入用户输入。
        cartItems.innerHTML += `
            <article class="cart-item">
                <img src="${product.image}" alt="">
                <div><h3>${product.name}</h3>
                    <p class="item-price">${money(product.price)} each · ${money(product.price * item.quantity)}</p>
                    <div class="item-controls">
                        <div class="quantity" role="group" aria-label="Quantity for ${product.name}">
                            <button data-action="decrease" data-id="${item.id}" aria-label="Decrease ${product.name} quantity">−</button>
                            <span>${item.quantity}</span>
                            <button data-action="increase" data-id="${item.id}" aria-label="Increase ${product.name} quantity" ${item.quantity === 99 ? 'disabled' : ''}>+</button>
                        </div>
                        <button class="remove-button" data-action="remove" data-id="${item.id}" aria-label="Remove ${product.name}">Remove</button>
                    </div>
                </div>
            </article>`;
    }
    if (!cart.length) {
        cartItems.innerHTML = '<div class="empty-cart"><strong>A little empty, for now.</strong><p>Find something for your favorite companion.</p></div>';
    }
    document.getElementById('cart-count').textContent = count;
    document.getElementById('cart-total').textContent = money(total);
    document.getElementById('checkout').disabled = count === 0;
    document.getElementById('checkout-note').textContent = '';
    saveCart();
}

// 4. dialog 自带键盘焦点限制和 Esc 关闭；额外支持点击遮罩关闭。
function showCart() {
    drawer.showModal();
    document.body.classList.add('cart-open');
}
function closeCart() {
    drawer.close();
}
drawer.addEventListener('close', () => document.body.classList.remove('cart-open'));
drawer.addEventListener('click', event => {
    if (event.target === drawer && event.clientX < drawer.getBoundingClientRect().left) closeCart();
});
document.getElementById('open-cart').addEventListener('click', showCart);
document.getElementById('close-cart').addEventListener('click', closeCart);
document.getElementById('continue-shopping').addEventListener('click', closeCart);

document.querySelectorAll('[data-product]').forEach(button => {
    button.addEventListener('click', () => addToCart(button.dataset.product));
});

// 使用事件委托，重新绘制购物车后按钮仍可用；恢复焦点方便键盘连续加减。
cartItems.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const { id, action } = button.dataset;
    if (action === 'remove') removeFromCart(id);
    if (action === 'increase') changeQuantity(id, 1);
    if (action === 'decrease') changeQuantity(id, -1);
    const next = cartItems.querySelector(`[data-id="${id}"][data-action="${action}"]:not(:disabled)`)
        || cartItems.querySelector('button:not(:disabled)')
        || document.getElementById('continue-shopping');
    next.focus();
});

// Checkout 只显示提示，不发起订单、不收集付款信息。
document.getElementById('checkout').addEventListener('click', () => {
    document.getElementById('checkout-note').textContent = 'Checkout is coming soon. This demo does not place an order or charge you.';
});
updateCartDisplay();
