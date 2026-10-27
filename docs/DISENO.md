# Diseño y reglas del juego

HabitHero convierte los hábitos diarios en un videojuego para aumentar la productividad personal y mostrar en qué áreas de la vida hace falta más atención.

## Reglas principales

- La **vida** es de 500 puntos y **no se regenera**.
- Cada **mal hábito** quita vida. Cuenta una vez por día (o una vez por semana, en los hábitos semanales).
- Cada **buen hábito** da XP a un área de la vida y Reales.
- Los **Reales** se gastan en una tienda de recompensas. Comprar no quita vida y no cuenta como hábito: el único freno es el precio.
- Cuando la vida llega a 0, el personaje queda **caído**: no gana XP ni Reales, no compra y no marca hábitos hasta cumplir un **reto de revivir**. Al revivir, la vida vuelve a 500.
- El día se rige por la hora de Colombia y cambia a medianoche.

### Vida que quitan los malos hábitos

| Nivel | Vida | Ejemplos |
|---|---|---|
| Leve | −5 | Revisar redes al despertar, beber poca agua, levantarse tarde |
| Normal | −10 | Más de 60 minutos de redes, procrastinar, trasnochar, comida chatarra, compras impulsivas, pedidos a domicilio innecesarios |
| Medio | −20 | Mentir, rendirse, endeudarse |
| Alto | −50 | Hábitos de alto riesgo para la salud |

Referencias: tres hábitos normales al día (−30) agotan la vida en unos 17 días; un solo desliz diario de −10 la agota en 50 días.

### XP y Reales de los buenos hábitos

| Nivel | XP | Reales | Frecuencia |
|---|---|---|---|
| Normal | 20 | $1.000 | Diario |
| Medio | 35 | $2.000 | Diario |
| Alto | 60 | $4.000 | Diario |
| Semanal | 100 | $10.000 | Una vez por semana |
| Semanal alto | 150 | $15.000 | Una vez por semana |
| Mensual | 300 | $40.000 | Una vez por mes |

Los Reales se expresan en pesos colombianos. Todos los valores son editables desde la pantalla de Ajustes.

### Rachas

Al cumplir un mismo hábito diario durante 7 días seguidos, ese hábito da **x1,25** de XP y de Reales. Si se falla un día, la racha de ese hábito vuelve a cero. Los días y el multiplicador son configurables.

### Niveles de las áreas

Las áreas son: Espiritual, Familia, Pareja, Social, Estudios y carrera, Salud, Creatividad, Finanzas y Aprendizaje. Para pasar del nivel *n* al *n+1* se necesitan **200 × n XP**. El área con menor nivel es la que más atención necesita.

### Reto de revivir

Se elige un reto de una lista definida de antemano y se cumple cuando la persona decide (si está enferma o lesionada, primero se recupera). Hay retos físicos y mentales, y la lista es editable.

## Economía

Un buen día (alrededor del 60% de cumplimiento) produce unos $24.000. La tienda usa precios altos a propósito:

| Recompensa | Precio |
|---|---|
| Postre o dulce | $15.000 |
| Una hora extra de redes | $15.000 |
| Día libre de ejercicio | $25.000 |
| Comida chatarra | $30.000 |
| Levantarse tarde | $35.000 |
| Maratón de series | $50.000 |
| Compra impulsiva | $150.000 |
| Salida especial | $200.000 |
| Día libre total sin culpa | $600.000 |

Las recompensas de mayor riesgo para la salud existen solo como configuración personal y no se incluyen en el repositorio.

### Jefes

| Jefe | XP | Reales |
|---|---|---|
| Jefe mensual (meta del mes) | 500 | $250.000 |
| Jefe grande (meta trimestral) | 1.500 | $1.000.000 |

Cada jefe tiene etapas y una barra de vida que baja a medida que se completan. Si el periodo termina sin derrotarlo, el jefe se escapa.

## Logros

27 logros con medallas de cinco niveles. Cada uno da Reales según su dificultad y se desbloquea automáticamente. Los logros son permanentes.

| Dificultad | Medalla | Reales |
|---|---|---|
| Fácil | Bronce | $10.000 |
| Medio | Plata | $30.000 |
| Difícil | Oro | $80.000 |
| Muy difícil | Rubí | $200.000 |
| Legendario | Legendaria | $500.000 |

| Categoría | Logros (condición) |
|---|---|
| Constancia | Primer paso (primer hábito); Semana perfecta (7 días con todos los hábitos diarios normales); 21 y 100 días seguidos de un mismo hábito; Imparable (30 días sin bajar de 300 de vida) |
| Hábitos específicos | 7 días sin exceso de redes; Primer mes de ejercicio (16 días en 30); Madrugador (14 días tendiendo la cama); Hidratado (30 días de agua); Lector (34 sesiones de lectura); Políglota (50 sesiones de inglés) |
| Niveles y áreas | Primer nivel; Nivel 5; Equilibrio (todas en nivel 3+); Sin puntos débiles (ninguna en nivel 1); Héroe completo (todas en nivel 10) |
| Dinero y tienda | Primer millón ganado; Ahorrador ($500.000 de saldo); Con moderación (7 días sin comprar) |
| Jefes y supervivencia | Cazador; Jefe grande derrotado; Racha de jefes (3 meses seguidos); Renacido (revivir); Intocable (60 días sin llegar a 0) |
| Hábitos malos | Semana limpia; Mes limpio (30 días sin hábitos de alto riesgo); Un mes sin pedidos a domicilio innecesarios |

## Marca

- **Nombre:** HabitHero. **Eslogan:** Construye tu leyenda.
- **Colores:** fondo `#0E0E11`, superficie `#1A1A1F`, texto crema `#FBF1E6`, vida y marca carmesí `#E5262B`, ámbar `#FF7A3D`, Reales dorado `#F5B83D` y progreso menta `#3DD6A0`.
- **Tipografías:** Fredoka para títulos y Nunito para el texto.
- **Lógica de color:** rojo es la vida y lo que la quita, dorado es el dinero, menta es el progreso.
