# Auditoría de copy · Landing Liiot

Revisa dos cosas: el copy que hoy está en producción y el que propone `docs/plan-copy.md`. Se evalúa con los criterios de los copywriters de referencia, se revisan errores de cohesión y coherencia, se mapea el storytelling completo y se lista qué debe validar el diseño.

**Severidad:** 🔴 Crítico (rompe confianza o conversión) · 🟠 Alto · 🟡 Medio · ⚪ Bajo

---

## 1. Criterios de los copywriters de referencia

| Autor | Criterio | Landing actual | Plan propuesto |
|---|---|---|---|
| **Eugene Schwartz** · *Breakthrough Advertising* | Escribir según el nivel de conciencia del lector. Quien llega desde LinkedIn o un referido ya siente el problema y aún no conoce la solución | ❌ Abre con una promesa abstracta ("tu futuro") | 🟡 Mejora en El reto. El hero sigue sin nombrar el problema ni la solución |
| **David Ogilvy** | El titular hace el 80 % del trabajo. Especificidad sobre adjetivos | ❌ El H1 no dice qué vende Liiot | 🟡 El cuerpo del hero todavía no dice "software" |
| **Joseph Sugarman** · *slippery slide* | Cada frase existe para que se lea la siguiente | 🟡 Saltos de tono entre secciones | ✅ La escena de El reto engancha. 🟠 El panel 02 repite el método y frena el ritmo |
| **Claude Hopkins** · *Scientific Advertising* | Dar la "razón por la que" se cumple la promesa y respaldarla con datos | ❌ No hay ningún dato | ❌ Sigue pendiente el dato del caso SG-SST |
| **Donald Miller** · *StoryBrand* | El cliente es el héroe y la marca es la guía, con empatía y autoridad. Plan claro, llamado, lo que se pierde y cómo se ve el éxito | 🟡 Hay héroe y plan. Faltan autoridad y lo que se pierde | 🟡 Hay empatía. Faltan autoridad y lo que se pierde (ver §3) |
| **Joanna Wiebe** · Copyhackers | Usar la voz del cliente (VOC) y hablarle a una sola persona | ❌ Voz de marca | 🟡 La escena es inventada. Hay que validarla con frases reales de clientes |
| **Robert Cialdini** · *Influence* | Prueba social, autoridad y reciprocidad | ❌ Nada | 🟡 Propuesto y pendiente |

**Lectura general:** el plan corrige el tono y la empatía. Lo que más falta ahora es **claridad en el hero, autoridad de una empresa nueva y prueba**. Son los tres puntos que más pesan en la conversión.

---

## 2. Errores encontrados

### 2.1 Errores de coherencia con la estrategia

| # | Sev. | Dónde | Error | Corrección |
|---|---|---|---|---|
| C1 | 🔴 | Equipo, panel Filosofía | Las fotos son de stock (Unsplash), pero el alt dice "El equipo de Liiot revisando código juntos". Los retratos con nombres reales también son de stock | Fotos reales del equipo antes de publicar. Una página que vende empatía y cercanía pierde toda credibilidad si el lector descubre que el "equipo" es de stock |
| C2 | 🔴 | Hero (plan) | El cuerpo propuesto habla de Liiot en la segunda frase ("Liiot es una nueva empresa de tecnología que construye...") y rompe el principio 4 (tú > nosotros) | "Diseñamos software a medida que le devuelve horas a tu equipo para que vuelva a pensar en lo que viene." Lo de empresa nueva pasa a la sección Equipo, donde funciona como autoridad |
| C3 | 🟠 | Plan · principio 5 | Dice que la frase "El problema nunca fue la tecnología…" se queda como tesis. El rediseño de El reto la saca de la landing | Actualizar el principio 5: la tesis ahora es "Nos mueve que tu equipo vuelva a tener tiempo para lo que importa." |
| C4 | 🟠 | Proyectos (plan) | "Equipos que hoy trabajan con más tiempo y más tranquilidad" es una afirmación sin prueba. Además Bleepy está en "Coming soon" y no ha liberado tiempo a nadie | Sub: "El primer equipo que acompañamos ya dedica menos horas al papeleo de seguridad laboral." Bleepy se presenta como "Lo que estamos construyendo · Próximamente" |
| C5 | 🟠 | Principio 8 "Lo nuevo como ventaja" | Está definido pero ningún texto propuesto lo aplica | Llevarlo a Equipo: "Liiot es una empresa nueva. Por eso cada proyecto lo llevan sus fundadores de principio a fin." |
| C6 | 🟡 | Bleepy | El botón "Unirme a la lista de espera" lleva a `#agendar`, la sección para agendar la charla. La promesa del botón no coincide con el destino | Formulario de lista de espera propio, o cambiar el texto a "Cuéntanos si te interesa" |
| C7 | 🟡 | Hero | El CTA secundario propuesto "Mira cómo lo hacemos" lleva a `#el-reto`, donde se habla del problema y no del método | "Mira por qué lo hacemos" hacia `#el-reto`, o mantener el texto y enlazar a `#como-trabajamos` |

### 2.2 Errores de cohesión (cómo se conectan las piezas)

| # | Sev. | Dónde | Error | Corrección |
|---|---|---|---|---|
| H1 | 🟠 | Panel 02 vs. Cómo trabajamos | "Escuchamos cómo trabaja tu gente, encontramos lo que le quita horas y lo convertimos en una herramienta…" resume los tres pasos del método justo antes de que aparezcan. El lector lee lo mismo dos veces | El panel 02 cuenta la motivación y el método cuenta el cómo: "Cada herramienta que hacemos empieza con una pregunta: ¿cuántas horas le va a devolver a tu gente? Si la respuesta no nos convence, seguimos buscando." |
| H2 | 🟠 | Hero interactivo | Las combinaciones del H1 producen frases incorrectas: "Construimos tu tranquilidad a tu lado" (tu… tu), "Diseñamos tu tiempo de verdad", "Impulsamos tu equipo en equipo" | Fijar "Construimos" y "contigo". Rotar solo la palabra central: `futuro · tiempo · bienestar · tranquilidad` |
| H3 | 🟡 | "Tiempo" en toda la página | La palabra "tiempo" aparece en hero, El reto, Filosofía, método ×2 y CTA final. Repetida pierde fuerza | Alternar con imágenes concretas: horas, viernes, reportes, la semana, salir a tiempo |
| H4 | 🟡 | "Lo que importa" | Aparece en la tesis del panel 02 y en el H2 del CTA final. Además es una abstracción | Dejarla solo en la tesis. CTA final: "Empieza a recuperar las horas de tu equipo" |
| H5 | 🟡 | Método paso 2 | El texto principal dice "Cada semana ves algo funcionando" y el primer punto repite "Avances visibles cada semana" | Punto 1: "Pruebas cada avance con tu equipo real" |
| H6 | 🟡 | Método paso 2 vs. Equipo | "Hablas directo con quien construye" y "hablarás directamente con nosotros" dicen lo mismo en dos secciones | Dejarlo en Equipo, donde está la prueba (las caras). En el método, punto 2: "Decides las prioridades con nosotros" |
| H7 | 🟡 | CTA | El plan propone un solo verbo, pero usa "Agenda una charla", "Agenda tu charla" y "Quiero algo así para mi empresa" | "Agenda una charla" en hero, menú, CTA intermedio y CTA final. "Quiero algo así para mi empresa" solo en el caso SG-SST, como CTA contextual |
| H8 | ⚪ | Footer | "Tecnología para construir un mejor futuro" es abstracta y contradice el principio 3 | "Software a medida para que tu equipo recupere sus horas." |

### 2.3 Errores de forma, idioma y confianza

| # | Sev. | Dónde | Error | Corrección |
|---|---|---|---|---|
| F1 | 🟠 | Footer | "Privacidad" y "Términos" apuntan a `#`. En Colombia la Ley 1581 exige una política de tratamiento de datos si se recogen datos | Publicar ambas páginas |
| F2 | 🟠 | Contacto | El correo es `hola@liiot.dev` y el dominio es `liiot.app`. `contact.ts` marca LinkedIn e Instagram como placeholders | Unificar dominio y verificar que las redes existan |
| F3 | 🟡 | Bleepy | Mezcla de idiomas: "Coming soon" y "creadores & empresas" | "Próximamente" y "creadores y empresas" |
| F4 | ⚪ | Plan · Escena de El reto | "Cuadrando el reporte" es una expresión colombiana | Se entiende en la región. Validar si el público objetivo es internacional |

---

## 3. Storytelling completo

### 3.1 Recorrido actual vs. propuesto (StoryBrand + PAS)

| Etapa | Sección | Pregunta del lector | Estado en el plan | Qué falta |
|---|---|---|---|---|
| 1. Personaje con un deseo | Hero | ¿Esto es para mí? | 🟡 El deseo (tiempo y futuro) está. Falta decir qué se ofrece | Nombrar "software a medida" (C2) |
| 2. Problema externo | El reto · escena | ¿Me entienden? | ✅ Tareas repetidas, reportes, horas | Validar con frases reales de clientes |
| 2b. Problema interno | El reto · validación | ¿Cómo me siento? | ✅ El cansancio y el cuidado por lo construido | — |
| 2c. Problema filosófico | Panel 02 · tesis | ¿Por qué no debería ser así? | ✅ "Tu equipo merece tiempo para lo que importa" | — |
| 3. Guía con empatía | El reto → Panel 02 | ¿Les importa? | ✅ "Ahí empieza nuestro trabajo" | — |
| 3b. Guía con autoridad | Proyectos + Equipo | ¿Pueden hacerlo? | ❌ Sin datos, fotos de stock, empresa nueva sin argumento | Dato SG-SST, testimonio, fotos reales, principio 8 aplicado (C5) |
| 4. Plan | Cómo trabajamos | ¿Qué pasa si acepto? | ✅ Tres pasos claros | Quitar repeticiones (H5, H6) |
| 5. Llamado a la acción | CTAs | ¿Qué hago ahora? | 🟡 Verbo único definido. Falta confirmar el microcopy | Duración y costo de la charla |
| 6. Lo que se pierde | — | ¿Qué pasa si no hago nada? | ❌ No existe | Una línea en El reto, después de la escena: "Cada mes así son decenas de horas que no vuelven." |
| 7. Éxito | Hero (imagen) + CTA final | ¿Cómo se ve mi vida después? | 🟡 Solo implícito | En el CTA final, una línea que pinte el después: "Imagina tu próxima semana con esas horas de vuelta." |

### 3.2 Objeciones sin responder

Los grandes copywriters responden las objeciones antes de pedir la acción. Hoy ninguna está cubierta. Se recomienda un bloque corto de preguntas antes del CTA final:

1. **¿Cuánto cuesta?** Rango o forma de cobro.
2. **¿Cuánto tarda ver algo funcionando?** Primer avance en X semanas.
3. **Ya tengo un sistema. ¿Lo tengo que botar?** Integración con lo existente.
4. **¿Por qué confiar en una empresa nueva?** Fundadores en cada proyecto, avances semanales visibles y el caso SG-SST.

---

## 4. Qué debe revisar el diseño

El diseño también comunica. Estos puntos se validan en pantalla y no solo en el texto.

### 4.1 Jerarquía y lectura
- [ ] **Primer pantallazo (360 px y 1366 px):** H1, cuerpo y CTA primario visibles sin hacer scroll.
- [ ] **Test de 5 segundos:** mostrar el hero a 5 personas. ¿Saben qué vende Liiot y qué deben hacer?
- [ ] **Largo de línea:** la escena de El reto se lee mejor entre 55 y 70 caracteres por línea (`max-w-[60ch]` aprox.).
- [ ] **Tamaño de texto corrido:** la escena reemplaza tarjetas grandes. Mínimo 18 px en desktop para no perder presencia.
- [ ] **H1 rotativo:** el estado inicial ("Construimos tu futuro contigo") debe leerse completo antes de que rote. Revisar que la rotación automática no distraiga del CTA.

### 4.2 Congruencia imagen ↔ texto
- [ ] **Fotos reales del equipo** en Equipo y Filosofía (C1).
- [ ] **Foto de El reto:** una persona trabajando tarde con tono cálido. Que se sienta comprensión y no drama.
- [ ] **Imagen del hero:** hoy son dos mujeres saltando en la calle. Comunica alegría, pero no se conecta con un equipo de trabajo. Evaluar una imagen de un equipo que sale a tiempo o comparte fuera de la oficina.
- [ ] **Wipe violeta → naranja:** acompaña el paso de "lo que vives" a "lo que nos mueve". Verificar que el giro "Ahí empieza nuestro trabajo" quede justo antes del corte.

### 4.3 Dependencias técnicas del rediseño de El reto
- [ ] `src/scripts/landing-motion.ts` (líneas 65 y 129–132) anima `#villain-pivot`, `#story-bridge` y `.js-villain-item`. Hay que actualizarlo cuando se quiten esos elementos.
- [ ] `OurStory.astro` marca la palabra "problema" con `data-annotate`. La nueva tesis no la tiene. Mover la anotación a "tiempo".
- [ ] `src/lib/philosophy.ts` y el bloque de filosofía de `public/llms.txt`.

### 4.4 Conversión y confianza
- [ ] CTA primario con el mismo estilo y texto en todas las ubicaciones.
- [ ] CTA intermedio después de Cómo trabajamos.
- [ ] Microcopy debajo de cada botón principal.
- [ ] Destino coherente para cada botón (C6, C7).
- [ ] Links legales y correo con el dominio correcto (F1, F2).
- [ ] UTM por ubicación en el enlace del calendario.

### 4.5 Accesibilidad
- [ ] Contraste AA del texto sobre el mesh gradient del panel 02 y sobre el naranja del CTA final.
- [ ] Botones del H1 rotativo con `aria-label` claros. Un lector de pantalla debe oír una frase estable.
- [ ] Animación palabra por palabra respetando `prefers-reduced-motion` (ya existe; verificar con el nuevo texto).

---

## 5. Prioridad de corrección

1. 🔴 **C1** fotos reales · **C2** hero claro y centrado en el lector
2. 🟠 **Autoridad y prueba:** dato SG-SST, testimonio, principio 8 en Equipo (C4, C5)
3. 🟠 **Cohesión:** panel 02 sin repetir el método (H1), H1 rotativo sin combinaciones rotas (H2), principio 5 actualizado (C3)
4. 🟠 **Confianza:** legales y dominio (F1, F2)
5. 🟡 **Storytelling:** lo que se pierde, imagen de éxito y bloque de objeciones
6. 🟡 **Pulido:** repeticiones (H3–H8), idioma (F3), destinos de CTA (C6, C7)
