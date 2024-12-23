const express = require('express');
const mongoose = require('mongoose');
const handlebars = require('express-handlebars');
const morgan = require('morgan');
const cors = require('cors');
const Product = require('./models/product.model'); // Importa el modelo de productos
const Cart = require('./models/cart.model');

const PORT = 8080;
const MONGO_URI = 'mongodb+srv://eduezequielgomez:1234@cluster0.dluid.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Importar rutas
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./src/public'));

// Configurar Handlebars como motor de vistas con helpers personalizados
const hbs = handlebars.create({
  helpers: {
    ifEquals: function (a, b, options) {
      return a === b ? options.fn(this) : options.inverse(this);
    },
    add: function (a, b) {
      return a + b;
    },
    subtract: function (a, b) {
      return a - b;
    },
    gt: function (a, b) {
      return a > b;
    },
    lt: function (a, b) {
      return a < b;
    },
    range: function (start, end) {
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    },
  },
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './src/views');

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Conexión a la base de datos
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Atlas conectado'))
  .catch(err => console.error('Error al conectar con MongoDB:', err));

// Rutas
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// Ruta principal con filtro de categoría
// Ruta principal con paginación y filtro de categoría
app.get('/', async (req, res) => {
  try {
    const selectedCategory = req.query.category || ''; // Obtiene la categoría seleccionada
    const page = parseInt(req.query.page) || 1; // Página actual (por defecto 1)
    const limit = 10; // Productos por página
    const skip = (page - 1) * limit; // Calcula los productos a omitir según la página actual

    // Construye el query con la categoría seleccionada (si aplica)
    const query = selectedCategory ? { category: selectedCategory } : {};

    // Consulta a la base de datos
    const [products, totalProducts] = await Promise.all([
      Product.find(query).skip(skip).limit(limit).lean(), // Productos paginados
      Product.countDocuments(query), // Total de productos en la categoría seleccionada
    ]);

    const totalPages = Math.ceil(totalProducts / limit); // Total de páginas

    // Obtiene todas las categorías disponibles
    const categories = await Product.distinct('category');

    res.render('home', {
      title: 'Tienda Online',
      products,
      categories,
      selectedCategory,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).send('Error interno del servidor');
  }
});


// Ruta para mostrar el carrito
app.get('/api/cart', async (req, res) => {
  try {
    const cart = await Cart.findOne().populate('products.product'); // Obtener carrito con productos
    if (!cart) {
      const newCart = new Cart({ products: [] }); // Crear un carrito vacío si no existe
      await newCart.save();
      return res.render('cart', { cart: newCart });
    }
    res.render('cart', { cart }); // Renderizar el carrito en la vista "cart.handlebars"
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});