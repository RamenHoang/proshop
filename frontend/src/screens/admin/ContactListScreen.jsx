import { useEffect, useState } from 'react';
import { Table, Button, Row, Col, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { getContactMessages, deleteContactMessage, updateContactToRead } from '../../slices/contactSlice';
import { useNavigate } from 'react-router-dom';

const ContactListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Fix: Change to use state.auth instead of state.userLogin
  const { userInfo } = useSelector((state) => state.auth || {});
  const { loading, error, messages = [] } = useSelector((state) => state.contact || {});

  useEffect(() => {
    console.log({userInfo});

    if (userInfo && userInfo.isAdmin) {
      dispatch(getContactMessages());
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, userInfo]);

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      dispatch(deleteContactMessage(id))
        .unwrap()
        .then(() => {
          toast.success('Message deleted');
        })
        .catch((err) => {
          toast.error(err);
        });
    }
  };

  const viewMessageHandler = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    
    // If message is unread, mark it as read
    if (!message.isRead) {
      dispatch(updateContactToRead(message._id));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
  };

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Contact Messages</h1>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          {messages.length === 0 ? (
            <Message>No contact messages found</Message>
          ) : (
            <Table striped hover responsive className='table-sm'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message._id}>
                    <td>{message._id}</td>
                    <td>{message.name}</td>
                    <td>
                      <a href={`mailto:${message.email}`}>{message.email}</a>
                    </td>
                    <td>{new Date(message.createdAt).toLocaleDateString()}</td>
                    <td>
                      {message.isRead ? (
                        <span className='badge bg-success'>Read</span>
                      ) : (
                        <span className='badge bg-warning'>Unread</span>
                      )}
                    </td>
                    <td>
                      <Button
                        variant='light'
                        className='btn-sm mx-2'
                        onClick={() => viewMessageHandler(message)}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant='danger'
                        className='btn-sm'
                        onClick={() => deleteHandler(message._id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          
          {/* Modal for viewing message details */}
          <Modal show={showModal} onHide={closeModal}>
            <Modal.Header closeButton>
              <Modal.Title>Contact Message</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedMessage && (
                <>
                  <p><strong>From:</strong> {selectedMessage.name}</p>
                  <p><strong>Email:</strong> {selectedMessage.email}</p>
                  <p><strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                  <p><strong>Message:</strong></p>
                  <p className="p-3 bg-light">{selectedMessage.message}</p>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </>
  );
};

export default ContactListScreen;
