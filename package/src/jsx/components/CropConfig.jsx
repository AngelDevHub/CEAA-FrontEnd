import React, { useEffect, useState } from 'react';
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

function detectPresetName(data) {
  if (!data) return null;
  for (const [name, values] of Object.entries(PRESETS)) {
    if (
      Number(data.humedadMinima) === values.humedadMinima &&
      Number(data.tempMaxima) === values.tempMaxima &&
      Number(data.nitrogenoMax) === values.nitrogenoMax
    ) {
      return name;
    }
  }
  return 'Personalizado';
}

export const CropConfig = () => {
  const [selectedCrop, setSelectedCrop] = useState('Rábano');
  const [formData, setFormData] = useState(PRESETS['Rábano']);
  const [loading, setLoading] = useState(false);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [currentConfig, setCurrentConfig] = useState(null);

  // BUG-012 FIX: Cargar configuración actual desde Firebase al montar
  useEffect(() => {
    const loadCurrentConfig = async () => {
      try {
        setLoadingCurrent(true);
        const response = await axiosInstance.get('invernadero/configuracion');
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          setCurrentConfig(data);

          // Detectar el preset activo y sincronizar el formulario
          const detected = detectPresetName(data);
          if (detected && detected !== 'Personalizado') {
            setSelectedCrop(detected);
            setFormData(PRESETS[detected]);
          } else if (detected === 'Personalizado') {
            setSelectedCrop('Personalizado');
            setFormData({
              humedadMinima: Number(data.humedadMinima) || 0,
              tempMaxima: Number(data.tempMaxima) || 0,
              nitrogenoMax: Number(data.nitrogenoMax) || 0,
              tiempoRiegoMin: Number(data.tiempoRiegoMin) || 0,
              tiempoRiegoMax: Number(data.tiempoRiegoMax) || 0,
              intervaloRiegos: Number(data.intervaloRiegos) || 0
            });
          }
        }
      } catch (error) {
        console.error('Error al cargar configuración actual:', error);
      } finally {
        setLoadingCurrent(false);
      }
    };

    loadCurrentConfig();
  }, []);

  const handleSelectChange = (e) => {
    const crop = e.target.value;
    setSelectedCrop(crop);
    
    if (crop === 'Personalizado') {
      setFormData(currentConfig ? {
        humedadMinima: Number(currentConfig.humedadMinima) || 0,
        tempMaxima: Number(currentConfig.tempMaxima) || 0,
        nitrogenoMax: Number(currentConfig.nitrogenoMax) || 0,
        tiempoRiegoMin: Number(currentConfig.tiempoRiegoMin) || 0,
        tiempoRiegoMax: Number(currentConfig.tiempoRiegoMax) || 0,
        intervaloRiegos: Number(currentConfig.intervaloRiegos) || 0
      } : DEFAULT_CUSTOM);
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
      // BUG-005 FIX: Removido el slash inicial para que Axios use correctamente el baseURL
      const response = await axiosInstance.put('invernadero/configuracion', formData);
      
      if (response.data.success) {
        setStatus({ type: 'success', message: '¡Configuración enviada al ESP32 con éxito!' });
        setCurrentConfig({ ...formData });
      }
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || 'Error al enviar la configuración.';
      setStatus({ type: 'danger', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const activeCropName = currentConfig ? (detectPresetName(currentConfig) || 'Desconocido') : null;

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0 text-white">Configuración del Cultivo (ESP32)</h4>
          {activeCropName && !loadingCurrent && (
            <span className="badge bg-light text-primary">
              Activo: {activeCropName}
            </span>
          )}
        </div>
      </div>
      <div className="card-body">
        
        {status.message && (
          <div className={`alert alert-${status.type}`} role="alert">
            {status.message}
          </div>
        )}

        {loadingCurrent ? (
          <div className="text-muted mb-3">Cargando configuración actual del ESP32...</div>
        ) : null}

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

