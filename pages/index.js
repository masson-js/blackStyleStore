import axios from 'axios';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';
import Product from '../models/Product';
import db from '../utils/db';
import { Store } from '../utils/Store';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Link from 'next/link';

export default function Home({ products, featuredProducts }) {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  const addToCartHandler = async (product) => {
    const existItem = cart.cartItems.find((x) => x.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      return toast.error('Sorry. Product is out of stock');
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });

    toast.success('Product added to the cart');
  };

  return (
    <Layout title="Home Page">
      <div className="flex">
      <div>
      <Carousel showThumbs={false} autoPlay>
        {featuredProducts.map((product) => (
          <div key={product._id}>
            <Link href={`/product/${product.slug}`} passHref>
              <a className="flex">
                <img src={product.banner} alt={product.name} />
              </a>
            </Link>
          </div>
        ))}
      </Carousel>
      <h2 className="p-2 text-4xl ml-1 m-4 px-3 py-1 text-l font-bold text-black">Latest Products</h2>
      <div className="grid grid-cols-1 gap-4 rounded-lg md:grid-cols-3 lg:grid-cols-4 bg-white">
        {products.map((product) => (
          <ProductItem
          product={product}
          key={product.slug}
          addToCartHandler={addToCartHandler}
          ></ProductItem>
          ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const products = await Product.find().lean();
  const featuredProducts = await Product.find({ isFeatured: true }).lean();
  return {
    props: {
      featuredProducts: featuredProducts.map(db.convertDocToObj),
      products: products.map(db.convertDocToObj),
    },
  };
}
