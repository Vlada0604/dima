document.addEventListener('DOMContentLoaded', () => {
    // Елементи DOM для Кошика (Модального вікна та Навігації)
    const cartModal = document.getElementById('cart-modal');
    const viewCartButton = document.getElementById('view-cart-button');
    const closeModalButton = document.querySelector('.close-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');
    const cartCountNav = document.getElementById('cart-count-nav');
    
    // 1. Ініціалізація та завантаження кошика з LocalStorage
    // LocalStorage дозволяє зберігати дані кошика між різними сторінками
    let cart = JSON.parse(localStorage.getItem('appleCart')) || [];

    // Оновлює відображення кошика (в модальному вікні) та лічильника в навігації
    function updateCartUI() {
        // Перевірка на наявність усіх елементів (вони можуть бути відсутні на простих сторінках)
        if (!cartItemsContainer || !cartTotalElement || !checkoutButton || !cartCountNav) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Кошик порожній.</p>';
            checkoutButton.disabled = true;
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                totalItems += item.quantity;

                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        ${item.name} (${item.quantity} шт.) 
                    </div>
                    <span>${itemTotal.toLocaleString('uk-UA')} грн</span>
                    <button class="remove-from-cart" data-id="${item.id}">Видалити 🗑️</button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
            checkoutButton.disabled = false;
        }

        cartTotalElement.textContent = total.toLocaleString('uk-UA');
        cartCountNav.textContent = totalItems;
        
        // Зберігаємо оновлений кошик
        localStorage.setItem('appleCart', JSON.stringify(cart));
    }

    // 2. Функція додавання товару
    function addToCart(productId) {
        // Отримуємо дані про товар безпосередньо з HTML-розмітки на поточній сторінці
        const productElement = document.querySelector(`.product[data-product-id="${productId}"]`);
        if (!productElement) {
             // Якщо товару немає на поточній сторінці (наприклад, додається ходовий товар з index.html),
             // ми не можемо отримати його дані. У реальному проекті тут була б база даних.
             // Для цілей цього прикладу, якщо не знайдено, просто повертаємось.
             console.error(`Product data for ID ${productId} not found on this page.`);
             return;
        }

        const name = productElement.dataset.name;
        const price = parseInt(productElement.dataset.price);

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id: productId, name: name, price: price, quantity: 1 });
        }

        updateCartUI();
        // Використовуємо alert лише для демонстрації, у реальному проекті краще спливаюче повідомлення
        alert(`"${name}" додано до кошика!`);
    }

    // 3. Функція видалення товару
    function removeFromCart(productId) {
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            // Зменшуємо кількість на 1 або видаляємо, якщо кількість 1
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                cart.splice(itemIndex, 1);
            }
        }
        updateCartUI();
    }

    // 4. Оформлення замовлення
    function checkout() {
        if (cart.length === 0) {
            alert('Кошик порожній. Додайте товари для оформлення.');
            return;
        }
        
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        alert(`🎉 Замовлення оформлено! 
        Загальна сума: ${total.toLocaleString('uk-UA')} грн.
        Ми зв'яжемося з вами найближчим часом для підтвердження.`);
        
        // Очищення кошика після оформлення
        cart = [];
        updateCartUI();
        cartModal.style.display = 'none'; // Закрити модальне вікно
    }

    // 5. Обробники подій
    
    // Делегування подій для кнопок "Додати в кошик" (працює на всіх сторінках)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = e.target.dataset.id;
            addToCart(productId);
        }
    });

    // Делегування подій для кнопок "Видалити" (працює в модальному вікні)
    if(cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-from-cart')) {
                const productId = e.target.dataset.id;
                removeFromCart(productId);
            }
        });
    }

    // Кнопка "Оформити замовлення"
    if (checkoutButton) {
        checkoutButton.addEventListener('click', checkout);
    }

    // Управління модальним вікном кошика
    if (viewCartButton) {
        viewCartButton.addEventListener('click', () => {
            updateCartUI();
            cartModal.style.display = 'block';
        });
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });
    }

    // Закриття модального вікна по кліку поза ним
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Ініціалізація UI при завантаженні сторінки
    updateCartUI();
});
