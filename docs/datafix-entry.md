# Data-fixes log entry: The Facility Crosswalk

## EN

**Dataset:** ECCC NPRI bulk files for all years plus geolocations master (dataset 40e01423-7728-429c-ac9d-2954385ccdfb) and GHGRP emissions-by-gas 2004-present (dataset a8ba14b7-7f23-462a-bdbb-83b0ef629823), via open.canada.ca. Retrieved 2026-10-10. Vintage: 2024 reporting year.

**What was wrong:**
- The two registries share no published facility key. The GHGRP asks reporters to self-report their NPRI ID, but 426 of 1,879 facilities (22.7%) write the bare digit 0, a placeholder, not an ID. 22 leave it blank. 9 report IDs absent from the NPRI master.
- The NPRI geolocations master carries 24,553 facility rows with bilingual column headers in cp1252 encoding, 381 blank facility names, and 9 duplicate NPRI IDs.
- The NPRI quantity files hold 3 facility IDs absent from the geolocations master (temporary or retired IDs with no published crosswalk).
- Source units are mixed: tonnes (the large majority), kilograms, grams, and grams of toxic equivalent.
- 144 near-matches score below the similarity floor or fail the spatial check. They look like matches but are not.

**The fix:**
- Anchor matching on the Facility NPRI ID field: non-zero, non-blank, present in the master. 1,422 anchored at high confidence.
- Entity resolution for the 457 unanchored: uppercase, strip accents, drop legal suffixes (Ltd, Inc, Corp, Ltée and variants), strip punctuation, score against same-province NPRI facilities. 0.90 or higher with coordinates within 25 km becomes a resolved match (124 recovered, high confidence at 0.99+, medium below).
- Temp-ID check: quantity-file IDs absent from the master are resolved only when exactly one master facility shares the normalized name and province. 3 found, 0 resolved, all 3 quarantined.
- Quarantine: 144 ambiguous near-matches logged in quarantine.json and excluded from every ranking.
- Unit normalization to kilograms. Grams of toxic equivalent excluded from kg sums and counted separately.

**Result:** 1,546 of 1,879 GHGRP facilities linked (82.3%): 1,422 anchored, 124 resolved, 333 honestly unmatched, 144 quarantined. The crosswalk ships as crosswalk.csv: NPRI ID, GHGRP ID, match method, confidence, temp-ID aliases.

**Before/after:**
- Before: "NPRI ID: 0" (426 facilities) -> After: placeholder recognized. 124 of these recovered by name/address resolution, the rest unmatched, never guessed.
- Before: "NPRI ID: 500303" (absent from master) -> After: treated as unanchored, resolved by name and coordinates or quarantined.
- Before: "Quantity: 9.3 tonnes" vs "Quantity: 5494 kg" -> After: both in kilograms (9,300 kg and 5,494 kg).
- Before: "Quantity: 144 g TEQ" (dioxins) -> After: excluded from kg sums, counted separately.

## FR

**Jeu de données :** fichiers bruts de l'INRP pour toutes les années plus fichier maître de géolocalisation (jeu de données 40e01423-7728-429c-ac9d-2954385ccdfb) et émissions par gaz du PDGES 2004 à aujourd'hui (jeu de données a8ba14b7-7f23-462a-bdbb-83b0ef629823), via open.canada.ca. Récupérés le 2026-10-10. Millésime : année de déclaration 2024.

**Ce qui clochait :**
- Les deux registres ne partagent aucune clé d'installation publiée. Le PDGES demande aux déclarants leur ID INRP, mais 426 des 1 879 installations (22,7 %) inscrivent le simple chiffre 0, un espace réservé, pas un ID. 22 le laissent vide. 9 déclarent des ID absents du fichier maître de l'INRP.
- Le fichier maître de géolocalisation de l'INRP porte 24 553 lignes d'installations avec en-têtes bilingues en encodage cp1252, 381 noms d'installations vides et 9 ID INRP en double.
- Les fichiers de quantités de l'INRP contiennent 3 ID d'installations absents du fichier maître (ID temporaires ou retirés sans table de correspondance publiée).
- Les unités sources sont mixtes : tonnes (la grande majorité), kilogrammes, grammes et grammes d'équivalent toxique.
- 144 quasi-appariements sous le seuil de similarité ou hors contrôle spatial ressemblent à des appariements sans en être.

**La correction :**
- Appariement direct sur le champ d'ID INRP : non nul, non vide, présent dans le fichier maître. 1 422 appariements directs à confiance élevée.
- Résolution d'entités pour les 457 non appariées : majuscules, accents retirés, suffixes juridiques supprimés (Ltd, Inc, Corp, Ltée et variantes), ponctuation enlevée, notation contre les installations INRP de la même province. 0,90 ou plus avec coordonnées à moins de 25 km devient un appariement résolu (124 récupérées, confiance élevée à 0,99+, moyenne en dessous).
- Contrôle des ID temporaires : les ID des fichiers de quantités absents du fichier maître ne sont résolus que si exactement une installation maître partage le nom normalisé et la province. 3 trouvés, 0 résolus, les 3 mis en quarantaine.
- Quarantaine : 144 quasi-appariements ambigus consignés dans quarantine.json et exclus de tous les classements.
- Normalisation des unités en kilogrammes. Les grammes d'équivalent toxique exclus des sommes en kg et comptés à part.

**Résultat :** 1 546 des 1 879 installations du PDGES reliées (82,3 %) : 1 422 directes, 124 résolues, 333 honnêtement non appariées, 144 mises en quarantaine. La table est livrée dans crosswalk.csv : ID INRP, ID PDGES, méthode d'appariement, niveau de confiance, alias d'ID temporaires.

**Avant/après :**
- Avant : « ID INRP : 0 » (426 installations) -> Après : espace réservé reconnu. 124 récupérées par résolution de noms et d'adresses, les autres non appariées, jamais devinées.
- Avant : « ID INRP : 500303 » (absent du fichier maître) -> Après : traité comme non apparié, résolu par nom et coordonnées ou mis en quarantaine.
- Avant : « Quantité : 9,3 tonnes » contre « Quantité : 5 494 kg » -> Après : les deux en kilogrammes (9 300 kg et 5 494 kg).
- Avant : « Quantité : 144 g ÉT » (dioxines) -> Après : exclu des sommes en kg, compté à part.
