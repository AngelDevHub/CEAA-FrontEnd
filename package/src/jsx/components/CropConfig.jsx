import React, { useState } from 'react';
import axiosInstance from '../../services/AxiosInstance';

const PRESETS = {
  Rábano: {
    humedadMinima: 45.0,
    tempMaxima: 35.0,
    nitrogenoMax: 20.0,
    tiempoRiegoMin: 4000,
    tiempoRiegoMax: 12000,
    intervaloRiegos: 1800000
  },
  Tomate: {
    humedadMinima: 60.0,
    tempMaxima: 30.0,
    nitrogenoMax: 25.0,
    tiempoRiegoMin: 5000,
    tiempoRiegoMax: 15000,
    intervaloRiegos: 3600000
  },
  Lechuga: {
    humedadMinima: 70.0,
    tempMaxima: 25.0,
    nitrogenoMax: 15.0,
    tiempoRiegoMin: 3000,
    tiempoRiegoMax: 8000,
    intervaloRiegos: 1800000
  }
};

const DEFAULT_CUSTOM = {
  humedadMinima: 0,
  tempMaxima: 0,
  nitrogenoMax: 0,
  tiempoRiegoMin: 0,
  tiempoRiegoMax: 0,
  intervaloRiegos: 0
};

export const CropConfig = () => {
  const [selectedCrop, setSelectedCrop] = useState('Rábano');
  const [formData, setFormData] = useState(PRESETS['Rábano']);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSelectChange = (e) => {
    const crop = e.target.value;
    setSelectedCrop(crop);
    
    if (crop === 'Personalizado') {
      setFormData(DEFAULT_CUSTOM);
    } else {
      setFormData(PRESETS[crop]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleApply = async () => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      const response = await axiosInstance.put('/invernadero/configuracion', formData);
      
      if (response.data.success) {
        setStatus({ type: 'success', message: '¡Configuración enviada al ESP32 con éxito!' });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'danger', message: 'Error al enviar la configuración.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header bg-primary text-white">
        <h4 className="card-title mb-0 text-white">Configuración del Cultivo (ESP32)</h4>
      </div>
      <div className="card-body">
        
        {status.message && (
          <div className={`alert alert-${status.type}`} role="alert">
            {status.message}
          </div>
        )}

        <div className="mb-4">
          <label className="form-label fw-bold">Seleccionar Tipo de Cultivo:</label>
          <select 
            className="form-select form-control" 
            value={selectedCrop} 
            onChange={handleSelectChange}
          >
            {Object.keys(PRESETS).map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
            <option value="Personalizado">Personalizado (Manual)</option>
          </select>
        </div>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Humedad Mínima (%)</label>
            <input 
              type="number" 
              className="form-control" 
              name="humedadMinima"
              value={formData.humedadMinima}
              onChange={handleInputChange}
              disabled={selectedCrop !== 'Personalizado'}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Temp. Máxima (°C)</label>
            <input 
              type="number" 
              className="form-control" 
              name="tempMaxima"
              value={formData.tempMaxima}
              onChange={handleInputChange}
              disabled={selectedCrop !== 'Personalizado'}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Nitrógeno Max.</label>
            <input 
              type="number" 
              className="form-control" 
              name="nitrogenoMax"
              value={formData.nitrogenoMax}
              onChange={handleInputChange}
              disabled={selectedCrop !== 'Personalizado'}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Tiempo Riego Min (ms)</label>
            <input 
              type="number" 
              className="form-control" 
              name="tiempoRiegoMin"
              value={formData.tiempoRiegoMin}
              onChange={handleInputChange}
              disabled={selectedCrop !== 'Personalizado'}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Tiempo Riego Max (ms)</label>
            <input 
              type="number" 
              className="form-control" 
              name="tiempoRiegoMax"
              value={formData.tiempoRiegoMax}
              onChange={handleInputChange}
              disabled={selectedCrop !== 'Personalizado'}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Intervalo de Riegos (ms)</label>
            <input 
              type="number" 
              className="form-control" 
              name="intervaloRiegos"
              value={formData.intervaloRiegos}
              onChange={handleInputChange}
              disabled={selectedCrop !== 'Personalizado'}
            />
          </div>
        </div>

        <div className="mt-4 text-end">
          <button 
            className="btn btn-success px-4 py-2" 
            onClick={handleApply}
            disabled={loading}
          >
            {loading ? 'Aplicando...' : 'Aplicar al ESP32'}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default CropConfig;
