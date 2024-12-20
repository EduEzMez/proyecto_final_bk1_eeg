const express = require('express');
const Cart = require('../models/cart.model'); // Importá el modelo de carrito (crealo si no existe aún)
const Product = require('../models/product.model'); // Modelo de productos

const router = express.Router();

 //Ruta para obtener el carrito
router.get('/', async (req, res) => {
    try {
        let cart = await Cart.findOne().populate({
            path: 'products.product',
             model: 'Product' // Asegúrate de que el modelo de productos esté correctamente referenciado
        });
        if (!cart) {
             cart = new Cart({ products: [] }); // Si no existe, crear un carrito vacío
            await cart.save();
        }

        console.log('Carrito actual:', cart);
        res.render('cart', { cart: cart.toObject() }); // Renderiza la vista "cart" y pasa el carrito
    } catch (error) {
            console.error('Error al obtener el carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});




router.get('/add/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        let cart = await Cart.findOne();
        if (!cart) {
            cart = new Cart({ products: [] });
        }

        // Verificar si el producto ya está en el carrito
        const productIndex = cart.products.findIndex(item => item.product.toString() === product._id.toString());

        if (productIndex === -1) {
            cart.products.push({ product: product._id, quantity: 1 });
        } else {
            cart.products[productIndex].quantity += 1; // Si ya está, solo aumentamos la cantidad
        }

        // Guardar el carrito y depurar
        await cart.save();
        console.log('Carrito actualizado:', cart);

        res.redirect('/'); // Redirigir al carrito con el producto agregado
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).send('Error interno del servidor');
    }
});



  


router.post('/add/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        let cart = await Cart.findOne();
        if (!cart) {
            cart = new Cart({ products: [] });
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === product._id.toString());
        if (productIndex === -1) {
            cart.products.push({ product: product._id, quantity: 1,totalPrice: product.price });
        } else {
            cart.products[productIndex].quantity += 1;
        }

        await cart.save();
        res.redirect('/api/cart'); // Redirigir al carrito con el producto agregado
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Ruta para eliminar un producto del carrito
router.post('/remove/:id', async (req, res) => {
    try {
        const { id } = req.params; // ID del producto a eliminar
        
        // Buscar el carrito
        let cart = await Cart.findOne();
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        // Buscar el índice del producto en el carrito
        const productIndex = cart.products.findIndex(item => item.product.toString() === id);

        if (productIndex === -1) {
            return res.status(404).send('Producto no encontrado en el carrito');
        }

        // Eliminar el producto
        cart.products.splice(productIndex, 1);

        // Guardar los cambios en el carrito
        await cart.save();
        
        // Redirigir al carrito actualizado
        res.redirect('/api/cart'); // O redirigir a la vista del carrito si lo deseas
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).send('Error interno del servidor');
    }
});






module.exports = router;
