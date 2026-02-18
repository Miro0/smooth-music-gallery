# TODO

- [x] Dokończyć efekty overlay i background.
- [x] Dodać pagination bullets - one gdzieś tam są, ale powinny być kropkami w overlayu.
- [x] Dodać także możliwość zmiany głośności audio.
- [x] Dodać pozostałe motywy.
- [x] Może jakiś stop animacji jeśli jest offscreen i start jak wraca z powrotem?
- [x] Dodać ten builder shortcode - dopracować obsługę działania aktualizowania propsów / aktualizacji podglądu / dodać zapisywanie stanu do session storage / shortcode ze skróconymi media items / resolve po stronie render_callback.
- [x] Podmienić ładowanie assetów przez Smooth CDN - sprawdzić w ogóle ten flow, bo motywy to się chyba wszystkie ładują przez Edytor.
- [x] Strony w menu? Dodać jakąś stronę główną i osobno Shortcode Builder. Dodać Shortcode Builder do Admin TopBar pod "+ Utwórz".
- [x] Może dodać jakieś globalne ustawienia - tam można dać sekcję "Laduj przez Smooth CDN" oraz "Pokaz przycisk w top toolbar"
- [x] Strona główna w Smooth Music Gallery. Jakieś info o Smooth CDN?
- [x] odtwarzanie jednej galerii powinno automatycznie stopować inne instancje - mała funkcja, ale przydatna przy wielu galeriach
- [x] Resize nie działa na Pixelate oraz Dust Particles
- [x] Color Blend - podgląd jest słaby oraz nie działa slider (pokazuje tylko pierwsze zdjęcie)
- [x] pickery obrazków oraz music - nie pokazują wybranych elementów
- [x] pickery kierujące na Smooth CDN
- [ ] dodać jakieś assety - obrazki oraz pliku muzyczne - do projektu Assets
- [ ] Wpiąć WP plugin category deployment jak tylko dostanę approve na wtyczunię.


# Bugi
- [x] Zmiana slideów przez pagination nie opóźnia chowania control overlay.
- [x] Poprawić działanie responsywności na pokazywanie controls overlay, bo nie do końca dobrze to działa - po 2-3 razach przestaje reagować na eventy.
- [x] Sprawdzić ogólne działanie na screenresize / fullscreen toggle. Animacje często mają stan wykalkulowany i się nie aktualizują odpowiednio po zmianach.
- [x] Restart muzyki kiedy się kończy
- [x] Mobile swiper nie pokazujej obrazków na cały ekran, ale utrzymuje ratio
- [x] Przesunięcie slideów o pixel z powodu ułamkowych wielkości szerokości - występuje nadal w video player / music player motywach.

# 1.1
- [ ] Poprawić mobilny widok motywi playlist
- [ ] Włączyć z powrotem poprawiony motyw
