import React, { useEffect, useState } from 'react';
import { supabase } from '../Supabase/client';
import AddProductForm from './AddProductForm';
import { FaSearch, FaEdit, FaTrash, FaBox, FaUser, FaCog, FaQuestion, FaThList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const navigate = useNavigate();

  const obtenerInventario = async () => {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) {
      console.error('Error al obtener inventario:', error.message);
    } else {
      setProductos(data);
    }
  };

  useEffect(() => {
    obtenerInventario();
  }, []);

  const filtrados = productos.filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const eliminarProducto = async (id) => {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) {
      console.error('Error al eliminar producto:', error.message);
    } else {
      obtenerInventario();
    }
  };

  const editarProducto = (producto) => {
    setProductoEditar(producto);
    setMostrarFormulario(true);
  };

  // 🔒 Función para cerrar sesión
  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
      alert('No se pudo cerrar sesión.');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Sidebar funcional */}
      <aside style={{ width: '250px', backgroundColor: '#333', color: 'white', padding: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <FaBox size={48} />
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <FaThList /> Dashboard
          </p>
          <p style={{ cursor: 'pointer' }} onClick={() => navigate('/productos')}>
            <FaBox /> Productos
          </p>
          <p style={{ cursor: 'pointer' }} onClick={() => navigate('/historial')}>
            <FaThList /> Historial
          </p>
        </nav>
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
          <p><FaUser /> Usuario</p>
          <p><FaCog /> Ajustes</p>
          <p><FaQuestion /> Ayuda</p>
          <p style={{ cursor: 'pointer', color: '#f44336', marginTop: '1rem' }} onClick={onLogout}>
            🔓 Cerrar sesión
          </p>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flexGrow: 1, padding: '2rem', backgroundColor: '#121212', color: 'white' }}>
        <h1>Lista de Productos</h1>
        <div style={{ display: 'flex', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Buscar producto"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', backgroundColor: '#333', border: 'none', color: 'white' }}
          />
          <button
            style={{ marginLeft: '1rem', padding: '0.5rem 1rem', backgroundColor: '#555', color: 'white', border: 'none', cursor: 'pointer' }}
            onClick={() => {
              setProductoEditar(null);
              setMostrarFormulario(true);
            }}
          >
            Agregar
          </button>
        </div>

        <table width="100%" border="1" cellPadding="10" cellSpacing="0" style={{ backgroundColor: '#1e1e1e' }}>
          <thead style={{ backgroundColor: '#333' }}>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Precio</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((producto, index) => (
              <tr key={producto.id || index}>
                <td>{index + 1}</td>
                <td>{producto.nombre}</td>
                <td>{producto.categoria}</td>
                <td>{producto.stock}</td>
                <td>${producto.precio}</td>
                <td>{producto.descripcion}</td>
                <td>
                  <FaEdit
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => editarProducto(producto)}
                  />
                  <FaTrash
                    style={{ cursor: 'pointer', color: 'red' }}
                    onClick={() => eliminarProducto(producto.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* Modal de agregar o editar */}
      {mostrarFormulario && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '10px',
            width: '500px',
            boxShadow: '0 0 15px rgba(0,0,0,0.3)'
          }}>
            <AddProductForm
              productoEditar={productoEditar}
              onClose={() => {
                setMostrarFormulario(false);
                obtenerInventario();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
