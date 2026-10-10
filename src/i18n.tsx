"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "fr";

const en = {
  banner: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or Environment and Climate Change Canada.",
    badge: "Open source",
  },
  nav: { explorer: "Explorer", showcase: "Showcase", developers: "Developers", data: "Data", back: "All projects" },
  hero: {
    kicker: "Open Nshipyard · Project P2",
    title: "Which carbon emitters are also the worst toxic polluters.",
    sub: "Environment and Climate Change Canada runs two facility registries that share no published key. The Greenhouse Gas Reporting Program names 1,879 emitters for 2024. The National Pollutant Release Inventory tracks 24,553 polluters since 1993. This project links them: 1,422 anchor matches on self-reported NPRI IDs, entity resolution for the rest, quarantine for the ambiguous. The combined ranking is the first public answer to the headline question.",
    cta1: "Search the facilities",
    cta2: "Read the methodology",
  },
  stats: [
    { value: "1,879", label: "GHG-reporting facilities in 2024, each linked to the pollutant registry" },
    { value: "75.7%", label: "anchor-matched on self-reported NPRI IDs. No guessing." },
    { value: "249.8M t", label: "of CO2 equivalent reported for 2024 by the linked facilities" },
    { value: "124", label: "more facilities recovered by name and address resolution" },
  ],
  explorer: {
    kicker: "Explorer",
    title: "Search the linked facilities.",
    search: "Search by facility name, company, or city…",
    province: "Province",
    allProvinces: "All provinces",
    method: "Match method",
    allMethods: "All methods",
    anchored: "Anchored",
    resolved: "Name/address resolved",
    showing: "Showing",
    of: "of",
    noResult: "No facilities match.",
    empty: "Search above to browse the crosswalk. Each facility carries its 2024 GHG total beside its 2024 toxic releases and disposals, plus the match method and confidence tier.",
    confidence: "confidence",
    ghg: "GHG emissions, 2024",
    releases: "releases",
    disposals: "disposals",
    transfers: "transfers",
    toxics: "toxics",
    unitNote: "NPRI quantities are kilograms of substance as reported, units normalized to kg. GHG is tonnes of CO2 equivalent as published by the GHGRP.",
    back: "Back to results",
  },
  showcase: {
    kicker: "Showcase",
    title: "The same plant, two identities.",
    body: "Suncor's Oil Sands operation sits at the top of both lists at once: 8.0M tonnes of CO2e (GHG rank 1) and 126.1M kg of toxics (toxics rank 5). Four of the top five combined are Alberta oil sands. The toxics-only list looks different: it is led by mines, because NPRI disposals include tailings and waste rock. The registries never shared a key, so nobody could see both halves of any facility until this crosswalk.",
    matchTitle: "How the crosswalk was matched",
    matchSub: "Every one of the 1,879 GHGRP facilities for 2024 lands in exactly one bucket.",
    anchored: "Anchored",
    resolved: "Name/address resolved",
    unmatched: "Unmatched",
    matched: "matched",
    ofFacilities: "of facilities",
    zeroNote: "426 GHGRP facilities report their NPRI ID as the bare digit 0, a placeholder, not an ID. 22 leave it blank. Entity resolution recovered 124 of these from names, addresses, and companies. The rest are honestly unmatched, not guessed.",
    mapTitle: "One map, two registries",
    mapSub: "Matched facilities plotted by their published coordinates. Red skews carbon-heavy, navy skews toxics-heavy, size follows total magnitude.",
    legendGhg: "Carbon-heavy",
    legendTox: "Toxics-heavy",
    legendBoth: "Balanced",
    mapFoot: "Coordinates as published by ECCC",
    combinedTitle: "The combined ranking",
    combinedSub: "Facilities ranked by the sum of their GHG rank and their toxics rank. Sitting high on both lists at once is the worst seat in the country.",
    ghgLabel: "GHG, 2024",
    toxLabel: "Toxics, 2024",
    ghgTitle: "Largest carbon emitters",
    ghgSub: "2024 totals in tonnes of CO2 equivalent, as published by the GHGRP.",
    toxTitle: "Largest toxic polluters",
    toxSub: "2024 releases plus disposals, in kilograms, from the NPRI bulk files.",
    citeThis: "Cite this",
    copied: "Copied",
    citeCombined: "The Facility Crosswalk (Open Nshipyard, 2026): Suncor Energy Inc. Oil Sands ranks 1st in 2024 GHG emissions (8.0M t CO2e) and 5th in toxic releases and disposals (126.1M kg) among 1,546 matched facilities. Sources: ECCC NPRI bulk files and GHGRP emissions-by-gas via open.canada.ca.",
    citeTox: "The Facility Crosswalk (Open Nshipyard, 2026): Copper Mountain Mine reported 258.3M kg of toxic releases and disposals in 2024, the highest among 1,546 matched facilities, against 43,028 t CO2e. Sources: ECCC NPRI bulk files and GHGRP emissions-by-gas via open.canada.ca.",
  },
  methodology: {
    kicker: "Methodology",
    title: "How the crosswalk was built, and where it is weak.",
    items: [
      "Sources, both retrieved 2026-10-10 under the Open Government Licence - Canada: the NPRI bulk files for all years (ECCC dataset 40e01423-7728-429c-ac9d-2954385ccdfb, updated 2026-05-01): geolocations master with 24,553 facility records, plus 1993-2024 releases, disposals, and transfers quantity files. And the GHGRP emissions-by-gas file PDGES-GHGRP-GHGEmissionsGES-2004-Present (ECCC dataset a8ba14b7-7f23-462a-bdbb-83b0ef629823, updated 2026-05-27), 20,685 facility-year rows, of which 1,879 are 2024.",
      "Anchor matching: a GHGRP facility whose Facility NPRI ID is non-zero, non-blank, and present in the NPRI geolocations master is an anchored match, confidence high. 1,422 of 1,879 GHGRP facilities matched this way (75.7%).",
      "Entity resolution for the 457 unanchored facilities: names are uppercased, accents stripped, legal suffixes dropped, punctuation removed, then scored against NPRI facilities in the same province. A score of 0.90 or higher with coordinates within 25 km (when both sides publish them) becomes a resolved match, confidence high at 0.99+ and medium below. 124 facilities matched this way.",
      "Temp ID resolution: NPRI quantity files contain 3 facility IDs absent from the geolocations master. None resolved unambiguously to a single master record, so all 3 are quarantined and their quantities are excluded rather than guessed. The temp-ID problem is smaller than the registry documentation implies, at least in the current files.",
      "Quarantine: low-similarity near-matches, name matches whose coordinates disagree by more than 25 km, and temp IDs with multiple candidate masters are logged in quarantine.json and excluded from every ranking. A guess is worse than an unmatched row.",
      "Toxic totals: 2024 releases and disposals summed per facility in kilograms. Source units were tonnes (the large majority), kilograms, and grams. Grams of toxic equivalent (dioxins and furans) are excluded from the kilogram sums and counted separately because they are not a mass. NPRI disposals include tailings and waste rock, which dominate mine totals: the ranking treats contained disposal and environmental release identically by mass, which flatters mines and understates air toxics. Transfers for recycling are excluded pending a complete retrieval of the transfers bulk file.",
      "Limits: 2024 reporting year on both sides. GHGRP covers facilities emitting 10 kilotonnes of CO2e or more per year. NPRI has its own substance and employee thresholds, so small polluters are absent from both. Kilograms are not harm: a kilogram of mercury and a kilogram of nitrate differ completely in damage. 426 GHGRP facilities report NPRI ID as bare 0, a placeholder.",
    ],
  },
  developers: {
    kicker: "For developers",
    title: "Query it from code, or from an agent.",
    body: "Three consumption paths, same canonical data. REST for applications, OpenAPI for integration, MCP tools over streamable HTTP for AI agents.",
    endpoints: "Endpoints",
    tryIt: "Try it",
    openapi: "OpenAPI spec",
    mcpTitle: "MCP server",
    mcpBody: "One streamable-HTTP endpoint. Tools: facility_lookup, crosswalk_search, match_stats.",
  },
  mcp: {
    kicker: "Connect your agent",
    title: "Put this data to work inside your AI tools.",
    body: "Pick your harness, copy the prompt, send it to your agent. Your agent runs the setup itself.",
    tabs: { chatgpt: "ChatGPT", claude: "Claude", claudecode: "Claude Code", cli: "CLI", other: "Other" },
    cardTitle: "Copy and send this to {tab}",
    copy: "Copy",
    copied: "Copied",
    chatgptNote: "ChatGPT connects through the documented REST API rather than MCP directly.",
    pChatgpt:
      "I want to use the {displayName} through its API.\n- OpenAPI spec: {origin}/api/openapi.json\n- REST base: {origin}/api/v1\nFirst tell me in two sentences what this API offers, then {exampleLower}, and show me the result.",
    pClaude:
      "In Claude (claude.ai), open Settings, then Connectors, and add a custom connector:\n- Name: {displayName}\n- URL: {origin}/mcp\nThen list the available tools, {exampleLower}, and show me the result.",
    pClaudeCode:
      "Set up the {displayName} MCP server so I can query it from here.\n1. Run: claude mcp add --transport http {slug} {origin}/mcp\n2. Run `claude mcp list` to confirm it connected.\n3. {example}, and show me the result.",
    pCli:
      "# MCP endpoint (streamable HTTP)\n{origin}/mcp\n\n# List the available tools\ncurl -s -X POST {origin}/mcp -H 'Content-Type: application/json' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    otherTitle: "Everything else",
    otherBody: "Any harness that speaks MCP over streamable HTTP, or plain REST.",
    mcpEndpoint: "MCP endpoint",
    openapiSpec: "OpenAPI spec",
    restBase: "REST base",
  },
  downloads: {
    kicker: "Data",
    title: "Take the files.",
    body: "The crosswalk, the combined facility records, and the match statistics. MIT licensed.",
    files: [
      { name: "crosswalk.csv", desc: "1,879 rows: NPRI ID, GHGRP ID, match method, confidence tier, temp-ID aliases" },
      { name: "facilities.json", desc: "Full combined records for every matched facility, GHG beside toxics" },
      { name: "stats.json", desc: "Match statistics: anchored, resolved, unmatched, totals" },
    ],
    download: "Download",
  },
  footer: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or Environment and Climate Change Canada.",
    sources: "NPRI bulk files for all years and GHGRP emissions-by-gas, both via open.canada.ca (Environment and Climate Change Canada). Derived tables are MIT licensed.",
  },
};

export type Dict = typeof en;

const fr: Dict = {
  banner: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni Environnement et Changement climatique Canada.",
    badge: "Code source ouvert",
  },
  nav: { explorer: "Explorateur", showcase: "Vitrine", developers: "Développeurs", data: "Données", back: "Tous les projets" },
  hero: {
    kicker: "Open Nshipyard · Projet P2",
    title: "Quels émetteurs de carbone sont aussi les pires pollueurs toxiques.",
    sub: "Environnement et Changement climatique Canada tient deux registres d'installations qui ne partagent aucune clé publiée. Le Programme de déclaration des gaz à effet de serre nomme 1 879 émetteurs pour 2024. L'Inventaire national des rejets de polluants suit 24 553 pollueurs depuis 1993. Ce projet les relie : 1 422 appariements directs sur les ID INRP déclarés, résolution d'entités pour les autres, quarantaine pour les ambigus. Le classement combiné est la première réponse publique à la question titre.",
    cta1: "Rechercher les installations",
    cta2: "Lire la méthodologie",
  },
  stats: [
    { value: "1 879", label: "installations déclarant des GES en 2024, chacune reliée au registre des polluants" },
    { value: "75,7 %", label: "appariées directement sur les ID INRP déclarés. Sans deviner." },
    { value: "249,8 M t", label: "d'équivalent CO2 déclarés pour 2024 par les installations reliées" },
    { value: "124", label: "installations de plus récupérées par résolution de noms et d'adresses" },
  ],
  explorer: {
    kicker: "Explorateur",
    title: "Recherchez parmi les installations reliées.",
    search: "Rechercher par nom d'installation, entreprise ou ville…",
    province: "Province",
    allProvinces: "Toutes les provinces",
    method: "Méthode d'appariement",
    allMethods: "Toutes les méthodes",
    anchored: "Direct",
    resolved: "Nom/adresse résolus",
    showing: "Affichage de",
    of: "sur",
    noResult: "Aucune installation ne correspond.",
    empty: "Recherchez ci-dessus pour parcourir la table de correspondance. Chaque installation porte son total de GES 2024 à côté de ses rejets et éliminations toxiques 2024, plus la méthode d'appariement et le niveau de confiance.",
    confidence: "confiance",
    ghg: "Émissions de GES, 2024",
    releases: "rejets",
    disposals: "éliminations",
    transfers: "transferts",
    toxics: "toxiques",
    unitNote: "Les quantités de l'INRP sont en kilogrammes de substance déclarés, unités normalisées en kg. Les GES sont en tonnes d'équivalent CO2 publiées par le PDGES.",
    back: "Retour aux résultats",
  },
  showcase: {
    kicker: "Vitrine",
    title: "La même usine, deux identités.",
    body: "L'exploitation des sables bitumineux de Suncor trône au sommet des deux listes à la fois : 8,0 M de tonnes d'éq. CO2 (rang GES 1) et 126,1 M de kg de toxiques (rang toxiques 5). Quatre des cinq premiers au combiné sont des sables bitumineux albertains. La liste des toxiques seuls est différente : elle est menée par des mines, parce que les éliminations de l'INRP incluent les résidus et les stériles. Les registres n'ont jamais partagé de clé. Personne ne pouvait voir les deux moitiés d'une même installation avant cette table.",
    matchTitle: "Comment la table a été appariée",
    matchSub: "Chacune des 1 879 installations du PDGES pour 2024 tombe dans exactement un seau.",
    anchored: "Direct",
    resolved: "Nom/adresse résolus",
    unmatched: "Non appariées",
    matched: "appariées",
    ofFacilities: "des installations",
    zeroNote: "426 installations du PDGES déclarent leur ID INRP comme le simple chiffre 0, un espace réservé, pas un ID. 22 le laissent vide. La résolution d'entités en a récupéré 124 à partir des noms, adresses et entreprises. Les autres sont honnêtement non appariées, pas devinées.",
    mapTitle: "Une carte, deux registres",
    mapSub: "Installations appariées placées selon leurs coordonnées publiées. Le rouge penche vers le carbone, le bleu marine vers les toxiques, la taille suit l'ampleur totale.",
    legendGhg: "Dominante carbone",
    legendTox: "Dominante toxiques",
    legendBoth: "Équilibré",
    mapFoot: "Coordonnées publiées par ECCC",
    combinedTitle: "Le classement combiné",
    combinedSub: "Installations classées par la somme de leur rang GES et de leur rang toxiques. Trôner haut sur les deux listes à la fois est la pire place du pays.",
    ghgLabel: "GES, 2024",
    toxLabel: "Toxiques, 2024",
    ghgTitle: "Plus gros émetteurs de carbone",
    ghgSub: "Totaux 2024 en tonnes d'équivalent CO2, publiés par le PDGES.",
    toxTitle: "Plus gros pollueurs toxiques",
    toxSub: "Rejets plus éliminations 2024, en kilogrammes, d'après les fichiers bruts de l'INRP.",
    citeThis: "Citer ceci",
    copied: "Copié",
    citeCombined: "La Table de correspondance des installations (Open Nshipyard, 2026) : l'exploitation des sables bitumineux de Suncor arrive 1re pour les émissions de GES 2024 (8,0 M t éq. CO2) et 5e pour les rejets et éliminations toxiques (126,1 M kg) parmi 1 546 installations appariées. Sources : fichiers bruts de l'INRP et émissions par gaz du PDGES d'ECCC via open.canada.ca.",
    citeTox: "La Table de correspondance des installations (Open Nshipyard, 2026) : la mine Copper Mountain a déclaré 258,3 M kg de rejets et d'éliminations toxiques en 2024, le plus haut total parmi 1 546 installations appariées, contre 43 028 t éq. CO2. Sources : fichiers bruts de l'INRP et émissions par gaz du PDGES d'ECCC via open.canada.ca.",
  },
  methodology: {
    kicker: "Méthodologie",
    title: "Comment la table a été construite, et où elle est faible.",
    items: [
      "Sources, récupérées le 2026-10-10 sous la Licence du gouvernement ouvert - Canada : les fichiers bruts de l'INRP pour toutes les années (jeu de données ECCC 40e01423-7728-429c-ac9d-2954385ccdfb, mis à jour le 2026-05-01) : fichier maître de géolocalisation avec 24 553 dossiers d'installations, plus les fichiers de quantités de rejets, d'éliminations et de transferts 1993-2024. Et le fichier des émissions par gaz du PDGES PDGES-GHGRP-GHGEmissionsGES-2004-Present (jeu de données ECCC a8ba14b7-7f23-462a-bdbb-83b0ef629823, mis à jour le 2026-05-27), 20 685 lignes installation-année, dont 1 879 pour 2024.",
      "Appariement direct : une installation du PDGES dont l'ID INRP est non nul, non vide et présent dans le fichier maître de géolocalisation de l'INRP est un appariement direct, confiance élevée. 1 422 des 1 879 installations du PDGES correspondent ainsi (75,7 %).",
      "Résolution d'entités pour les 457 installations non appariées : les noms sont mis en majuscules, accents retirés, suffixes juridiques supprimés, ponctuation enlevée, puis notés contre les installations de l'INRP de la même province. Un score de 0,90 ou plus avec des coordonnées à moins de 25 km (quand les deux côtés les publient) devient un appariement résolu, confiance élevée à 0,99+ et moyenne en dessous. 124 installations appariées ainsi.",
      "Résolution des ID temporaires : les fichiers de quantités de l'INRP contiennent 3 ID d'installations absents du fichier maître de géolocalisation. Aucun ne s'est résolu sans ambiguïté vers un seul dossier maître. Les 3 sont donc mis en quarantaine et leurs quantités sont exclues plutôt que devinées. Le problème des ID temporaires est plus petit que ce que la documentation des registres laisse entendre, du moins dans les fichiers actuels.",
      "Quarantaine : les quasi-appariements à faible similarité, les appariements de noms dont les coordonnées divergent de plus de 25 km et les ID temporaires à plusieurs candidats maîtres sont consignés dans quarantine.json et exclus de tous les classements. Deviner est pire que ne pas apparier.",
      "Totaux toxiques : rejets et éliminations 2024 additionnés par installation en kilogrammes. Les unités sources étaient la tonne (la grande majorité), le kilogramme et le gramme. Les grammes d'équivalent toxique (dioxines et furanes) sont exclus des sommes en kilogrammes et comptés à part parce qu'ils ne sont pas une masse. Les éliminations de l'INRP incluent les résidus et les stériles, qui dominent les totaux miniers : le classement traite l'élimination confinée et le rejet dans l'environnement de la même façon au kilogramme près, ce qui avantage les mines et minimise les toxiques atmosphériques. Les transferts pour recyclage sont exclus en attendant la récupération complète du fichier brut des transferts.",
      "Limites : année de déclaration 2024 des deux côtés. Le PDGES couvre les installations émettant 10 kilotonnes d'éq. CO2 ou plus par an. L'INRP a ses propres seuils par substance et par effectif, donc les petits pollueurs sont absents des deux. Les kilogrammes ne sont pas le dommage : un kilogramme de mercure et un kilogramme de nitrate diffèrent complètement en nocivité. 426 installations du PDGES déclarent leur ID INRP comme un simple 0, un espace réservé.",
    ],
  },
  developers: {
    kicker: "Pour les développeurs",
    title: "Interrogez-la depuis du code, ou depuis un agent.",
    body: "Trois façons de consommer les mêmes données canoniques. REST pour les applications, OpenAPI pour l'intégration, outils MCP en HTTP continu pour les agents IA.",
    endpoints: "Points de terminaison",
    tryIt: "Essayer",
    openapi: "Spécification OpenAPI",
    mcpTitle: "Serveur MCP",
    mcpBody: "Un point de terminaison HTTP continu. Outils : facility_lookup, crosswalk_search, match_stats.",
  },
  mcp: {
    kicker: "Connectez votre agent",
    title: "Exploitez ces données dans vos outils d'IA.",
    body: "Choisissez votre plateforme, copiez l'invite, envoyez-la à votre agent. Votre agent exécute la configuration lui-même.",
    tabs: { chatgpt: "ChatGPT", claude: "Claude", claudecode: "Claude Code", cli: "CLI", other: "Autre" },
    cardTitle: "Copiez et envoyez ceci à {tab}",
    copy: "Copier",
    copied: "Copié",
    chatgptNote: "ChatGPT se connecte via l'API REST documentée plutôt que directement en MCP.",
    pChatgpt:
      "Je veux utiliser {displayName} via son API.\n- Spécification OpenAPI : {origin}/api/openapi.json\n- Base REST : {origin}/api/v1\nD'abord, dis-moi en deux phrases ce que cette API offre, puis {exampleLower}, et montre-moi le résultat.",
    pClaude:
      "Dans Claude (claude.ai), ouvre les paramètres, puis Connecteurs, et ajoute un connecteur personnalisé :\n- Nom : {displayName}\n- URL : {origin}/mcp\nEnsuite, liste les outils disponibles, {exampleLower}, et montre-moi le résultat.",
    pClaudeCode:
      "Configure le serveur MCP {displayName} pour que je puisse l'interroger d'ici.\n1. Exécute : claude mcp add --transport http {slug} {origin}/mcp\n2. Exécute `claude mcp list` pour confirmer la connexion.\n3. {example}, et montre-moi le résultat.",
    pCli:
      "# Point de terminaison MCP (HTTP continu)\n{origin}/mcp\n\n# Lister les outils disponibles\ncurl -s -X POST {origin}/mcp -H 'Content-Type: application/json' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    otherTitle: "Tout le reste",
    otherBody: "Toute plateforme qui parle MCP en HTTP continu, ou REST tout court.",
    mcpEndpoint: "Point de terminaison MCP",
    openapiSpec: "Spécification OpenAPI",
    restBase: "Base REST",
  },
  downloads: {
    kicker: "Données",
    title: "Prenez les fichiers.",
    body: "La table de correspondance, les dossiers combinés des installations et les statistiques d'appariement. Sous licence MIT.",
    files: [
      { name: "crosswalk.csv", desc: "1 879 lignes : ID INRP, ID PDGES, méthode d'appariement, niveau de confiance, alias d'ID temporaires" },
      { name: "facilities.json", desc: "Dossiers combinés complets pour chaque installation appariée, GES à côté des toxiques" },
      { name: "stats.json", desc: "Statistiques d'appariement : directs, résolus, non appariés, totaux" },
    ],
    download: "Télécharger",
  },
  footer: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni Environnement et Changement climatique Canada.",
    sources: "Fichiers bruts de l'INRP pour toutes les années et émissions par gaz du PDGES, via open.canada.ca (Environnement et Changement climatique Canada). Les tables dérivées sont sous licence MIT.",
  },
};

const dicts: Record<Lang, Dict> = { en, fr };

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: dicts[lang] }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
