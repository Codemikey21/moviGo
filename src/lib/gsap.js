import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Registramos el plugin una sola vez. El resto de la app debe importar
// gsap y ScrollTrigger desde este archivo para garantizar que estén listos.
gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }
