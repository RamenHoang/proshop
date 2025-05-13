import { useParams } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import Meta from '../components/Meta';

const CategoryScreen = () => {
  const { category, pageNumber } = useParams();
  const decodedCategory = decodeURIComponent(category);
  
  const { data, isLoading, error } = useGetProductsQuery({
    category: decodedCategory,
    pageNumber,
  });

  return (
    <>
      <Meta title={`${decodedCategory} Products`} />
      <h1>{decodedCategory}</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          {data.products.length === 0 ? (
            <Message>No products found in this category</Message>
          ) : (
            <>
              <Row>
                {data.products.map((product) => (
                  <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                    <Product product={product} />
                  </Col>
                ))}
              </Row>
              <Paginate
                pages={data.pages}
                page={data.page}
                category={category}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default CategoryScreen;
