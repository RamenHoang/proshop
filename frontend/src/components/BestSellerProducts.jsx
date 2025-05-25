import { Row, Col } from 'react-bootstrap';
import Product from './Product';
import Loader from './Loader';
import Message from './Message';
import { useGetBestSellerProductsQuery } from '../slices/productsApiSlice';

const BestSellerProducts = () => {
  const { data: products, isLoading, error } = useGetBestSellerProductsQuery();

  return (
    <div className="my-4">
      <h2 className="mb-3">Best Sellers</h2>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Row>
          {products.map((product) => (
            <Col key={product._id} sm={12} md={6} lg={4} xl={4}>
              <Product product={product} />
            </Col>
          ))}
        </Row>
      )}
      {/* <div className="text-end mt-3">
        <Link to="/bestsellers" className="btn btn-outline-primary">
          View All Best Sellers
        </Link>
      </div> */}
    </div>
  );
};

export default BestSellerProducts;
