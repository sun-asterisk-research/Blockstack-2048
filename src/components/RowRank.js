import React from 'react';
import { Row, Col } from 'reactstrap';

const RowRank = props => {
  return (
    <Row className="colheader">
      <Col className="col-xs-1">
        <h4>{props.rank}</h4>
      </Col>
      <Col className="col-xs-1">
        <h4>{props.name}</h4>
      </Col>
      <Col className="col-xs-1 recent">
        <h4>{props.score}</h4>
      </Col>
    </Row>
  );
};

export default RowRank;
