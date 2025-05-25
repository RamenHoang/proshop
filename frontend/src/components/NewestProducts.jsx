import { Row, Col } from 'react-bootstrap';
import Product from './Product';
import Loader from './Loader';
import Message from './Message';
import { useGetNewestProductsQuery } from '../slices/productsApiSlice';

const NewestProducts = () => {
  const { data: products, isLoading, error } = useGetNewestProductsQuery();

  return (
    <>
      <h2>Newest Products</h2>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Row>
          {products.map((product) => (
            <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
              <Product product={product} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default NewestProducts;
