import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaUser, FaCog, FaQuestion, FaThList } from 'react-icons/fa';
import { supabase } from '../Supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductos();
    fetchMovimientos();
  }, []);

  const fetchProductos = async () => {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) {
      console.error('Error al obtener productos:', error.message);
    } else {
      setProductos(data);
    }
  };

  const fetchMovimientos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('historial')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener historial:', error.message);
    } else {
      setMovimientos(data);
    }
    setLoading(false);
  };

  const totalInventarios = productos.length;
  const totalStock = productos.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalRecibidos = movimientos
    .filter(m => m.tipo_movimiento === 'Ingreso')
    .reduce((acc, m) => acc + (m.cantidad || 0), 0);
  const totalEnviados = movimientos
    .filter(m => m.tipo_movimiento === 'Salida')
    .reduce((acc, m) => acc + (m.cantidad || 0), 0);
  const ultimoMovimiento = movimientos[0];

  const stockData = productos.map(p => ({
    nombre: p.nombre,
    stock: p.stock
  }));

  const movimientosData = [
    { name: 'Recibidos', value: totalRecibidos },
    { name: 'Enviados', value: totalEnviados },
  ];

  const COLORS = ['#4caf50', '#f44336'];

  const exportarReporteCompleto = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Reporte Completo de Inventario', 14, 20);

    // Resumen
    doc.setFontSize(14);
    doc.text('Resumen General', 14, 35);

    const resumen = [
      ["Total Productos", totalInventarios],
      ["Stock Total", totalStock],
      ["Recibidos", totalRecibidos],
      ["Enviados", totalEnviados]
    ];

    resumen.forEach((item, index) => {
      doc.text(`${item[0]}: ${item[1]}`, 14, 45 + index * 10);
    });

    // Productos
    doc.setFontSize(14);
    doc.text('Lista de Productos', 14, 90);

    autoTable(doc, {
      head: [["#", "Nombre", "Categoría", "Stock", "Precio", "Descripción"]],
      body: productos.map((p, index) => [
        index + 1,
        p.nombre,
        p.categoria || 'N/A',
        p.stock,
        p.precio ? `$${p.precio}` : 'N/A',
        p.descripcion || ''
      ]),
      startY: 100
    });

    let finalY = doc.lastAutoTable.finalY + 10;

    // Historial
    doc.setFontSize(14);
    doc.text('Historial de Movimientos', 14, finalY);

    autoTable(doc, {
      head: [["#", "Tipo", "Producto ID", "Fecha", "Cantidad", "Observaciones"]],
      body: movimientos.map((h, index) => [
        index + 1,
        h.tipo_movimiento,
        h.producto_id,
        new Date(h.fecha).toLocaleString(),
        h.cantidad,
        h.observaciones || ''
      ]),
      startY: finalY + 10
    });

    doc.save('reporte_inventario_completo.pdf');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#333', color: 'white', padding: '1rem', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <FaBox size={48} />
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}><FaThList /> Dashboard</p>
          <p style={{ cursor: 'pointer' }} onClick={() => navigate('/productos')}><FaBox /> Productos</p>
          <p style={{ cursor: 'pointer' }} onClick={() => navigate('/historial')}><FaThList /> Historial</p>
        </nav>
        <div style={{ position: 'absolute', bottom: '4.5rem', left: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p><FaUser /> Usuario</p>
          <p><FaCog /> Ajustes</p>
          <p><FaQuestion /> Ayuda</p>
          <p style={{ cursor: 'pointer', color: '#f44336', marginTop: '1rem' }} onClick={onLogout}>
            🔓 Cerrar sesión
          </p>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flexGrow: 1, padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#003366' }}>Tablero de inventario</h1>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            onClick={exportarReporteCompleto}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            📄 Descargar Reporte Completo
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '2rem' }}>
          <Card title="Total Inventarios" value={totalInventarios} />
          <Card title="Recibidos" value={totalRecibidos} />
          <Card title="En Stock" value={totalStock} />
          <Card title="Enviados" value={totalEnviados} />
        </div>

        <div style={{ display: 'flex', gap: '2rem', height: '300px' }}>
          <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '10px' }}>
            <h3 style={{ textAlign: 'center', color: '#003366' }}>Stock por producto</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={stockData}>
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#003366" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '10px' }}>
            <h3 style={{ textAlign: 'center', color: '#003366' }}>Movimientos</h3>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={movimientosData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {movimientosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {ultimoMovimiento && (
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#eef', borderRadius: '10px' }}>
            <h3>Último Movimiento:</h3>
            <p><strong>Tipo:</strong> {ultimoMovimiento.tipo_movimiento}</p>
            <p><strong>Producto ID:</strong> {ultimoMovimiento.producto_id}</p>
            <p><strong>Cantidad:</strong> {ultimoMovimiento.cantidad}</p>
            <p><strong>Fecha:</strong> {new Date(ultimoMovimiento.fecha).toLocaleString()}</p>
            <p><strong>Observaciones:</strong> {ultimoMovimiento.observaciones}</p>
          </div>
        )}
      </main>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div style={{ backgroundColor: '#003366', color: 'white', padding: '1rem 2rem', borderRadius: '10px', textAlign: 'center' }}>
    <h2>{value}</h2>
    <p>{title}</p>
  </div>
);

export default Dashboard;
