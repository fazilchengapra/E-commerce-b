var express = require('express');
var router = express.Router();

const flashSaleController = require('../controllers/flashSaleController');
const productListController = require('../controllers/productListController')

router.get('/flashSale', flashSaleController.getFlashSales); 
// router.get('/topCategory', getTopCategories);
router.get('/newArrivals', productListController.getNewArrivals);
// router.get('/bestSeller', getBestSellers);

module.exports = router;