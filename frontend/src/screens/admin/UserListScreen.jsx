import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button } from 'react-bootstrap';
import { FaCheck, FaEdit, FaTimes, FaTrash } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import Paginate from '../../components/Paginate';
import FilterBox from '../../components/FilterBox';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from '../../slices/usersApiSlice';
import { toast } from 'react-toastify';

const UserListScreen = () => {
  const navigate = useNavigate();
  const [filterParams, setFilterParams] = useState({});
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Explicitly pass filterParams to the query hook
  const { data, isLoading, error, refetch } = useGetUsersQuery(filterParams);
  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();

  // Extract users array from API response
  const users = data?.users || [];

  // Define the filters
  const userFilters = [
    { label: 'Name', name: 'name', type: 'text' },
    { label: 'Email', name: 'email', type: 'text' },
    {
      label: 'Admin Status',
      name: 'isAdmin',
      type: 'select',
      options: [
        { value: 'true', label: 'Admin' },
        { value: 'false', label: 'Not Admin' },
      ],
    },
    { label: 'Start Date', name: 'startDate', type: 'date' },
    { label: 'End Date', name: 'endDate', type: 'date' },
  ];

  // Apply filters - ensure we're constructing clean filter values
  const handleApplyFilter = async (values) => {
    // Remove empty values
    const cleanedValues = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== '')
    );

    // Log the filter parameters to verify they're correct
    console.log('Applying filters:', cleanedValues);

    setIsFilterLoading(true);
    setFilterParams(cleanedValues);

    try {
      await refetch();
    } catch (err) {
      console.error('Error applying filters:', err);
    } finally {
      setIsFilterLoading(false);
    }
  };

  // Reset filters
  const handleResetFilter = async () => {
    setIsFilterLoading(true);
    setFilterParams({});

    try {
      await refetch();
    } finally {
      setIsFilterLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <>
      <h1>Users</h1>

      <FilterBox
        filters={userFilters}
        onApplyFilter={handleApplyFilter}
        onResetFilter={handleResetFilter}
        isLoading={isFilterLoading}
      />

      {isLoading || loadingDelete ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          {users.length === 0 ? (
            <Message>No users found</Message>
          ) : (
            <Table striped bordered hover responsive className='table-sm'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>ADMIN</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.name}</td>
                    <td>
                      <a href={`mailto:${user.email}`}>{user.email}</a>
                    </td>
                    <td>
                      {user.isAdmin ? (
                        <FaCheck style={{ color: 'green' }} />
                      ) : (
                        <FaTimes style={{ color: 'red' }} />
                      )}
                    </td>
                    <td>
                      {!user.isAdmin && (
                        <>
                          <Button
                            variant='light'
                            className='btn-sm'
                            onClick={() => navigate(`/admin/user/${user._id}/edit`)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant='danger'
                            className='btn-sm'
                            onClick={() => deleteHandler(user._id)}
                          >
                            <FaTrash />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {data?.pages > 1 && (
            <Paginate
              pages={data.pages}
              page={data.page}
              isAdmin={true}
              path='userlist'
              additionalParams={filterParams}
            />
          )}
        </>
      )}
    </>
  );
};

export default UserListScreen;
