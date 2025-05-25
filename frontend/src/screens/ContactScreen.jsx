import { Row, Col, Container, Form, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { submitContactForm } from '../slices/contactSlice';

const ContactScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const dispatch = useDispatch();
  
  const { loading, success, error } = useSelector((state) => state.contact);
  
  useEffect(() => {
    if (success) {
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }
    
    if (error) {
      toast.error(error);
    }
  }, [success, error]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(submitContactForm({ name, email, message }));
  };

  return (
    <Container>
      <Helmet>
        <title>ProShop | Contact Us</title>
        <meta name="description" content="Contact ProShop for any inquiries" />
      </Helmet>
      <Row className="py-5">
        <Col md={6}>
          <h1>Contact Us</h1>
          <p className="my-3">
            We'd love to hear from you! Please feel free to get in touch with us using the information below or fill out the contact form.
          </p>
          {/* <div className="my-4">
            <h4>Address</h4>
            <p>123 Tech Street, Digital City, 10001</p>
          </div>
          <div className="my-4">
            <h4>Phone</h4>
            <p>+1 (123) 456-7890</p>
          </div>
          <div className="my-4">
            <h4>Email</h4>
            <p>info@proshop.com</p>
          </div>
          <div className="my-4">
            <h4>Business Hours</h4>
            <p>Monday - Friday: 9am - 5pm</p>
            <p>Saturday: 10am - 4pm</p>
            <p>Sunday: Closed</p>
          </div> */}
        </Col>
        <Col md={6}>
          <h2 className="mb-4">Send us a message</h2>
          {submitted ? (
            <div className="alert alert-success">
              Thank you for your message! We'll get back to you soon.
            </div>
          ) : (
            <Form onSubmit={submitHandler}>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="message">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Enter your message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Submit
              </Button>
              {loading && <Loader />}
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ContactScreen;
