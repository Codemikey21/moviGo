// Esquemas zod de entrada de este módulo.
import { z } from "zod";

export const esquemaIds = z.array(z.uuid()).max(500);
