import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Activity, Plus, Search, Upload, FileBarChart, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { 
  TIPO_MOVIMIENTO, NACIONALIDAD, GENERO, CONDICION_LABORAL, 
  NIVEL_EDUCATIVO, PROFESION, DATOS_INICIALES 
} from './constants';
import EmployeeModal from './components/EmployeeModal';
import ReportesView from './components/ReportesView';
import SedesView from './components/SedesView';
import BatchReceiptsView from './components/BatchReceiptsView';
import NominaTotalView from './components/NominaTotalView';

function App() {
  const API_URL = `/api`;
  const [employees, setEmployees] = useState([]);
  const [currentView, setCurrentView] = useState('nomina');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/empleados`);
      setEmployees(response.data);
    } catch (error) {
      console.error("Error al cargar los empleados:", error);
    }
  };

  const handleSaveEmployee = async (employee) => {
    try {
      if (employee.id) {
        await axios.put(`${API_URL}/empleados/${employee.id}`, employee);
        setEmployees(employees.map(emp => emp.id === employee.id ? employee : emp));
      } else {
        const response = await axios.post(`${API_URL}/empleados`, employee);
        setEmployees([...employees, response.data]);
      }
      setIsModalOpen(false);
      setEmployeeToEdit(null);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al conectar con la base de datos.");
    }
  };

  const handleEdit = (employee) => {
    setEmployeeToEdit(employee);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (data.length > 1) {
        const newEmployees = [];
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (row.length === 0 || !row[4]) continue;

          const empData = {
            tipoMovimiento: row[0]?.toString() || "160",
            oficina: row[1]?.toString() || "1",
            nacionalidad: row[2]?.toString() || "57",
            cedula: row[3]?.toString(),
            nombresApellidos: row[4],
            fechaNacimiento: row[5] || "",
            genero: row[6]?.toString() || "163",
            condicionLaboral: row[7]?.toString() || "94",
            cargo: row[8] || "",
            nivelEducativo: row[9]?.toString() || "111",
            profesion: row[10]?.toString() || "264",
            fechaIngreso: row[11] || "",
            salario: row[12]?.toString() || "0",
            fechaEgreso: row[13] || "",
          };

          try {
            const response = await axios.post(`${API_URL}/empleados`, empData);
            newEmployees.push(response.data);
          } catch (error) {
            console.error("Error importing row", error);
          }
        }
        
        setEmployees(prev => [...prev, ...newEmployees]);
      }
    };
    reader.readAsBinaryString(file);
    // Reset input
    e.target.value = null;
  };

  // Filtrado
  const filteredEmployees = employees.filter(emp => 
    emp.nombresApellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cedula.includes(searchTerm) ||
    emp.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Exportar TXT para SUDEASEG
  const exportToTxt = () => {
    // Función para asegurar formato DD-MM-YYYY (convierte / a -)
    const formatFecha = (fecha) => {
      if (!fecha) return "";
      return fecha.replace(/\//g, "-");
    };

    let txtContent = "";
    employees.forEach(emp => {
      const row = [
        emp.tipoMovimiento,
        emp.oficina,
        emp.nacionalidad,
        emp.cedula,
        emp.nombresApellidos,
        formatFecha(emp.fechaNacimiento),
        emp.genero,
        emp.condicionLaboral,
        emp.cargo,
        emp.nivelEducativo,
        emp.profesion,
        formatFecha(emp.fechaIngreso),
        parseFloat(emp.salario || 0).toFixed(2).padStart(6, '0'),
        formatFecha(emp.fechaEgreso)
      ].join(";");
      txtContent += row + "\r\n";
    });

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nomina_sudeaseg_${new Date().getTime()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar Excel
  const exportToExcel = () => {
    const dataToExport = employees.map(emp => ({
      'Tipo de Movimiento': emp.tipoMovimiento,
      'Oficina': emp.oficina,
      'Nacionalidad': emp.nacionalidad,
      'Cédula': emp.cedula,
      'Nombres y Apellidos': emp.nombresApellidos,
      'Fecha de Nacimiento': emp.fechaNacimiento,
      'Género': emp.genero,
      'Condición Laboral': emp.condicionLaboral,
      'Cargo': emp.cargo,
      'Nivel Educativo': emp.nivelEducativo,
      'Profesión': emp.profesion,
      'Fecha de Ingreso': emp.fechaIngreso,
      'Salario': parseFloat(emp.salario || 0),
      'Fecha de Egreso': emp.fechaEgreso || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Empleados");
    XLSX.writeFile(workbook, `nomina_salud_zulia_${new Date().getTime()}.xlsx`);
  };

  // Stats
  const activeEmployees = employees.filter(emp => emp.tipoMovimiento === "160").length;
  const totalPayroll = employees.reduce((acc, emp) => acc + parseFloat(emp.salario || 0), 0);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Activity color="var(--primary-color)" size={32} />
          <h2>Salud Zulia</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className={`nav-item ${currentView === 'nomina' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('nomina'); }}>
            <Users size={20} />
            <span>Nómina</span>
          </a>
          <a href="#" className={`nav-item ${currentView === 'reportes' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('reportes'); }}>
            <FileBarChart size={20} />
            <span>Reportes</span>
          </a>
          <a href="#" className={`nav-item ${currentView === 'sedes' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('sedes'); }}>
            <Printer size={20} />
            <span>Imprimir Lotes</span>
          </a>
          <a href="#" className={`nav-item ${currentView === 'nomina-total' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('nomina-total'); }}>
            <DollarSign size={20} />
            <span>Nómina Total (Excel)</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <h1>
            {currentView === 'nomina' ? 'Control de Nómina' : 
             currentView === 'reportes' ? 'Reportes de Ingresos' : 
             currentView === 'nomina-total' ? 'Nómina Total (Vista Excel)' :
             'Impresión de Recibos (Lotes)'}
          </h1>
          <div className="header-actions">
            {currentView === 'nomina' && (
              <>
                <button className="btn btn-outline" onClick={exportToTxt}>
                  <Upload size={18} /> Exportar TXT
                </button>
                <button className="btn btn-outline" onClick={exportToExcel}>
                  <Upload size={18} /> Exportar Excel
                </button>
                <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                  <Upload size={18} /> Importar Excel
                  <input type="file" accept=".xlsx, .xls, .csv" style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>
                <button className="btn btn-primary" onClick={() => {
                  setEmployeeToEdit(null);
                  setIsModalOpen(true);
                }}>
                  <Plus size={18} /> Nuevo Empleado
                </button>
              </>
            )}
          </div>
        </header>

        {currentView === 'reportes' ? (
          <ReportesView employees={employees} />
        ) : currentView === 'sedes' ? (
          <BatchReceiptsView employees={employees} />
        ) : currentView === 'nomina-total' ? (
          <NominaTotalView employees={employees} />
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><Users size={24} /></div>
                <div className="stat-info">
                  <h3>Total Empleados</h3>
                  <p>{employees.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Activity size={24} /></div>
                <div className="stat-info">
                  <h3>Empleados Activos</h3>
                  <p>{activeEmployees}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><DollarSign size={24} /></div>
                <div className="stat-info">
                  <h3>Nómina Estimada</h3>
                  <p>{totalPayroll.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="table-container">
              <div className="table-header">
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Directorio de Empleados</h2>
                <div className="search-box">
                  <Search size={18} color="var(--text-muted)" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre, cédula o cargo..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Empleado</th>
                      <th>Cédula</th>
                      <th>Cargo</th>
                      <th>Ingreso</th>
                      <th>Salario</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map(emp => (
                        <tr key={emp.id} onClick={() => handleEdit(emp)} style={{ cursor: 'pointer' }}>
                          <td>
                            <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>
                              {emp.nombresApellidos}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {PROFESION[emp.profesion] || 'Desconocido'}
                            </div>
                          </td>
                          <td>{NACIONALIDAD[emp.nacionalidad]}-{emp.cedula}</td>
                          <td>
                            <div style={{ fontWeight: '500' }}>{emp.cargo}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {CONDICION_LABORAL[emp.condicionLaboral]}
                            </div>
                          </td>
                          <td>{emp.fechaIngreso}</td>
                          <td style={{ fontWeight: '600' }}>{parseFloat(emp.salario || 0).toLocaleString('es-VE')}</td>
                          <td>
                            <span className={`badge ${emp.tipoMovimiento === '160' ? 'badge-active' : 'badge-inactive'}`}>
                              {TIPO_MOVIMIENTO[emp.tipoMovimiento]}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          No se encontraron empleados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '0.85rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', zIndex: 10 }}>
        © 2026 Jose Villalobos. Todos los derechos reservados.
      </footer>      {/* Modal */}
      <EmployeeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        employeeToEdit={employeeToEdit}
      />
    </div>
  );
}

export default App;
