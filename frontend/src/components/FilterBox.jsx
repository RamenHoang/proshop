import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';

const FilterBox = ({ filters, onApplyFilter, onResetFilter, isLoading = false }) => {
  const [filterValues, setFilterValues] = useState({});
  const [expanded, setExpanded] = useState(true); // Start expanded by default

  // Update filter options if they change (e.g., categories loaded)
  useEffect(() => {
    // This ensures that new options are reflected in the component
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilter(filterValues);
  };

  const handleReset = () => {
    setFilterValues({});
    onResetFilter();
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Filters</h5>
        <Button
          variant="link"
          onClick={toggleExpanded}
          className="p-0"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </Card.Header>

      {expanded && (
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              {filters.map((filter, index) => (
                <Col md={4} key={index}>
                  <Form.Group className="mb-3">
                    <Form.Label>{filter.label}</Form.Label>
                    {filter.type === 'select' ? (
                      <Form.Select
                        name={filter.name}
                        value={filterValues[filter.name] || ''}
                        onChange={handleChange}
                      >
                        <option value="">Select {filter.label}</option>
                        {filter.options && filter.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    ) : filter.type === 'date' ? (
                      <Form.Control
                        type="date"
                        name={filter.name}
                        value={filterValues[filter.name] || ''}
                        onChange={handleChange}
                      />
                    ) : (
                      <Form.Control
                        type={filter.type || 'text'}
                        name={filter.name}
                        value={filterValues[filter.name] || ''}
                        onChange={handleChange}
                        placeholder={filter.placeholder || `Enter ${filter.label}`}
                      />
                    )}
                  </Form.Group>
                </Col>
              ))}
            </Row>
            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={handleReset}
                className="me-2"
                type="button"
                disabled={isLoading}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Applying...
                  </>
                ) : (
                  'Apply Filters'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      )}
    </Card>
  );
};

export default FilterBox;
