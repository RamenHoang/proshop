import { Row, Col, Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';

const AboutScreen = () => {
  return (
    <Container>
      <Helmet>
        <title>ProShop | About Us</title>
        <meta name="description" content="Learn more about ProShop" />
      </Helmet>
      <Row className="py-5">
        <Col md={12}>
          <h1>About Us</h1>
          <p className="my-3">
            Welcome to ProShop, your number one source for all tech products. We're dedicated to providing you the very best of electronics, with a focus on quality, price, and service.
          </p>
          <p className="my-3">
            Founded in 2023, ProShop has come a long way from its beginnings. We now serve customers all over the country and are thrilled to be a part of the tech retail industry.
          </p>
          <p className="my-3">
            We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
          </p>
          <h2 className="mt-5">Our Mission</h2>
          <p className="my-3">
            At ProShop, our mission is to provide high-quality tech products at affordable prices while offering exceptional customer service.
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutScreen;
