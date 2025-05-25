import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import Paginate from '../../components/Paginate';
import FilterBox from '../../components/FilterBox';
import {
  useGetAdminProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
} from '../../slices/productsApiSlice';
import { useGetCategoriesQuery } from '../../slices/categoriesApiSlice';
import { toast } from 'react-toastify';

const ProductListScreen = () => {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const [filterParams, setFilterParams] = useState({});
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);

  // Get categories for the filter
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();

  // Fetch products with filter params
  const { data, isLoading, error, refetch } = useGetAdminProductsQuery({
    pageNumber,
    ...filterParams,
  });

  const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation();
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();

  // Define the filters
  const productFilters = [
    { label: 'Name', name: 'name', type: 'text' },
    { label: 'Brand', name: 'brand', type: 'text' },
    { label: 'Min Price', name: 'minPrice', type: 'number' },
    { label: 'Max Price', name: 'maxPrice', type: 'number' },
  ];

  // Add category filter if categories are loaded
  useEffect(() => {
    if (categoriesData) {
      productFilters.push({
        label: 'Category',
        name: 'category',
        type: 'select',
        options: categoriesData.map(cat => ({
          value: cat._id,
          label: cat.name
        }))
      });
    }
  }, [categoriesData]);

  // Add stock status filter
  productFilters.push({
    label: 'Stock Status',
    name: 'inStock',
    type: 'select',
    options: [
      { value: 'true', label: 'In Stock' },
      { value: 'false', label: 'Out of Stock' }
    ]
  });

  // Apply filters
  const handleApplyFilter = async (values) => {
    // Remove empty values
    const cleanedValues = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== '')
    );

    setIsFilterLoading(true);
    setFilterParams(cleanedValues);
    setFilterApplied(true);

    try {
      await refetch();
    } finally {
      setIsFilterLoading(false);
    }
  };

  // Reset filters
  const handleResetFilter = async () => {
    setIsFilterLoading(true);
    setFilterParams({});
    setFilterApplied(false);

    try {
      await refetch();
    } finally {
      setIsFilterLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const createProductHandler = async () => {
    if (window.confirm('Are you sure you want to create a new product?')) {
      try {
        await createProduct();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className='text-end'>
          <Button className='my-3' onClick={createProductHandler}>
            <FaPlus /> Create Product
          </Button>
        </Col>
      </Row>

      <FilterBox
        filters={productFilters}
        onApplyFilter={handleApplyFilter}
        onResetFilter={handleResetFilter}
        isLoading={isFilterLoading}
      />

      {loadingCreate && <Loader />}
      {loadingDelete && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error.data?.message || error.error}</Message>
      ) : (
        <>
          {filterApplied && (
            <div className="mb-3">
              <h5>Filter Results</h5>
              {data.products.length === 0 ? (
                <Message>No products match your filter criteria</Message>
              ) : (
                <p>Showing {data.products.length} of {data.count || 'all'} products</p>
              )}
              {Object.keys(filterParams).length > 0 && (
                <Button
                  variant="link"
                  onClick={handleResetFilter}
                  className="p-0 text-decoration-none"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}

          {data.products.length === 0 ? (
            <Message>No products found</Message>
          ) : (
            <>
              <Table striped bordered hover responsive className='table-sm'>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NAME</th>
                    <th>PRICE</th>
                    <th>CATEGORY</th>
                    <th>BRAND</th>
                    <th>STOCK</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((product) => (
                    <tr key={product._id}>
                      <td>{product._id}</td>
                      <td>{product.name}</td>
                      <td>{product.price}</td>
                      <td>{product.categoryRef ? product.categoryRef.name : 'N/A'}</td>
                      <td>{product.brand}</td>
                      <td>{product.countInStock}</td>
                      <td>
                        <Button
                          variant='light'
                          className='btn-sm mx-2'
                          onClick={() => navigate(`/admin/product/${product._id}/edit`)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant='danger'
                          className='btn-sm'
                          onClick={() => deleteHandler(product._id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Paginate
                pages={data.pages}
                page={data.page}
                isAdmin={true}
                additionalParams={filterParams}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default ProductListScreen;
