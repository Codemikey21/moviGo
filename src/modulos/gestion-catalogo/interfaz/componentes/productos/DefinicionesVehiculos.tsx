// Dibujos de los vehículos de MoviGo (uno por categoría).
//
// Se definen UNA sola vez en la página como <symbol> y cada ilustración los
// reutiliza con <use>. El color de la carrocería sale de la variable CSS
// --pintura, así el mismo dibujo sirve para todos los colores del producto.
// Se muestran mientras el producto no tenga fotos propias.

export function DefinicionesVehiculos() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="mv-g-llanta" cx="50%" cy="50%" r="50%"><stop offset="72%" stopColor="#121516"/><stop offset="88%" stopColor="#2b3133"/><stop offset="100%" stopColor="#0b0d0e"/></radialGradient>
        <radialGradient id="mv-g-rin" cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#8d989a"/><stop offset="60%" stopColor="#4a5355"/><stop offset="100%" stopColor="#262b2d"/></radialGradient>
        <linearGradient id="mv-g-brillo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".55"/><stop offset=".35" stopColor="#fff" stopOpacity=".08"/><stop offset=".7" stopColor="#000" stopOpacity=".05"/><stop offset="1" stopColor="#000" stopOpacity=".45"/></linearGradient>
        <linearGradient id="mv-g-tubo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity=".35"/><stop offset=".45" stopColor="#fff" stopOpacity=".0"/><stop offset=".62" stopColor="#fff" stopOpacity=".5"/><stop offset=".8" stopColor="#fff" stopOpacity=".05"/><stop offset="1" stopColor="#000" stopOpacity=".3"/></linearGradient>
        <radialGradient id="mv-g-sombra"><stop offset="0" stopColor="#000" stopOpacity=".6"/><stop offset="1" stopColor="#000" stopOpacity="0"/></radialGradient>
        <radialGradient id="mv-g-faro"><stop offset="0" stopColor="#fff"/><stop offset=".4" stopColor="#e6fff7" stopOpacity=".7"/><stop offset="1" stopColor="#64d5b3" stopOpacity="0"/></radialGradient>
        <symbol id="mv-rueda" viewBox="-70 -70 140 140">
          <circle r="68" fill="url(#mv-g-llanta)"/>
          <circle r="66" fill="none" stroke="#3a4244" strokeWidth="1"/>
          <circle r="47" fill="url(#mv-g-rin)"/>
          <circle r="47" fill="none" stroke="#0d1212" strokeWidth="2" opacity=".6"/>
          <g fill="#1a1f20">
            <path d="M-6 -12 L-14 -44 L14 -44 L6 -12 Z"/>
            <path d="M-6 -12 L-14 -44 L14 -44 L6 -12 Z" transform="rotate(72)"/>
            <path d="M-6 -12 L-14 -44 L14 -44 L6 -12 Z" transform="rotate(144)"/>
            <path d="M-6 -12 L-14 -44 L14 -44 L6 -12 Z" transform="rotate(216)"/>
            <path d="M-6 -12 L-14 -44 L14 -44 L6 -12 Z" transform="rotate(288)"/>
          </g>
          <circle r="15" fill="#22282a" stroke="#64d5b3" strokeWidth="2.5"/>
          <circle r="5" fill="#9aa3a5"/>
        </symbol>
        <symbol id="mv-scooter" viewBox="0 0 900 560">
          <ellipse cx="450" cy="503" rx="360" ry="20" fill="url(#mv-g-sombra)"/>
          {/* pata */}
          <line x1="312" y1="432" x2="282" y2="482" stroke="#1a1f20" strokeWidth="7" strokeLinecap="round"/>
          {/* guardabarros trasero */}
          <path d="M112 424 A 82 82 0 0 1 262 378 L 272 394 A 68 68 0 0 0 128 428 Z" style={{ fill: "var(--pintura)", transition: "fill .7s" }}/>
          <path d="M112 424 A 82 82 0 0 1 262 378 L 272 394 A 68 68 0 0 0 128 428 Z" fill="url(#mv-g-brillo)"/>
          <rect x="108" y="410" width="12" height="20" rx="4" fill="#e2483d"/>
          <rect x="108" y="410" width="12" height="20" rx="4" fill="#ff7a6e" opacity=".5"><animate attributeName="opacity" values=".2;.9;.2" dur="2.4s" repeatCount="indefinite"/></rect>
          <use href="#mv-rueda" x="122" y="364" width="136" height="136"/>
          {/* cubierta / plataforma */}
          <path d="M218 396 H 626 Q 660 396 668 420 L 672 436 H 224 Q 202 436 206 416 Q 208 398 218 396 Z" style={{ fill: "var(--pintura)", transition: "fill .7s" }}/>
          <path d="M218 396 H 626 Q 660 396 668 420 L 672 436 H 224 Q 202 436 206 416 Q 208 398 218 396 Z" fill="url(#mv-g-brillo)"/>
          <rect x="244" y="388" width="372" height="10" rx="4" fill="#15191a"/>
          <rect x="252" y="436" width="350" height="12" rx="5" fill="#1b2022"/>
          <rect x="380" y="438" width="90" height="4" rx="2" fill="#64d5b3" opacity=".8"/>
          {/* cuello */}
          <path d="M598 398 Q 664 398 684 352 L 708 362 Q 690 428 640 438 L 620 438 Z" style={{ fill: "var(--pintura)", transition: "fill .7s" }}/>
          <path d="M598 398 Q 664 398 684 352 L 708 362 Q 690 428 640 438 L 620 438 Z" fill="url(#mv-g-brillo)"/>
          {/* horquilla y guardabarros delantero */}
          <line x1="700" y1="360" x2="724" y2="432" stroke="#1a1f20" strokeWidth="16" strokeLinecap="round"/>
          <path d="M650 404 A 80 80 0 0 1 800 412 L 786 416 A 66 66 0 0 0 662 410 Z" fill="#1a1f20"/>
          <use href="#mv-rueda" x="656" y="364" width="136" height="136"/>
          {/* manubrio / tubo */}
          <g transform="rotate(8 700 360)">
            <rect x="684" y="96" width="30" height="276" rx="14" style={{ fill: "var(--pintura)", transition: "fill .7s" }}/>
            <rect x="684" y="96" width="30" height="276" rx="14" fill="url(#mv-g-tubo)"/>
            <rect x="686" y="248" width="26" height="6" rx="3" fill="#15191a" opacity=".7"/>
            {/* faro */}
            <rect x="708" y="180" width="14" height="30" rx="6" fill="#f2fffb"/>
            <circle cx="722" cy="195" r="46" fill="url(#mv-g-faro)" opacity=".75"><animate attributeName="opacity" values=".55;.9;.55" dur="3s" repeatCount="indefinite"/></circle>
            {/* manubrio */}
            <rect x="652" y="84" width="96" height="22" rx="11" fill="#15191a"/>
            <rect x="652" y="84" width="34" height="22" rx="11" fill="#2b3133"/>
            <rect x="676" y="74" width="44" height="12" rx="5" fill="#0d1212"/>
            <rect x="684" y="77" width="22" height="5" rx="2" fill="#64d5b3"/>
            <path d="M740 102 L 770 118" stroke="#15191a" strokeWidth="5" strokeLinecap="round"/>
          </g>
        </symbol>

        <linearGradient id="mv-g-vidrio" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3d4a4d"/><stop offset=".45" stopColor="#121819"/><stop offset=".55" stopColor="#1f2829"/><stop offset="1" stopColor="#0b0f10"/></linearGradient>
        <linearGradient id="mv-g-cromo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9eeee"/><stop offset=".5" stopColor="#8b9597"/><stop offset="1" stopColor="#4a5355"/></linearGradient>
        <radialGradient id="mv-g-luz-roja"><stop offset="0" stopColor="#ff8f84"/><stop offset="1" stopColor="#e2483d" stopOpacity="0"/></radialGradient>

        {/* AUTO ELÉCTRICO (hatchback) */}
        <symbol id="mv-auto" viewBox="0 0 900 560">
          <ellipse cx="450" cy="503" rx="400" ry="22" fill="url(#mv-g-sombra)"/>
          <path d="M58 440 L60 372 Q62 330 104 312 L236 262 Q306 206 412 200 L560 200 Q636 204 700 258 L790 298 Q842 312 848 356 L850 418 Q850 444 824 446 L76 446 Q58 446 58 440 Z" style={{ fill: "var(--pintura)", transition: "fill .7s" }}/>
          <path d="M58 440 L60 372 Q62 330 104 312 L236 262 Q306 206 412 200 L560 200 Q636 204 700 258 L790 298 Q842 312 848 356 L850 418 Q850 444 824 446 L76 446 Q58 446 58 440 Z" fill="url(#mv-g-brillo)"/>
          <path d="M262 266 Q318 218 410 214 L452 214 L452 284 L262 284 Z" fill="url(#mv-g-vidrio)"/>
          <path d="M466 214 L556 214 Q614 218 664 270 L668 284 L466 284 Z" fill="url(#mv-g-vidrio)"/>
          <path d="M150 304 Q600 296 830 330" stroke="#fff" strokeOpacity=".28" strokeWidth="2" fill="none"/>
          <path d="M459 214 V 440 M 676 288 Q 690 360 680 440" stroke="#0d1212" strokeOpacity=".25" strokeWidth="2" fill="none"/>
          <rect x="392" y="318" width="40" height="7" rx="3.5" fill="#0d1212" opacity=".45"/><rect x="606" y="318" width="40" height="7" rx="3.5" fill="#0d1212" opacity=".45"/>
          <path d="M776 312 Q 822 316 842 340 L 812 342 Q 790 330 776 312 Z" fill="#f4fffb"/>
          <circle cx="826" cy="332" r="46" fill="url(#mv-g-faro)" opacity=".7"><animate attributeName="opacity" values=".45;.85;.45" dur="3s" repeatCount="indefinite"/></circle>
          <path d="M62 346 Q 74 330 96 322 L 98 352 L 62 356 Z" fill="#e2483d"/>
          <rect x="62" y="420" width="788" height="26" rx="10" fill="#15191a" opacity=".85"/>
          <circle cx="214" cy="440" r="76" fill="#0d1212"/><circle cx="690" cy="440" r="76" fill="#0d1212"/>
          <use href="#mv-rueda" x="146" y="372" width="136" height="136"/>
          <use href="#mv-rueda" x="622" y="372" width="136" height="136"/>
        </symbol>

        {/* MOTO */}
        <symbol id="mv-moto" viewBox="0 0 900 560">
          <ellipse cx="450" cy="503" rx="380" ry="20" fill="url(#mv-g-sombra)"/>
          <line x1="430" y1="392" x2="206" y2="432" stroke="#1b2022" strokeWidth="20" strokeLinecap="round"/>
          <line x1="300" y1="300" x2="340" y2="400" stroke="#2b3133" strokeWidth="10" strokeLinecap="round"/>
          <use href="#mv-rueda" x="136" y="362" width="140" height="140"/>
          <path d="M130 372 A 86 86 0 0 1 270 330 L 262 346 A 70 70 0 0 0 146 380 Z" fill="#1b2022"/>
          {/* motor */}
          <rect x="384" y="302" width="168" height="112" rx="22" fill="#262c2e"/>
          <g stroke="#4a5355" strokeWidth="4"><line x1="404" y1="324" x2="532" y2="324"/><line x1="404" y1="342" x2="532" y2="342"/><line x1="404" y1="360" x2="532" y2="360"/></g>
          <circle cx="430" cy="392" r="20" fill="url(#mv-g-cromo)"/>
          <path d="M420 410 Q 360 430 300 420 L 186 396" stroke="url(#mv-g-cromo)" strokeWidth="16" strokeLinecap="round" fill="none"/>
          {/* cola, asiento, tanque */}
          <path d="M164 282 L292 258 L300 300 L190 306 Q 166 304 164 282 Z" style={{ fill: "var(--pintura)", transition: "fill .7s" }}/>
          <path d="M164 282 L292 258 L300 300 L190 306 Q 166 304 164 282 Z" fill="url(#mv-g-brillo)"/>
          <rect x="158" y="276" width="18" height="12" rx="4" fill="#e2483d"/>
          <path d="M262 262 Q 330 236 400 250 L 404 284 L 268 296 Z" fill="#15191a"/>
          <path d="M392 250 Q 470 206 566 222 Q 600 230 606 262 L 588 304 Q 480 310 398 300 Z" style={{ fill: "var(--pintura)", transition: "fill .7s" }}/>
          <path d="M392 250 Q 470 206 566 222 Q 600 230 606 262 L 588 304 Q 480 310 398 300 Z" fill="url(#mv-g-brillo)"/>
          <path d="M420 262 L 560 244" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round"/>
          {/* horquilla y rueda delantera */}
          <line x1="600" y1="196" x2="694" y2="432" stroke="#2b3133" strokeWidth="18" strokeLinecap="round"/>
          <line x1="604" y1="200" x2="694" y2="432" stroke="url(#mv-g-cromo)" strokeWidth="6" strokeLinecap="round" opacity=".7"/>
          <use href="#mv-rueda" x="624" y="362" width="140" height="140"/>
          <path d="M626 380 A 84 84 0 0 1 768 386 L 754 392 A 70 70 0 0 0 640 386 Z" style={{ fill: "var(--pintura)", transition: "fill .7s" }}/>
          {/* faro y manubrio */}
          <path d="M586 186 L 640 176" stroke="#15191a" strokeWidth="12" strokeLinecap="round"/>
          <path d="M566 176 L 590 190" stroke="#15191a" strokeWidth="8" strokeLinecap="round"/>
          <circle cx="640" cy="226" r="24" fill="#1b2022"/><circle cx="644" cy="226" r="16" fill="#f2fffb"/>
          <circle cx="660" cy="226" r="56" fill="url(#mv-g-faro)" opacity=".7"><animate attributeName="opacity" values=".45;.85;.45" dur="3s" repeatCount="indefinite"/></circle>
        </symbol>

        {/* BICICLETA */}
        <symbol id="mv-ruedabici" viewBox="-110 -110 220 220">
          <circle r="100" fill="none" stroke="#121516" strokeWidth="16"/>
          <circle r="90" fill="none" stroke="#7b8889" strokeWidth="3"/>
          <g stroke="#9aa3a5" strokeWidth="1.4">
            <line x1="-88" y1="0" x2="88" y2="0"/><line x1="0" y1="-88" x2="0" y2="88"/>
            <line x1="-62" y1="-62" x2="62" y2="62"/><line x1="-62" y1="62" x2="62" y2="-62"/>
            <line x1="-81" y1="-34" x2="81" y2="34"/><line x1="-81" y1="34" x2="81" y2="-34"/>
            <line x1="-34" y1="-81" x2="34" y2="81"/><line x1="-34" y1="81" x2="34" y2="-81"/>
          </g>
          <circle r="12" fill="#2b3133" stroke="#64d5b3" strokeWidth="2"/>
        </symbol>
        <symbol id="mv-bici" viewBox="0 0 900 560">
          <ellipse cx="450" cy="503" rx="370" ry="18" fill="url(#mv-g-sombra)"/>
          <use href="#mv-ruedabici" x="110" y="276" width="220" height="220"/>
          <use href="#mv-ruedabici" x="570" y="276" width="220" height="220"/>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--pintura)", transition: "stroke .7s" }}>
            <path d="M220 386 L 420 390 L 372 218 Z" strokeWidth="15"/>
            <path d="M372 218 L 604 206 L 420 390" strokeWidth="18"/>
          </g>
          <g fill="none" strokeLinecap="round" stroke="#fff" strokeOpacity=".3" strokeWidth="4"><path d="M378 214 L 600 202"/><path d="M596 214 L 428 380"/></g>
          <line x1="604" y1="206" x2="680" y2="386" stroke="#2b3133" strokeWidth="14" strokeLinecap="round"/>
          <line x1="608" y1="212" x2="640" y2="288" stroke="url(#mv-g-cromo)" strokeWidth="5" strokeLinecap="round"/>
          <line x1="604" y1="206" x2="592" y2="160" stroke="#2b3133" strokeWidth="12" strokeLinecap="round"/>
          <path d="M560 150 L 632 156" stroke="#15191a" strokeWidth="10" strokeLinecap="round"/>
          <line x1="372" y1="218" x2="362" y2="180" stroke="#2b3133" strokeWidth="10" strokeLinecap="round"/>
          <path d="M318 172 Q 360 160 404 170 L 400 182 Q 356 180 322 184 Z" fill="#15191a"/>
          <circle cx="420" cy="390" r="28" fill="#1b2022" stroke="url(#mv-g-cromo)" strokeWidth="4"/>
          <line x1="420" y1="390" x2="446" y2="426" stroke="#2b3133" strokeWidth="8" strokeLinecap="round"/>
          <path d="M220 386 L 420 390" stroke="#15191a" strokeWidth="3" strokeDasharray="4 4"/>
        </symbol>

        {/* PATINETA */}
        <symbol id="mv-patineta" viewBox="0 0 900 560">
          <ellipse cx="450" cy="503" rx="340" ry="16" fill="url(#mv-g-sombra)"/>
          <path d="M120 360 Q 140 396 200 400 L 700 400 Q 760 396 780 360 L 790 366 Q 772 418 704 420 L 196 420 Q 128 418 110 366 Z" style={{ fill: "var(--pintura)", transition: "fill .7s" }}/>
          <path d="M120 360 Q 140 396 200 400 L 700 400 Q 760 396 780 360 L 790 366 Q 772 418 704 420 L 196 420 Q 128 418 110 366 Z" fill="url(#mv-g-brillo)"/>
          <path d="M196 400 L 704 400" stroke="#15191a" strokeWidth="5"/>
          <g fill="#2b3133"><path d="M232 420 h76 l-14 26 h-48 z"/><path d="M592 420 h76 l-14 26 h-48 z"/></g>
          <rect x="220" y="440" width="100" height="10" rx="5" fill="url(#mv-g-cromo)"/><rect x="580" y="440" width="100" height="10" rx="5" fill="url(#mv-g-cromo)"/>
          <g><circle cx="270" cy="470" r="32" fill="#64d5b3"/><circle cx="270" cy="470" r="12" fill="#e9eeee"/><circle cx="630" cy="470" r="32" fill="#64d5b3"/><circle cx="630" cy="470" r="12" fill="#e9eeee"/></g>
        </symbol>

        {/* DRON */}
        <symbol id="mv-dron" viewBox="0 0 900 560">
          <ellipse cx="450" cy="503" rx="260" ry="14" fill="url(#mv-g-sombra)"/>
          <g transform="translate(0 -10)">
            <animateTransform attributeName="transform" type="translate" values="0 -18;0 0;0 -18" dur="3.6s" repeatCount="indefinite"/>
            <g stroke="#262c2e" strokeWidth="18" strokeLinecap="round"><line x1="450" y1="280" x2="210" y2="220"/><line x1="450" y1="280" x2="690" y2="220"/><line x1="450" y1="290" x2="250" y2="330"/><line x1="450" y1="290" x2="650" y2="330"/></g>
            <g fill="#1b2022"><rect x="196" y="196" width="28" height="34" rx="8"/><rect x="676" y="196" width="28" height="34" rx="8"/><rect x="236" y="306" width="28" height="34" rx="8"/><rect x="636" y="306" width="28" height="34" rx="8"/></g>
            <g fill="#9aa3a5" opacity=".35">
              <ellipse cx="210" cy="194" rx="110" ry="12"><animate attributeName="rx" values="110;70;110" dur=".18s" repeatCount="indefinite"/></ellipse>
              <ellipse cx="690" cy="194" rx="110" ry="12"><animate attributeName="rx" values="70;110;70" dur=".18s" repeatCount="indefinite"/></ellipse>
              <ellipse cx="250" cy="304" rx="100" ry="11"><animate attributeName="rx" values="100;64;100" dur=".18s" repeatCount="indefinite"/></ellipse>
              <ellipse cx="650" cy="304" rx="100" ry="11"><animate attributeName="rx" values="64;100;64" dur=".18s" repeatCount="indefinite"/></ellipse>
            </g>
            <path d="M352 268 Q 360 236 450 232 Q 540 236 548 268 L 540 310 Q 450 326 360 310 Z" style={{ fill: "var(--pintura)", transition: "fill .7s" }}/>
            <path d="M352 268 Q 360 236 450 232 Q 540 236 548 268 L 540 310 Q 450 326 360 310 Z" fill="url(#mv-g-brillo)"/>
            <rect x="410" y="318" width="80" height="20" rx="8" fill="#1b2022"/>
            <rect x="424" y="334" width="52" height="40" rx="14" fill="#15191a"/>
            <circle cx="450" cy="354" r="13" fill="url(#mv-g-vidrio)" stroke="#64d5b3" strokeWidth="2"/>
            <circle cx="504" cy="262" r="5" fill="#64d5b3"><animate attributeName="opacity" values="1;.2;1" dur="1.2s" repeatCount="indefinite"/></circle>
          </g>
        </symbol>

        {/* CASCO (accesorios) */}
        <symbol id="mv-casco" viewBox="0 0 900 560">
          <ellipse cx="450" cy="503" rx="230" ry="16" fill="url(#mv-g-sombra)"/>
          <path d="M250 430 Q 236 250 410 190 Q 560 150 650 250 Q 700 310 690 410 Q 686 440 650 446 L 300 452 Q 256 452 250 430 Z" style={{ fill: "var(--pintura)", transition: "fill .7s" }}/>
          <path d="M250 430 Q 236 250 410 190 Q 560 150 650 250 Q 700 310 690 410 Q 686 440 650 446 L 300 452 Q 256 452 250 430 Z" fill="url(#mv-g-brillo)"/>
          <g fill="#15191a" opacity=".85"><path d="M330 230 q 40 -24 90 -30 l 6 22 q -50 6 -88 28 z"/><path d="M450 196 q 50 -4 96 14 l -8 22 q -42 -16 -86 -14 z"/><path d="M572 222 q 34 18 52 44 l -20 12 q -18 -24 -46 -38 z"/></g>
          <path d="M520 300 Q 640 290 690 330 L 690 400 Q 610 384 520 388 Z" fill="url(#mv-g-vidrio)"/>
          <path d="M534 312 Q 620 306 672 336" stroke="#fff" strokeOpacity=".35" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <rect x="276" y="430" width="380" height="18" rx="9" fill="#15191a"/>
          <circle cx="372" cy="330" r="10" fill="#64d5b3"/>
        </symbol>

      </defs>
    </svg>
  );
}
