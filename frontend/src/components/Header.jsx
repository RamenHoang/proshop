import { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaThList, FaAngleDown } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { useGetCategoriesQuery } from '../slices/categoriesApiSlice';
import { logout } from '../slices/authSlice';
import SearchBox from './SearchBox';
import logo from '../assets/logo.png';
import { resetCart } from '../slices/cartSlice';

const Header = () => {
  const [isHovering, setIsHovering] = useState(false);
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useGetCategoriesQuery();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      // NOTE: here we need to reset cart state for when a user logs out so the next
      // user doesn't inherit the previous users cart and shipping
      dispatch(resetCart());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`);
    setIsHovering(false);
  };

  const toggleDropdown = () => {
    setIsHovering(!isHovering);
  };

  return (
    <header>
      <Navbar bg='primary' variant='dark' expand='lg' collapseOnSelect>
        <Container>
          <Navbar.Brand 
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            <img src={logo} alt='ProShop' />
            ProShop
          </Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='me-auto'>
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
                <FaThList className="text-white me-2" size={18} />
                
                <span className="text-white fw-normal me-1">
                  Category
                </span>

                <FaAngleDown 
                  className="text-white" 
                  size={12} 
                />
                
                {isHovering && !categoriesLoading && !categoriesError && categories && (
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
                        }}
                        style={{
                          padding: '8px 16px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          color: '#212529'
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
            </Nav>
            <Nav className='ms-auto'>
              <SearchBox />
              <Nav.Link onClick={() => navigate('/cart')}>
                <FaShoppingCart /> Cart
                {cartItems.length > 0 && (
                  <Badge pill bg='success' style={{ marginLeft: '5px' }}>
                    {cartItems.reduce((a, c) => a + c.qty, 0)}
                  </Badge>
                )}
              </Nav.Link>
              {userInfo ? (
                <>
                  <NavDropdown title={userInfo.name} id='username'>
                    <NavDropdown.Item 
                      onClick={() => navigate('/profile')}
                    >
                      Profile
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={logoutHandler}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <Nav.Link onClick={() => navigate('/login')}>
                  <FaUser /> Sign In
                </Nav.Link>
              )}

              {/* Admin Links */}
              {userInfo && userInfo.isAdmin && (
                <NavDropdown title='Admin' id='adminmenu'>
                  <NavDropdown.Item onClick={() => navigate('/admin/productlist')}>
                    Products
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigate('/admin/orderlist')}>
                    Orders
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigate('/admin/userlist')}>
                    Users
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigate('/admin/categorylist')}>
                    Categories
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
