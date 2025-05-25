import { Link } from 'react-router-dom';
import { Pagination } from 'react-bootstrap';

const Paginate = ({ pages, page, isAdmin = false, keyword = '', additionalParams = {} }) => {
  const urlParams = new URLSearchParams(window.location.search);
  let additionalParamsString = '';
  
  // Add any additional parameters to pagination links
  Object.entries(additionalParams).forEach(([key, value]) => {
    if (value) {
      additionalParamsString += `&${key}=${value}`;
    }
  });

  return (
    pages > 1 && (
      <Pagination>
        {[...Array(pages).keys()].map((x) => {
          const pageNum = x + 1;
          const url = !isAdmin
            ? keyword
              ? `/search/${keyword}/page/${pageNum}`
              : `/page/${pageNum}`
            : `/admin/productlist/${pageNum}${additionalParamsString}`;
          
          return (
            <Pagination.Item 
              key={pageNum} 
              active={pageNum === page}
              as={Link}
              to={url}
            >
              {pageNum}
            </Pagination.Item>
          );
        })}
      </Pagination>
    )
  );
};

export default Paginate;
