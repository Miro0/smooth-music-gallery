# TODO

- [x] Dokończyć efekty overlay i background.
- [x] Dodać pagination bullets - one gdzieś tam są, ale powinny być kropkami w overlayu.
- [x] Dodać także możliwość zmiany głośności audio.
- [x] Dodać pozostałe motywy.
- [x] Może jakiś stop animacji jeśli jest offscreen i start jak wraca z powrotem?
- [x] Dodać ten builder shortcode - dopracować obsługę działania aktualizowania propsów / aktualizacji podglądu / dodać zapisywanie stanu do session storage / shortcode ze skróconymi media items / resolve po stronie render_callback.
- [ ] Podmienić ładowanie assetów przez Protected CDN - sprawdzić w ogóle ten flow, bo motywy to się chyba wszystkie ładują przez Edytor.
- [ ] Strony w menu? Dodać jakąś stronę główną i osobno Shortcode Builder. Dodać Shortcode Builder do Admin TopBar pod "+ Utwórz".
- [ ] Dodać przycisk "Unlock more features", który otworzy modal z możliwością zakupu PRO assetów.
- [ ] Listować tylko assety FREE i do których ma się dostęp.
- [ ] Serowować assety przez protected CDN.
- [ ] Wpiąć WP plugin category deployment jak tylko dostanę approve na wtyczunię.


# Bugi
- [x] Zmiana slideów przez pagination nie opóźnia chowania control overlay.
- [x] Poprawić działanie responsywności na pokazywanie controls overlay, bo nie do końca dobrze to działa - po 2-3 razach przestaje reagować na eventy.
- [x] Sprawdzić ogólne działanie na screenresize / fullscreen toggle. Animacje często mają stan wykalkulowany i się nie aktualizują odpowiednio po zmianach.
- [x] Restart muzyki kiedy się kończy
- [x] Mobile swiper nie pokazujej obrazków na cały ekran, ale utrzymuje ratio
- [ ] Przesunięcie slideów o pixel z powodu ułamkowych wielkości szerokości - występuje nadal w video player / music player motywach.
