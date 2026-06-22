export type EvidenceLevel = 'A' | 'B' | 'C' | 'D';
export type SupplementGoal = 'muscle' | 'fat_loss' | 'strength' | 'endurance' | 'recovery' | 'health';
export type PriceTier = 'budget' | 'moderate' | 'premium';

export type Supplement = {
  id: string;
  name: string;
  category: string;
  goals: SupplementGoal[];
  evidence: EvidenceLevel;
  summary: string;
  mechanism: string;
  dosage: string;
  timing: string;
  notes: string | null;
  priceTier: PriceTier;
};

export const SUPPLEMENTS: Supplement[] = [
  {
    id: 'creatine',
    name: 'Creatine Monohydrate',
    category: 'Performance',
    goals: ['muscle', 'strength'],
    evidence: 'A',
    summary: 'The most studied ergogenic supplement. Increases muscle phosphocreatine stores, improving performance in short, high-intensity efforts and enhancing training volume over time.',
    mechanism: 'Replenishes ATP during explosive efforts by donating a phosphate group to ADP. Increases intramuscular PCr by 20–40%, allowing more work per set.',
    dosage: '3–5 g per day',
    timing: 'Any time; post-workout with carbs may improve uptake marginally.',
    notes: 'Monohydrate is as effective as any other form at a fraction of the cost. Causes 1–2 kg initial weight gain from water retention — this is normal and beneficial.',
    priceTier: 'budget',
  },
  {
    id: 'whey-protein',
    name: 'Whey Protein',
    category: 'Protein',
    goals: ['muscle', 'fat_loss', 'recovery'],
    evidence: 'A',
    summary: 'A convenient way to hit daily protein targets. Whey is fast-digesting, high in leucine, and well-supported by decades of research for muscle protein synthesis.',
    mechanism: 'Provides leucine — the primary amino acid that triggers mTOR activation and initiates muscle protein synthesis. Fast absorption makes it effective post-workout.',
    dosage: '20–40 g per serving as needed to hit daily target (1.6–2.2 g/kg bodyweight)',
    timing: 'Post-workout or any time to supplement dietary protein.',
    notes: 'Supplements, not replaces, whole-food protein. Whey concentrate is effective and cheaper than isolate for most people.',
    priceTier: 'moderate',
  },
  {
    id: 'caffeine',
    name: 'Caffeine',
    category: 'Stimulants',
    goals: ['strength', 'endurance', 'fat_loss'],
    evidence: 'A',
    summary: 'The most-consumed and best-studied performance enhancer. Reduces perceived effort, increases power output, and blunts fatigue across aerobic and anaerobic exercise.',
    mechanism: 'Antagonises adenosine receptors, reducing perceived fatigue. Stimulates catecholamine release and may enhance fat oxidation. Proven ergogenic in doses of 3–6 mg/kg.',
    dosage: '3–6 mg per kg bodyweight (200–400 mg for most adults)',
    timing: '30–60 minutes before training.',
    notes: 'Tolerance develops with daily use — cycling off for 1–2 weeks restores sensitivity. Avoid within 6 hours of sleep. Coffee works as well as supplements.',
    priceTier: 'budget',
  },
  {
    id: 'vitamin-d3',
    name: 'Vitamin D3 (Cholecalciferol)',
    category: 'Vitamins & Minerals',
    goals: ['health', 'recovery'],
    evidence: 'B',
    summary: 'The majority of indoor workers are deficient. Adequate vitamin D supports immune function, bone health, testosterone production, and mood regulation.',
    mechanism: 'Precursor to calcitriol (active vitamin D), which acts as a steroid hormone affecting hundreds of gene expression pathways including calcium absorption and immune regulation.',
    dosage: '1000–4000 IU per day (get blood levels tested to personalise)',
    timing: 'With a fat-containing meal for best absorption.',
    notes: 'Take with vitamin K2 (100–200 mcg MK-7) if dosing above 2000 IU to support calcium partitioning. Check serum 25-OH-D3 — aim for 40–60 ng/mL.',
    priceTier: 'budget',
  },
  {
    id: 'omega-3',
    name: 'Omega-3 Fish Oil (EPA + DHA)',
    category: 'Essential Fats',
    goals: ['health', 'recovery'],
    evidence: 'B',
    summary: 'EPA and DHA reduce systemic inflammation, support cardiovascular health, and may modestly improve muscle protein synthesis. Particularly relevant for those with low oily fish intake.',
    mechanism: 'Incorporated into cell membranes, competing with arachidonic acid. Reduces pro-inflammatory eicosanoid production, lowers triglycerides, and supports endothelial function.',
    dosage: '2–3 g combined EPA + DHA per day',
    timing: 'With meals to reduce fishy aftertaste and improve absorption.',
    notes: 'Look at combined EPA + DHA, not total fish oil (a 1000 mg capsule may only have 300 mg EPA + DHA). Algae-based omega-3 is an effective vegan alternative.',
    priceTier: 'moderate',
  },
  {
    id: 'magnesium',
    name: 'Magnesium Glycinate / Bisglycinate',
    category: 'Vitamins & Minerals',
    goals: ['recovery', 'health'],
    evidence: 'B',
    summary: 'Involved in over 300 enzymatic reactions. Athletes often run low due to sweat losses. Supports sleep quality, muscle relaxation, and insulin sensitivity.',
    mechanism: 'Cofactor for ATPase, creatine kinase, and numerous metabolic enzymes. Regulates NMDA glutamate receptors — low magnesium increases excitability and disrupts sleep architecture.',
    dosage: '200–400 mg elemental magnesium per day',
    timing: 'Before bed — promotes muscle relaxation and may improve sleep quality.',
    notes: 'Glycinate and bisglycinate forms are well-absorbed and gentle on digestion. Oxide is cheap but poorly absorbed. Magnesium from food (dark leafy greens, nuts, seeds) is preferable.',
    priceTier: 'budget',
  },
  {
    id: 'beta-alanine',
    name: 'Beta-Alanine',
    category: 'Performance',
    goals: ['endurance', 'strength'],
    evidence: 'B',
    summary: 'Increases intramuscular carnosine, buffering hydrogen ions that accumulate during intense exercise. Particularly effective for efforts lasting 60–240 seconds.',
    mechanism: 'Carnosine buffers H+ in muscle during glycolytic metabolism, delaying acidosis and fatigue. Beta-alanine is the rate-limiting precursor for carnosine synthesis.',
    dosage: '3.2–6.4 g per day (split into 1.6 g doses to reduce paraesthesia)',
    timing: 'Any time with food, split across the day.',
    notes: 'The harmless tingling (paraesthesia) is characteristic. Sustained-release formulations reduce it. Effects build over 4+ weeks. Less useful for pure strength work (<30 sec efforts).',
    priceTier: 'moderate',
  },
  {
    id: 'citrulline',
    name: 'L-Citrulline / Citrulline Malate',
    category: 'Performance',
    goals: ['endurance', 'muscle'],
    evidence: 'B',
    summary: 'A precursor to arginine and nitric oxide. Improves blood flow, reduces exercise-induced fatigue, and may increase training volume in resistance exercise.',
    mechanism: 'Converted to arginine in the kidneys, supporting NO production. Also recycles ammonia into urea, reducing ammonia-induced fatigue during sustained effort.',
    dosage: '6–8 g L-citrulline or 8 g citrulline malate (2:1 ratio) pre-workout',
    timing: '30–60 minutes before training.',
    notes: 'L-citrulline raises plasma arginine more effectively than arginine itself (which is degraded in the gut). Citrulline malate may provide additional benefits from malate.',
    priceTier: 'moderate',
  },
  {
    id: 'ashwagandha',
    name: 'Ashwagandha (KSM-66 or Sensoril)',
    category: 'Adaptogens',
    goals: ['recovery', 'strength', 'health'],
    evidence: 'C',
    summary: 'An Ayurvedic adaptogen with human trial data supporting reduced cortisol, modestly improved stress resilience, and small gains in testosterone and muscle mass in resistance-trained adults.',
    mechanism: 'Withanolides modulate the hypothalamic-pituitary-adrenal axis and reduce cortisol. May protect androgen receptors. Exact mechanisms remain under investigation.',
    dosage: '300–600 mg per day (KSM-66 extract)',
    timing: 'Any time with food; some prefer before bed for the calming effect.',
    notes: 'Use standardised extracts (KSM-66, Sensoril) — unpurified root powder has inconsistent potency. Effects are modest — this is a stress/recovery aid, not a primary performance enhancer.',
    priceTier: 'moderate',
  },
  {
    id: 'zinc',
    name: 'Zinc',
    category: 'Vitamins & Minerals',
    goals: ['health', 'recovery'],
    evidence: 'C',
    summary: 'Essential mineral commonly deficient in athletes due to sweat losses. Zinc supports testosterone synthesis, immune function, and protein metabolism. Supplementing corrects deficiency — not a booster if already sufficient.',
    mechanism: 'Cofactor for >300 enzymes including 5α-reductase and aromatase. Supports LH signalling and Leydig cell function. Immune-critical via thymulin and neutrophil activity.',
    dosage: '15–30 mg elemental zinc per day',
    timing: 'With food (reduces nausea); not with iron or calcium supplements (compete for absorption).',
    notes: 'Supplement only if deficient — chronic oversupply depletes copper. Zinc from red meat, shellfish, and seeds is better absorbed than from supplements.',
    priceTier: 'budget',
  },
  {
    id: 'hmb',
    name: 'HMB (β-Hydroxy β-Methylbutyrate)',
    category: 'Performance',
    goals: ['muscle'],
    evidence: 'C',
    summary: 'A leucine metabolite. Effects in trained individuals are modest and inconsistent; may be more useful in untrained individuals, older adults, or during prolonged caloric deficits.',
    mechanism: 'Activates mTOR and inhibits protein degradation pathways (ubiquitin-proteasome). May reduce muscle damage markers after eccentric exercise.',
    dosage: '3 g per day (1 g × 3 doses)',
    timing: 'Split across meals.',
    notes: 'Most positive evidence comes from sedentary or older populations. Trained athletes consuming adequate protein see minimal additional benefit. Free acid form (HMB-FA) absorbs faster than calcium salt.',
    priceTier: 'premium',
  },
  {
    id: 'bcaa',
    name: 'BCAAs (Branched-Chain Amino Acids)',
    category: 'Protein',
    goals: ['muscle', 'recovery'],
    evidence: 'D',
    summary: 'Largely redundant if protein intake is adequate. BCAAs provide leucine, isoleucine, and valine — already present in any complete protein source. Marketed heavily, but offer no independent benefit above sufficient dietary protein.',
    mechanism: 'Leucine from BCAAs can activate mTOR — but this only matters when other essential amino acids are absent. Whole protein provides the same leucine plus the cofactors needed for complete muscle protein synthesis.',
    dosage: 'Not recommended when protein targets are being met.',
    timing: 'N/A',
    notes: 'BCAAs are vastly over-marketed. A scoop of whey protein costs the same and provides more benefit. The one niche use case is intra-workout supplementation during prolonged fasted training — otherwise, save your money.',
    priceTier: 'moderate',
  },
  {
    id: 'probiotics',
    name: 'Probiotics',
    category: 'Gut Health',
    goals: ['health', 'recovery'],
    evidence: 'C',
    summary: 'Some strains reduce upper respiratory tract infections and GI discomfort during heavy training. The field is early-stage — strain specificity matters enormously and general efficacy is inconsistent.',
    mechanism: 'Modulate gut microbiome composition, support mucosal immunity via sIgA, and may reduce systemic inflammation. Specific strains (e.g. Lactobacillus rhamnosus GG) have the strongest evidence.',
    dosage: '1–10 billion CFU per day (strain dependent)',
    timing: 'With or shortly before a meal.',
    notes: 'Choose products specifying strain names and CFU counts. Refrigerated products are more reliably viable. Fermented foods (kefir, yogurt, kimchi) offer similar benefit with added nutritional value.',
    priceTier: 'moderate',
  },
];

export const SUPPLEMENT_GOALS: { id: SupplementGoal; label: string }[] = [
  { id: 'muscle', label: 'Muscle Gain' },
  { id: 'fat_loss', label: 'Fat Loss' },
  { id: 'strength', label: 'Strength' },
  { id: 'endurance', label: 'Endurance' },
  { id: 'recovery', label: 'Recovery' },
  { id: 'health', label: 'General Health' },
];

export const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  A: 'Strong Evidence',
  B: 'Good Evidence',
  C: 'Limited Evidence',
  D: 'Weak / Avoid',
};

export const EVIDENCE_COLORS: Record<EvidenceLevel, string> = {
  A: '#4ade80',
  B: '#60a5fa',
  C: '#fbbf24',
  D: '#f87171',
};

export function filterSupplements(
  goal: SupplementGoal | null,
  minEvidence: EvidenceLevel | null
): Supplement[] {
  const order: EvidenceLevel[] = ['A', 'B', 'C', 'D'];
  return SUPPLEMENTS.filter(s => {
    if (goal && !s.goals.includes(goal)) return false;
    if (minEvidence) {
      if (order.indexOf(s.evidence) > order.indexOf(minEvidence)) return false;
    }
    return true;
  });
}
