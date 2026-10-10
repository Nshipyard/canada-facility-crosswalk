# Chart insight specs: The Facility Crosswalk

## EN

### 1. Match-rate donut (hero chart)

**What it shows:** The 1,879 GHGRP facilities for 2024 split into three buckets: 1,422 anchored (75.7%), 124 name/address resolved (6.6%), 333 unmatched (17.7%).

**Insight:** Three quarters of the crosswalk needed no inference at all. The self-reported NPRI ID field does the work. The interesting slice is the 426 facilities that wrote the bare digit 0: a placeholder that silently breaks the join for nearly a quarter of reporters.

**Build notes:** SVG donut, red/navy/gray segments. Center label shows the 82.3% total match rate. Caption names the 0-placeholder explicitly.

### 2. Facility map (centerpiece)

**What it shows:** Every matched facility with coordinates, plotted by published longitude/latitude. Red skews carbon-heavy (log GHG vs toxics ratio above 2), navy skews toxics-heavy (below -2), gray balanced. Dot size follows total magnitude.

**Insight:** Two geographies emerge. Carbon-heavy dots cluster in Alberta (oil sands, gas plants, refineries) and southern Ontario/Quebec industry. Toxics-heavy dots follow the mines: BC interior, northern Ontario, Quebec north. The map makes the two-regimes story visible at a glance: where you emit carbon and where you move toxics are different places, except at the oil sands.

**Build notes:** Equirectangular projection on the Canada bounding box, SVG circles, no external tiles. Tooltip shows facility name and province. Legend explains the color rule with the log-ratio thresholds.

### 3. Combined ranking bars

**What it shows:** Top 15 facilities by rank-sum of GHG rank and toxics rank, each with twin bars: red for GHG tonnes, navy for toxics kilograms.

**Insight:** The twin bars expose the tradeoff the single lists hide. Suncor leads both bars. Firebag (GHG rank 3) drops out of the toxics top 5 entirely: 5.7M t CO2e against 7.3M kg toxics. Copper Mountain (toxics rank 1) barely registers on carbon. The combined rank is the only ordering that punishes both.

**Build notes:** Paired horizontal bars per facility, log-friendly short formatting (M/K). "Cite this" button copies the Suncor citation.

### 4. Largest carbon emitters

**What it shows:** Top 10 by 2024 GHG tonnes CO2e. Suncor 8.0M, Horizon 6.0M, Firebag 5.7M, Cold Lake 5.7M, Genesee 4.7M.

**Insight:** The carbon list is an oil sands and thermal power list. Every one of the top 5 sits in Alberta. The toxics column beside each bar is the value-add of the crosswalk: Genesee's 12.0M kg of toxics would be invisible in a GHG-only ranking.

### 5. Largest toxic polluters

**What it shows:** Top 10 by 2024 toxic releases plus disposals in kg. Copper Mountain 258.3M, Detour Lake 169.3M, Carol Project 168.3M, Pipestone 152.0M, Suncor 126.1M.

**Insight:** Four of the top five are mines, and the driver is disposals (tailings, waste rock), not air releases. The chart must carry the caveat inline: mass is not harm, and contained disposal is not release. Without the caveat the chart misleads. With it, it teaches.

## FR

### 1. Anneau du taux d'appariement

**Contenu :** Les 1 879 installations du PDGES pour 2024 en trois seaux : 1 422 directes (75,7 %), 124 résolues par nom/adresse (6,6 %), 333 non appariées (17,7 %).

**Enseignement :** Les trois quarts de la table n'ont exigé aucune inférence. Le champ d'ID INRP déclaré fait le travail. La tranche intéressante est celle des 426 installations qui ont inscrit le simple chiffre 0 : un espace réservé qui casse silencieusement la jointure pour près du quart des déclarants.

### 2. Carte des installations (pièce maîtresse)

**Contenu :** Chaque installation appariée avec coordonnées, placée selon longitude/latitude publiées. Rouge vers le carbone, bleu marine vers les toxiques, taille selon l'ampleur.

**Enseignement :** Deux géographies émergent. Les points carbone se concentrent en Alberta (sables bitumineux, usines de gaz, raffineries) et dans l'industrie du sud de l'Ontario et du Québec. Les points toxiques suivent les mines : intérieur de la Colombie-Britannique, nord de l'Ontario, nord du Québec. La carte rend visible d'un coup d'œil la dualité : là où l'on émet du carbone et là où l'on déplace des toxiques sont des endroits différents, sauf dans les sables bitumineux.

### 3. Barres du classement combiné

**Contenu :** Les 15 premières installations par somme des rangs GES et toxiques, avec barres jumelées : rouge pour les tonnes de GES, bleu marine pour les kg de toxiques.

**Enseignement :** Les barres jumelées exposent l'arbitrage que les listes simples cachent. Suncor mène les deux barres. Firebag (rang GES 3) sort du top 5 toxiques : 5,7 M t éq. CO2 contre 7,3 M kg de toxiques. Copper Mountain (rang toxiques 1) compte à peine en carbone. Le rang combiné est le seul ordre qui punit les deux.

### 4. Plus gros émetteurs de carbone

**Contenu :** Top 10 des GES 2024 en tonnes d'éq. CO2. Suncor 8,0 M, Horizon 6,0 M, Firebag 5,7 M, Cold Lake 5,7 M, Genesee 4,7 M.

**Enseignement :** La liste carbone est une liste de sables bitumineux et de centrales thermiques. Les cinq premiers sont tous en Alberta. La colonne toxiques à côté de chaque barre est la valeur ajoutée de la table : les 12,0 M kg de toxiques de Genesee seraient invisibles dans un classement GES seul.

### 5. Plus gros pollueurs toxiques

**Contenu :** Top 10 des rejets plus éliminations toxiques 2024 en kg. Copper Mountain 258,3 M, Detour Lake 169,3 M, Carol 168,3 M, Pipestone 152,0 M, Suncor 126,1 M.

**Enseignement :** Quatre des cinq premiers sont des mines, et le moteur est les éliminations (résidus, stériles), pas les rejets atmosphériques. Le graphique doit porter la mise en garde : la masse n'est pas le dommage, et l'élimination confinée n'est pas le rejet. Sans la mise en garde, le graphique induit en erreur. Avec elle, il instruit.
