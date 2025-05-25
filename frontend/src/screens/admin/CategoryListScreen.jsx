import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col, Form, Modal } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FilterBox from '../../components/FilterBox';
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '../../slices/categoriesApiSlice';
import { toast } from 'react-toastify';

const CategoryListScreen = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading, error, refetch } = useGetCategoriesQuery();

  const [deleteCategory, { isLoading: loadingDelete }] =
    useDeleteCategoryMutation();

  const [createCategory, { isLoading: loadingCreate }] =
    useCreateCategoryMutation();

  const [updateCategory, { isLoading: loadingUpdate }] =
    useUpdateCategoryMutation();

  // State for category form
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [filterParams, setFilterParams] = useState({});

  // Define the filters
  const categoryFilters = [
    { label: 'Name', name: 'name', type: 'text' },
    { label: 'Start Date', name: 'startDate', type: 'date' },
    { label: 'End Date', name: 'endDate', type: 'date' },
  ];

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        refetch();
        toast.success('Category deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const createHandler = () => {
    setEditingCategoryId(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const editHandler = (category) => {
    setEditingCategoryId(category._id);
    setName(category.name);
    setDescription(category.description || '');
    setShowModal(true);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        await updateCategory({
          categoryId: editingCategoryId,
          name,
          description,
        });
        toast.success('Category updated successfully');
      } else {
        await createCategory({
          name,
          description,
        });
        toast.success('Category created successfully');
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // Apply filters
  const handleApplyFilter = (values) => {
    setFilterParams(values);
    // You would need to update your API call to include these filters
  };

  // Reset filters
  const handleResetFilter = () => {
    setFilterParams({});
    // Reset to default data fetch
  };

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Categories</h1>
        </Col>
        <Col className='text-end'>
          <Button className='my-3' onClick={createHandler}>
            <FaPlus /> Create Category
          </Button>
        </Col>
      </Row>

      <FilterBox
        filters={categoryFilters}
        onApplyFilter={handleApplyFilter}
        onResetFilter={handleResetFilter}
      />

      {loadingCreate || loadingDelete || loadingUpdate ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error.data.message}</Message>
      ) : (
        <Table striped bordered hover responsive className='table-sm'>
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>CREATED AT</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td>{category._id}</td>
                <td>{category.name}</td>
                <td>{category.createdAt.substring(0, 10)}</td>
                <td>
                  <Button
                    variant='light'
                    className='btn-sm mx-2'
                    onClick={() => navigate(`/admin/category/${category._id}/edit`)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant='danger'
                    className='btn-sm'
                    onClick={() => deleteHandler(category._id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Category Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategoryId ? 'Edit Category' : 'Create Category'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitHandler}>
            <Form.Group className='mb-3' controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter category name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className='mb-3' controlId='description'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                placeholder='Enter category description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Button variant='primary' type='submit'>
              {editingCategoryId ? 'Update' : 'Create'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CategoryListScreen;
