import { Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useGetCategoriesQuery } from '../slices/productsApiSlice';
import Loader from './Loader';
import Message from './Message';

const CategoryBar = () => {
  const { data: categories, isLoading, error } = useGetCategoriesQuery();

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <div className="category-bar bg-light">
      <Container className="d-flex justify-content-center">
        <Nav className="overflow-auto category-nav">
          {categories.map((category) => (
            <Nav.Item key={category}>
              <Nav.Link 
                as={Link} 
                to={`/category/${encodeURIComponent(category)}`}
                className="category-item text-dark"
              >
                {category}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </Container>
    </div>
  );
};

export default CategoryBar;
