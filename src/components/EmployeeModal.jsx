import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  TIPO_MOVIMIENTO, NACIONALIDAD, GENERO, CONDICION_LABORAL, 
  NIVEL_EDUCATIVO, PROFESION 
} from '../constants';

import ReceiptModal from './ReceiptModal';

const initialState = {
  tipoMovimiento: "160",
  oficina: "1",
  nacionalidad: "57",
  cedula: "",
  nombresApellidos: "",
  fechaNacimiento: "",
  genero: "163",
  condicionLaboral: "94",
  cargo: "",
  nivelEducativo: "111",
  profesion: "264",
  fechaIngreso: "",
  salario: "",
  fechaEgreso: "",
  montoDescuento: "",
  motivoDescuento: "",
  bonoQuincenal: "",
  sso: "6.00",
  faov: "6.50",
  spf: "1.50"
};

export default function EmployeeModal({ isOpen, onClose, onSave, employeeToEdit }) {
  const [formData, setFormData] = useState(initialState);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        ...initialState,
        ...employeeToEdit,
        sso: employeeToEdit.sso || "6.00",
        faov: employeeToEdit.faov || "6.50",
        spf: employeeToEdit.spf || "1.50"
      });
    } else {
      setFormData(initialState);
    }
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>{employeeToEdit ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}</h2>
            <button onClick={onClose} className="close-btn">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                
                <div className="form-group">
                  <label>Nombres y Apellidos</label>
                  <input required type="text" name="nombresApellidos" value={formData.nombresApellidos} onChange={handleChange} className="form-control" placeholder="Ej. Juan Pérez" />
                </div>

                <div className="form-group">
                  <label>Nacionalidad</label>
                  <select name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className="form-control">
                    {Object.entries(NACIONALIDAD).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Cédula de Identidad</label>
                  <input required type="text" name="cedula" value={formData.cedula} onChange={handleChange} className="form-control" placeholder="Ej. 12345678" />
                </div>

                <div className="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input required type="text" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="form-control" placeholder="DD-MM-YYYY" />
                </div>

                <div className="form-group">
                  <label>Género</label>
                  <select name="genero" value={formData.genero} onChange={handleChange} className="form-control">
                    {Object.entries(GENERO).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tipo de Movimiento</label>
                  <select name="tipoMovimiento" value={formData.tipoMovimiento} onChange={handleChange} className="form-control">
                    {Object.entries(TIPO_MOVIMIENTO).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Condición Laboral</label>
                  <select name="condicionLaboral" value={formData.condicionLaboral} onChange={handleChange} className="form-control">
                    {Object.entries(CONDICION_LABORAL).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Cargo</label>
                  <input required type="text" name="cargo" value={formData.cargo} onChange={handleChange} className="form-control" placeholder="Ej. Analista" />
                </div>

                <div className="form-group">
                  <label>Nivel Educativo</label>
                  <select name="nivelEducativo" value={formData.nivelEducativo} onChange={handleChange} className="form-control">
                    {Object.entries(NIVEL_EDUCATIVO).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Profesión</label>
                  <select name="profesion" value={formData.profesion} onChange={handleChange} className="form-control">
                    {Object.entries(PROFESION).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Fecha de Ingreso</label>
                  <input required type="text" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange} className="form-control" placeholder="DD-MM-YYYY" />
                </div>

                <div className="form-group">
                  <label>Salario Mensual (en Dólares $) *</label>
                  <input 
                    type="number" 
                    name="salario" 
                    step="0.01"
                    value={formData.salario} 
                    onChange={handleChange} 
                    required
                    className="form-control"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Bono Quincenal (en Dólares $)</label>
                  <input type="number" step="0.01" name="bonoQuincenal" value={formData.bonoQuincenal || ''} onChange={handleChange} className="form-control" />
                </div>

                <div className="form-group">
                  <label>Departamento (Sede)</label>
                  <input required type="text" name="oficina" value={formData.oficina} onChange={handleChange} className="form-control" />
                </div>

                <h4 style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '0.5rem' }}>Deducciones Fijas (En Bs)</h4>
                
                <div className="form-group">
                  <label>SSO (Bs)</label>
                  <input type="number" step="0.01" name="sso" value={formData.sso} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group">
                  <label>FAOV (Bs)</label>
                  <input type="number" step="0.01" name="faov" value={formData.faov} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group">
                  <label>SPF (Bs)</label>
                  <input type="number" step="0.01" name="spf" value={formData.spf} onChange={handleChange} className="form-control" />
                </div>

                <div className="form-group">
                  <label>Fecha de Egreso</label>
                  <input type="text" name="fechaEgreso" value={formData.fechaEgreso} onChange={handleChange} className="form-control" placeholder="DD-MM-YYYY" />
                </div>

              </div>
            </div>
            
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              {employeeToEdit ? (
                <button type="button" onClick={() => setIsReceiptModalOpen(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>
                  <FileText size={18} /> Generar Recibo PDF
                </button>
              ) : (
                <div></div> // Empty spacer if no employee to edit
              )}
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  {employeeToEdit ? 'Guardar Cambios' : 'Registrar Empleado'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {isReceiptModalOpen && (
        <ReceiptModal 
          isOpen={isReceiptModalOpen} 
          onClose={() => setIsReceiptModalOpen(false)} 
          employee={formData} 
        />
      )}
    </>
  );
}
