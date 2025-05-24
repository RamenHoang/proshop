import { NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useGetCategoriesQuery } from '../slices/categoriesApiSlice';
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
          key={category._id} 
          as={Link} 
          to={`/category/${encodeURIComponent(category.name)}`}
        >
          {category.name}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  );
};

export default CategoryMenu;
