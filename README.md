## Lulas

Done with TDD

### Quiero ver ESTO SON LOS TEST! ZAPALLO!

- Células que puedan comerse entre ellas
  - Grande se come a pequeña y punto
- Empezamos con 100 Células
- Y que hagan flocking
  - Alineamiento
  - Cohesión
  - Separación

### UI

- Space pausa/play
- Click atrae
- Click derecho genera obstáculo

#### Level 2

- Hover sobre una célula muestra:
  - Vector de velocidad
  - Radio de visión
  - Imprime en la consola

## UserSories

- As a user I want to see cells
  - First unit test
- As a user I want to watch them move
  - Unit test for Game Loop
- As a user I want them to bounce on the corners
  - Easy
- As a user I want to watch them follow flocking behaviour
  - Unit tests for Alignement
  - Unit tests for Cohesion
  - Unit tests for Separation
- As a user I want to be able to attract them to a point
  - Test fake mouse interaction
- As a user I want to be able to reject them from a point
- As a user I want to see detailed cell information

### Tech

- Generate random initial state in `.json` and stick with it?
- We need
