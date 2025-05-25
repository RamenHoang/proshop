import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Card, Table, ButtonGroup, Button } from 'react-bootstrap';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  BarController, 
  ArcElement,  // Add this for pie chart
  PieController,  // Add this for pie chart
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { useGetProductsQuery } from '../../slices/productsApiSlice';
import { useGetUsersQuery } from '../../slices/usersApiSlice';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  ArcElement,  // Register Arc Element for pie chart
  PieController,  // Register Pie Controller
  Title,
  Tooltip,
  Legend
);

const AdminDashboardScreen = () => {
  const { data: products, isLoading: loadingProducts, error: errorProducts } = useGetProductsQuery({});
  const { data: users, isLoading: loadingUsers, error: errorUsers } = useGetUsersQuery();
  const { data: orders, isLoading: loadingOrders, error: errorOrders } = useGetOrdersQuery();

  const [chartData, setChartData] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'day'
  const [pieChartData, setPieChartData] = useState(null);
  const chartContainer = useRef(null);
  const pieChartContainer = useRef(null);
  const chartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  // Clean up the existing chart instances
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
        pieChartInstance.current = null;
      }
    };
  }, []);

  // Create chart data
  useEffect(() => {
    if (!orders) return;
    
    const incomeByMonth = Array(12).fill(0);
    const incomeByDay = Array(31).fill(0);

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      incomeByMonth[date.getMonth()] += order.totalPrice;
      incomeByDay[date.getDate() - 1] += order.totalPrice;
    });

    if (viewMode === 'month') {
      setChartData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Income by Month',
            data: incomeByMonth,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          },
        ],
      });
    } else {
      // Day view
      setChartData({
        labels: Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: 'Income by Day',
            data: incomeByDay,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          },
        ],
      });
    }
  }, [orders, viewMode]);

  // Create pie chart data
  useEffect(() => {
    if (!orders) return;
    
    let newOrders = 0;
    let paidOrders = 0;
    let deliveredOrders = 0;

    orders.forEach((order) => {
      if (!order.isPaid && !order.isDelivered) {
        newOrders++;
      } else if (order.isPaid && !order.isDelivered) {
        paidOrders++;
      } else if (order.isPaid && order.isDelivered) {
        deliveredOrders++;
      }
    });

    setPieChartData({
      labels: ['New Orders', 'Paid Orders', 'Delivered Orders'],
      datasets: [
        {
          data: [newOrders, paidOrders, deliveredOrders],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',  // Red for new orders
            'rgba(54, 162, 235, 0.6)',  // Blue for paid orders
            'rgba(75, 192, 192, 0.6)',  // Green for delivered orders
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });
  }, [orders]);

  // Create chart when data is available
  useEffect(() => {
    if (chartData && chartContainer.current) {
      // Destroy previous chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartContainer.current.getContext('2d');
      chartInstance.current = new ChartJS(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }, [chartData]);

  // Create pie chart when data is available
  useEffect(() => {
    if (pieChartData && pieChartContainer.current) {
      // Destroy previous chart if it exists
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }

      const ctx = pieChartContainer.current.getContext('2d');
      pieChartInstance.current = new ChartJS(ctx, {
        type: 'pie',
        data: pieChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }, [pieChartData]);

  const isLoading = loadingProducts || loadingUsers || loadingOrders;
  const isError = errorProducts || errorUsers || errorOrders;

  // Helper function to get the correct users count
  const getUsersCount = () => {
    if (!users) return 0;
    
    // If users is an array, return its length
    if (Array.isArray(users)) {
      return users.length;
    }
    
    // If users is an object with a 'users' property that is an array
    if (users.users && Array.isArray(users.users)) {
      return users.users.length;
    }
    
    // If there's a count property directly on the response
    if (typeof users.count === 'number') {
      return users.count;
    }
    
    return 0;
  };

  let a = [];
  if (products) {
    a = Object.entries(
      products.products.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {})
    );
  }

  let b = [];
  if (products) {
    b = products.products
      .slice()
      .sort((a, b) => b.numReviews - a.numReviews)
      .slice(0, 5);
  }

  return (
    <>
      <h1>Admin Dashboard</h1>
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">
          {errorProducts?.data?.message || errorUsers?.data?.message || errorOrders?.data?.message}
        </Message>
      ) : (
        <>
          {/* First row with product categories, users count and top products */}
          <Row>
            <Col md={4}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Products by Category</Card.Title>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.length > 0 ? a.map(([category, count]) => (
                        <tr key={category}>
                          <td>{category}</td>
                          <td>{count}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="2">No products available</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Total Users</Card.Title>
                  <h3>{getUsersCount()}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Top 5 Best-Selling Products</Card.Title>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Reviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {b?.length > 0 ? b.map((product) => (
                        <tr key={product._id}>
                          <td>{product.name}</td>
                          <td>{product.numReviews}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="2">No products available</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Second row with charts */}
          <Row>
            <Col md={8}>
              <Card className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Card.Title>Income Statistics</Card.Title>
                    <ButtonGroup>
                      <Button 
                        variant={viewMode === 'month' ? 'primary' : 'outline-primary'} 
                        onClick={() => setViewMode('month')}
                      >
                        Monthly
                      </Button>
                      <Button 
                        variant={viewMode === 'day' ? 'primary' : 'outline-primary'} 
                        onClick={() => setViewMode('day')}
                      >
                        Daily
                      </Button>
                    </ButtonGroup>
                  </div>
                  <div style={{ position: 'relative', height: '300px' }}>
                    <canvas ref={chartContainer} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Order Status</Card.Title>
                  <div style={{ position: 'relative', height: '300px' }}>
                    <canvas ref={pieChartContainer} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default AdminDashboardScreen;