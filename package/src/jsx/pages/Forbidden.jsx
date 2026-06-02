import React from 'react';
import { Alert } from 'react-bootstrap';

export default function Forbidden() {
  return (
    <div className="row">
      <div className="col-12">
        <Alert variant="danger" className="mt-3">
          <strong>Acceso restringido.</strong> No tienes permisos para ver esta sección.
        </Alert>
      </div>
    </div>
  );
}
