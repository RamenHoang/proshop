import { useState } from 'react';
import { Table, Button, Form, Row, Col } from 'react-bootstrap';
import { FaTimes, FaEdit } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetOrdersQuery, useUpdateDeliveryStatusMutation } from '../../slices/ordersApiSlice';
import { Link } from 'react-router-dom';
// import { LinkContainer } from 'react-router-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const OrderListScreen = () => {
  const { data: orders, isLoading, error, refetch } = useGetOrdersQuery();
  const [updateDeliveryStatus] = useUpdateDeliveryStatusMutation();

  const [paidFilter, setPaidFilter] = useState('all');
  const [deliveredFilter, setDeliveredFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Clear date filters
  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  // Filter orders based on selected filters
  const filteredOrders = orders ? orders.filter(order => {
    // Filter by payment status
    if (paidFilter === 'paid' && !order.isPaid) return false;
    if (paidFilter === 'notPaid' && order.isPaid) return false;

    // Filter by delivery status
    if (deliveredFilter === 'delivered' && !order.isDelivered) return false;
    if (deliveredFilter === 'notDelivered' && order.isDelivered) return false;

    // Filter by payment method
    if (paymentMethodFilter !== 'all' && order.paymentMethod !== paymentMethodFilter) return false;

    // Filter by date range
    if (startDate || endDate) {
      const orderDate = new Date(order.createdAt);

      if (startDate && orderDate < startDate) {
        return false;
      }

      if (endDate) {
        // Set end date to end of the day for inclusive filtering
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);

        if (orderDate > endOfDay) {
          return false;
        }
      }
    }

    return true;
  }) : [];

  // Function to handle status update
  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateDeliveryStatus({
        orderId,
        status,
      }).unwrap();
      refetch();
      toast.success('Status updated');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <h1>Orders</h1>

      <Row className="my-3">
        <Col md={6} lg={3} xl={2}>
          <Form.Group controlId="paidFilter">
            <Form.Label>Payment Status</Form.Label>
            <Form.Select
              value={paidFilter}
              onChange={(e) => setPaidFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="notPaid">Not Paid</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6} lg={3} xl={2}>
          <Form.Group controlId="deliveredFilter">
            <Form.Label>Delivery Status</Form.Label>
            <Form.Select
              value={deliveredFilter}
              onChange={(e) => setDeliveredFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="delivered">Delivered</option>
              <option value="notDelivered">Not Delivered</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6} lg={3} xl={2}>
          <Form.Group controlId="paymentMethodFilter">
            <Form.Label>Payment Method</Form.Label>
            <Form.Select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="PayPal">PayPal</option>
              <option value="VNPay">VNPay</option>
              <option value="COD">Cash On Delivery</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6} lg={3} xl={2}>
          <Form.Group controlId="startDateFilter">
            <Form.Label>Start Date</Form.Label>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="form-control"
              dateFormat="MM/dd/yyyy"
              placeholderText="From date"
              maxDate={new Date()}
            />
          </Form.Group>
        </Col>

        <Col md={6} lg={3} xl={2}>
          <Form.Group controlId="endDateFilter">
            <Form.Label>End Date</Form.Label>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              className="form-control"
              dateFormat="MM/dd/yyyy"
              placeholderText="To date"
            />
          </Form.Group>
        </Col>

        <Col md={6} lg={3} xl={2} className="">
          <Form.Group controlId="endDateFilter">
            <Form.Label>&nbsp;</Form.Label>
            <Button
              variant="outline-secondary"
              onClick={clearDateFilter}
              disabled={!startDate && !endDate}
              className="w-100"
            >
              Clear Dates
            </Button>
          </Form.Group>
        </Col>
      </Row>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Table striped bordered hover responsive className='table-sm'>
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERY STATUS</th>
              <th>DELIVERED</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user && order.user.name}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>{order.totalPrice}đ</td>
                <td>
                  {order.isPaid ? ( order.paidAt ? order.paidAt.substring(0, 10) : 'N/A') : (<FaTimes style={{ color: 'red' }} />)}
                </td>
                <td>
                  <Form.Select
                    value={order.deliveryStatus}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    className="form-select-sm"
                  >
                    <option value="Not Processed">Not Processed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                </td>
                <td>
                  {order.isDelivered ? (
                    order.deliveredAt.substring(0, 10)
                  ) : (
                    <FaTimes style={{ color: 'red' }} />
                  )}
                </td>
                <td>
                  <Button
                    as={Link}
                    to={`/order/${order._id}`}
                    variant='light'
                    className='btn-sm'
                  >
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default OrderListScreen;
