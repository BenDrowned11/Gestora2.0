import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Supabase/client'; // Ruta de supabase
import { FaBox, FaUser, FaCog, FaQuestion, FaThList } from 'react-icons/fa';

const Historial = ({ onLogout }) => {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const fetchHistorial = async () => {
      const { data, error } = await supabase
        .from('historial')
        .select(`
          id,
          tipo_movimiento,
          cantidad,
          fecha,
          observaciones,
          productos (
            nombre
          )
        `)
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error al obtener historial:', error);
      } else {
        setHistorial(data);
      }
    };

    fetchHistorial();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>

      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#333', color: 'white', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <FaBox size={48} />
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
              <FaThList style={{ marginRight: '8px' }} /> Dashboard
            </p>
            <p style={{ cursor: 'pointer' }} onClick={() => navigate('/productos')}>
              <FaBox style={{ marginRight: '8px' }} /> Productos
            </p>
            <p style={{ cursor: 'pointer' }} onClick={() => navigate('/historial')}>
              <FaThList style={{ marginRight: '8px' }} /> Historial
            </p>
          </nav>
        </div>

        {/* Footer del sidebar */}
        <div>
          <p><FaUser style={{ marginRight: '8px' }} /> Usuario</p>
          <p><FaCog style={{ marginRight: '8px' }} /> Ajustes</p>
          <p><FaQuestion style={{ marginRight: '8px' }} /> Ayuda</p>
          <p style={{ cursor: 'pointer', color: '#f44336', marginTop: '1rem' }} onClick={onLogout}>
            🔓 Cerrar sesión
          </p>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flexGrow: 1, padding: '2rem' }}>
        <h1>Historial de Movimientos</h1>

        <table width="100%" border="1" cellPadding="10" cellSpacing="0">
          <thead style={{ backgroundColor: '#ddd' }}>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Producto</th>
              <th>Fecha</th>
              <th>Cantidad</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.tipo_movimiento}</td>
                <td>{item.productos?.nombre || 'N/A'}</td>
                <td>{new Date(item.fecha).toLocaleString()}</td>
                <td>{item.cantidad}</td>
                <td>{item.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </main>
    </div>
  );
};

export default Historial;
