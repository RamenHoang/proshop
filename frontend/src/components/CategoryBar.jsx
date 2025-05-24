import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCategoriesQuery } from '../slices/categoriesApiSlice';
import { FaThList, FaAngleDown } from 'react-icons/fa';
import Loader from './Loader';
import Message from './Message';

const CategoryBar = () => {
  const [isHovering, setIsHovering] = useState(false);
  const { data: categories, isLoading, error } = useGetCategoriesQuery();
  const navigate = useNavigate();

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  const toggleDropdown = () => {
    setIsHovering(!isHovering);
  };

  return (
    <div className="category-bar bg-light py-3 shadow-sm">
      <div className="container">
        <div className="d-flex align-items-center">
          <div 
            style={{
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative'
            }}
            onClick={toggleDropdown}
            onMouseEnter={() => setTimeout(() => setIsHovering(true), 100)}
            onMouseLeave={() => setTimeout(() => setIsHovering(false), 200)}
          >
            <FaThList className="text-primary me-2" size={20} />
            
            <span className="fw-bold me-1">
              Category
            </span>

            <FaAngleDown 
              className="text-primary" 
              size={14} 
            />
            
            {isHovering && (
              <ul style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                zIndex: 1000,
                listStyle: 'none',
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                padding: '8px 0',
                margin: '4px 0 0 0',
                minWidth: '200px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {categories.map((category) => (
                  <li 
                    key={category._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryClick(category.name);
                      setIsHovering(false);
                    }}
                    style={{
                      padding: '8px 16px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {category.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
