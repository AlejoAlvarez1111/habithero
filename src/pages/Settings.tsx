import AjustesJuego from '../components/ajustes/AjustesJuego'
import AjustesHabitos from '../components/ajustes/AjustesHabitos'
import AjustesLista from '../components/ajustes/AjustesLista'

export default function Settings() {
  return (
    <>
      <h2 className="titulo">Ajustes</h2>
      <p className="muted ajustes-intro">
        Los cambios de puntos y precios aplican de aquí en adelante. Lo que ya registraste no cambia.
      </p>

      <AjustesJuego />
      <AjustesHabitos />
      <AjustesLista tabla="shop_items" titulo="Tienda de recompensas" conPrecio />
      <AjustesLista tabla="revive_challenges" titulo="Retos de revivir" />
    </>
  )
}