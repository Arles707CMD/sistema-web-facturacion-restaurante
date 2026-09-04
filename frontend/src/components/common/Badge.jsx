// ===========================================
// COMPONENTE BADGE
// Etiqueta de estado reutilizable.
// Variantes: success, warning, danger, info, neutral.
// ===========================================

function Badge({ variante = 'neutral', children }) {
    return <span className={`badge badge-${variante}`}>{children}</span>;
}

export default Badge;