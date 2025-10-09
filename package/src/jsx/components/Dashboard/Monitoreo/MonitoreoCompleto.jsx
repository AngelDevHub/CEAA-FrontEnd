import React from "react";
import loadable from "@loadable/component";
// import { Link } from 'react-router-dom';
import { Row, Col, Card } from "react-bootstrap";

import pMinDelay from "p-min-delay";

import PageTitle from "../../../layouts/PageTitle";

const Temperatura = loadable(() => pMinDelay(import("./Temperatura"), 500));
const Humedad = loadable(() => pMinDelay(import("./Humedad"), 500));
const NivelesNitrogeno = loadable(() => pMinDelay(import("./NivelesNitrogeno"), 500));
const Riego = loadable(() => pMinDelay(import("./Riego"), 500));


function ApexChart() {
   return (
      <div className="h-80">
         <PageTitle motherMenu="Charts" activeMenu="ApexChart" />
         <Row>
            <Col xl={6}>
               <Card>
                  <Card.Header>
                     <Card.Title>Bar Chart</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <Temperatura />
                  </Card.Body>
               </Card>
            </Col>
            <Col xl={6}>
               <Card>
                  <Card.Header>
                     <Card.Title>Bar Chart</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <Humedad />
                  </Card.Body>
               </Card>
            </Col>

            <Col xl={6}>
               <Card>
                  <Card.Header>
                     <Card.Title>Line</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <NivelesNitrogeno />
                  </Card.Body>
               </Card>
            </Col>
            <Col xl={6}>
               <Card>
                  <Card.Header>
                     <Card.Title>Line</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <Riego />
                  </Card.Body>
               </Card>
            </Col>

         </Row>
      </div>
   );
}

export default ApexChart;
