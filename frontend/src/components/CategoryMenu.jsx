import { NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useGetCategoriesQuery } from '../slices/productsApiSlice';
import Loader from './Loader';
import Message from './Message';

const CategoryMenu = () => {
  const { data: categories, isLoading, error } = useGetCategoriesQuery();

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <NavDropdown title='Categories' id='categories' className='categories-dropdown'>
      {categories.map((category) => (
        <NavDropdown.Item 
          key={category} 
          as={Link} 
          to={`/search?category=${category}`}
        >
          {category}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  );
};

export default CategoryMenu;
