document.addEventListener('DOMContentLoaded', () => {
    const listaProductos = document.getElementById('lista-productos');
    const listaCarrito = document.getElementById('lista-carrito');
    const totalCarrito = document.getElementById('total-carrito');
    const carritoModal = document.getElementById('carrito-modal');
    const cantidadCarrito = document.getElementById('cantidad-carrito');
    const destacadosContainer = document.querySelector('#destacados .card-container');
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Mostrar el modal del carrito
    document.getElementById('mostrar-carrito').onclick = () => {
        if (carrito.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Carrito vacío',
                text: '¡Tu carrito de compras está vacío!',
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            carritoModal.style.display = 'block';
            actualizarCarrito();
        }
    };

    // Cerrar el modal del carrito
    document.getElementById('cerrar-carrito').onclick = () => {
        carritoModal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == carritoModal) {
            carritoModal.style.display = 'none';
        }
    };

    // Fetch de la API para obtener cócteles
    fetch('https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=Cocktail')
        .then(response => response.json())
        .then(data => {
            const drinks = data.drinks;
            mostrarDestacados(drinks);
            mostrarProductos(drinks);
        });

    function mostrarDestacados(drinks) {
        // Seleccionar 3 productos aleatorios
        const destacados = [];
        while (destacados.length < 3 && drinks.length > 0) {
            const randomIndex = Math.floor(Math.random() * drinks.length);
            const [selectedDrink] = drinks.splice(randomIndex, 1); // Extrae el elemento
            destacados.push(selectedDrink);
        }
    }

    function mostrarProductos(drinks) {
        // Mostrar todos los productos restantes
        drinks.forEach(drink => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
                <h3>${drink.strDrink}</h3>
                <p>Precio: $10.00</p> <!-- Precio simulado -->
                <button class="agregar-carrito">Agregar al Carrito</button>
            `;
            card.querySelector('.agregar-carrito').onclick = () => agregarAlCarrito(drink);
            listaProductos.appendChild(card);
        });
    }

    function agregarAlCarrito(drink) {
        const productoExistente = carrito.find(item => item.id === drink.idDrink);

        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            carrito.push({
                id: drink.idDrink,
                nombre: drink.strDrink,
                precio: 10.00,
                cantidad: 1,
                imagen: drink.strDrinkThumb
            });
        }

        actualizarCarrito();
        guardarCarrito();
        Swal.fire({
            icon: 'success',
            title: 'Agregado',
            text: 'Producto agregado al carrito!',
            showConfirmButton: false,
            timer: 1000
        });
    }

    function actualizarCarrito() {
        listaCarrito.innerHTML = '';
        let total = 0;
        carrito.forEach((producto, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 50px;">
                <div class="carrito-info">
                    <span>${producto.nombre}</span>
                    <span>Cantidad: ${producto.cantidad}</span>
                    <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
                </div>
            `;
            listaCarrito.appendChild(li);
            total += producto.precio * producto.cantidad;
        });
        totalCarrito.textContent = total.toFixed(2);
        cantidadCarrito.textContent = carrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    }

    window.eliminarDelCarrito = function(index) {
        carrito[index].cantidad -= 1;
        if (carrito[index].cantidad === 0) {
            carrito.splice(index, 1);
        }
        actualizarCarrito();
        guardarCarrito();
    };

    function guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    document.getElementById('vaciar-carrito').onclick = () => {
        carrito = [];
        actualizarCarrito();
        guardarCarrito();
        Swal.fire({
            icon: 'success',
            title: 'Carrito vaciado',
            text: '¡Has vaciado tu carrito!',
            showConfirmButton: false,
            timer: 1500
        });
    };

    document.getElementById('comprar').onclick = () => {
        if (carrito.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Carrito vacío',
                text: '¡Tu carrito está vacío! Agrega productos antes de comprar.',
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            // Mostrar mensaje de confirmación de compra usando SweetAlert2
            Swal.fire({
                icon: 'success',
                title: 'Compra realizada',
                text: '¡Gracias por tu compra!',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                // Vaciamos el carrito después de la compra
                carrito = [];
                guardarCarrito();
                actualizarCarrito();
            });
        }
    };

    actualizarCarrito();
});
