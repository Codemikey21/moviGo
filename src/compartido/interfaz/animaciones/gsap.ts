"use client";

// Punto único de registro de GSAP. Todos los componentes importan de aquí
// para que los plugins se registren una sola vez.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
