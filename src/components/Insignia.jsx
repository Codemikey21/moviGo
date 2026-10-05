import './Insignia.css'

// Etiqueta pequeña sobre los productos: "Nuevo" o "Más vendido".
function Insignia({ texto }) {
  if (!texto) return null

  const variante = texto === 'Nuevo' ? 'nuevo' : 'vendido'

  return <span className={`insignia insignia--${variante}`}>{texto}</span>
}

export default Insignia
