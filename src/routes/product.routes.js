const express = require('express');
const Product = require('../models/product.model'); // Importa el modelo

const router = express.Router();


// Ruta para obtener productos y enviarlos a la vista
router.get('/', async (req, res) => {
  try {
    const products = await Product.find(); // Obtener productos desde MongoDB
    res.json(products); // Enviar los productos como JSON
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al obtener productos');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del producto
    const product = await Product.findById(id).lean(); // Buscar el producto
    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }
    res.render('productDetail', { product }); // Renderizar la vista con el detalle
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta para crear un producto
router.post('/', async (req, res) => {
  try {
    const { name, price, code, description, stock } = req.body;

    // Validar los campos requeridos
    if (!name || !price || !description || !stock || !code) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Crear el nuevo producto
    const newProduct = new Product({ name, price, code, description, stock });
    await newProduct.save();

    res.status(201).json({ message: 'Producto creado exitosamente.', product: newProduct });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error al crear el producto.' });
  }
});

// Ruta para modificar un producto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, code, description, stock } = req.body;

    // Validar los campos requeridos
    if (!name || !price || !description || !stock || !code) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Buscar y actualizar el producto
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, description, stock },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    res.status(200).json({ message: 'Producto actualizado exitosamente.', product: updatedProduct });
  } catch (error) {
    console.error('Error al modificar producto:', error);
    res.status(500).json({ message: 'Error al modificar el producto.' });
  }
});

// Ruta para eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar el producto
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    res.status(200).json({ message: 'Producto eliminado exitosamente.', product: deletedProduct });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar el producto.' });
  }
});

module.exports = router;
