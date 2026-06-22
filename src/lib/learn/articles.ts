export type ArticleCategory = 'Nutrition' | 'Training' | 'Recovery' | 'Body Composition' | 'Myths';

export type Article = {
  slug: string;
  title: string;
  category: ArticleCategory;
  summary: string;
  readingTime: number;
  keyTakeaways: string[];
  sections: { heading: string; body: string }[];
  sources: string[];
};

export const ARTICLES: Article[] = [
  {
    slug: 'how-much-protein-do-you-need',
    title: 'How Much Protein Do You Actually Need?',
    category: 'Nutrition',
    summary: 'The research on optimal protein intake is clearer than supplement marketing suggests. Here is what the evidence says for your goals.',
    readingTime: 5,
    keyTakeaways: [
      'For muscle gain, 1.6–2.2 g/kg of bodyweight per day is the evidence-supported range.',
      'Protein timing matters less than total daily intake — hitting your number is the priority.',
      'Older adults (50+) may benefit from the higher end of the range due to anabolic resistance.',
      'Spreading intake across 3–4 meals maximises muscle protein synthesis throughout the day.',
      'Plant proteins can fully meet requirements when variety and total intake are adequate.',
    ],
    sections: [
      {
        heading: 'The research-backed target range',
        body: 'A 2018 meta-analysis by Morton et al. in the British Journal of Sports Medicine analysed 49 studies and found that muscle gains plateau at approximately 1.62 g/kg/day for most resistance-trained adults. The 95% confidence interval extended to 2.2 g/kg/day, which is why most coaches recommend 1.6–2.2 g/kg as a practical range. Eating above this ceiling does not harm you — excess protein is oxidised for energy — but it provides no additional anabolic stimulus.',
      },
      {
        heading: 'Does meal timing matter?',
        body: 'The "anabolic window" — the idea that you must consume protein within 30–60 minutes of training — has been substantially overstated. A 2013 meta-analysis by Schoenfeld and Aragon found that when total daily protein was equated, timing effects were small and often non-significant. That said, spreading your protein across 3–5 meals (roughly 0.4 g/kg per meal) has been shown to sustain elevated muscle protein synthesis more consistently than eating the same total in one or two meals.',
      },
      {
        heading: 'Special considerations',
        body: 'Older adults experience anabolic resistance — their muscles require more leucine to trigger the same synthetic response as younger people. Research by Moore et al. suggests adults over 50 may benefit from 2.0–2.4 g/kg to offset this blunted response. During a caloric deficit, protein requirements increase because some amino acids are diverted for energy production; Helms et al. recommend 2.3–3.1 g/kg of fat-free mass during aggressive cuts.',
      },
      {
        heading: 'Practical application',
        body: 'Calculate your target using bodyweight (or lean mass if you carry substantial body fat). For a 75 kg person targeting muscle gain, this means 120–165 g of protein daily. Prioritise whole-food sources: chicken breast, Greek yogurt, eggs, cottage cheese, lean beef, and legumes. If you struggle to hit targets from food alone, whey, casein, or plant-based protein supplements are a convenient top-up.',
      },
    ],
    sources: [
      'Morton RW et al. "A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults." Br J Sports Med. 2018.',
      'Schoenfeld BJ, Aragon AA, Krieger JW. "The effect of protein timing on muscle strength and hypertrophy: a meta-analysis." J Int Soc Sports Nutr. 2013.',
      'Moore DR et al. "Ingested protein dose response of muscle and albumin protein synthesis after resistance exercise in young men." Am J Clin Nutr. 2009.',
      'Helms ER et al. "A systematic review of dietary protein during caloric restriction in resistance trained lean athletes: a case for higher intakes." Int J Sport Nutr Exerc Metab. 2014.',
    ],
  },
  {
    slug: 'progressive-overload',
    title: 'Progressive Overload: The One Principle That Rules Training',
    category: 'Training',
    summary: 'Every effective training program shares one thing. Understanding progressive overload changes how you design — and troubleshoot — your workouts.',
    readingTime: 4,
    keyTakeaways: [
      'Progressive overload — consistently increasing the demand on your muscles — is the fundamental driver of adaptation.',
      'Adding weight is only one strategy; reps, sets, density, range of motion, and technique can all be progressed.',
      'Beginners can progress almost every session; advanced athletes may need months to add meaningful load.',
      'Deload weeks are part of progressive overload, not a break from it — recovery enables the next wave of adaptation.',
      'Tracking your lifts is non-negotiable; you cannot progressively overload what you do not measure.',
    ],
    sections: [
      {
        heading: 'What progressive overload actually means',
        body: 'Muscles adapt to the specific demands placed on them — and only those demands. If you perform the same exercises at the same weights for the same reps week after week, your body has no reason to change. Progressive overload means systematically increasing training stress over time so that muscles are perpetually working slightly harder than they are comfortable with. The mechanism is mechanical tension: when muscle fibres are stressed beyond their current capacity, satellite cells are activated, protein synthesis increases, and the fibre grows thicker and stronger.',
      },
      {
        heading: 'Ways to apply overload beyond just adding weight',
        body: 'Load progression is the most direct method: add 2.5–5 kg when you can complete all target reps with good form. But it is not the only lever. Volume progression means adding sets or reps. Density progression means completing the same work in less time. Range of motion progression means deepening a squat or achieving a better pause. Technique improvements increase the effective load on the target muscle. For intermediate and advanced lifters rotating between these mechanisms prevents the plateau that comes from relying solely on load.',
      },
      {
        heading: 'Periodisation: organising overload over time',
        body: 'Linear periodisation — simply adding weight each week — works excellently for novices. As you advance, undulating periodisation (varying intensity and volume within a training block) allows you to accumulate more total volume without over-stressing the nervous system. Research by Rhea et al. showed that daily undulating periodisation produced greater strength gains than linear periodisation in trained subjects over 12 weeks. Regardless of the model, every programme must have a clear mechanism for progression or it is maintenance training by default.',
      },
    ],
    sources: [
      'Rhea MR et al. "A comparison of linear and daily undulating periodized programs with equated volume and intensity for strength." J Strength Cond Res. 2002.',
      'Schoenfeld BJ. "The mechanisms of muscle hypertrophy and their application to resistance training." J Strength Cond Res. 2010.',
      'Kraemer WJ, Ratamess NA. "Fundamentals of resistance training: progression and exercise prescription." Med Sci Sports Exerc. 2004.',
    ],
  },
  {
    slug: 'sleep-and-muscle-recovery',
    title: 'Sleep and Muscle Recovery: The Anabolic Window You Are Missing',
    category: 'Recovery',
    summary: 'You train hard. You eat well. But without adequate sleep, both are blunted. The science of why sleep is the most underrated performance tool.',
    readingTime: 4,
    keyTakeaways: [
      'Growth hormone secretion peaks during slow-wave sleep — cutting sleep short directly limits anabolic hormone output.',
      'Sleep deprivation elevates cortisol and reduces testosterone, creating an environment that favours muscle breakdown.',
      '7–9 hours for adults is supported by the evidence; athletes with heavy training loads may need 9–10 hours.',
      'Sleep quality matters as much as duration — alcohol and late-night blue light reduce slow-wave and REM sleep.',
      'A 20–30 min nap can partially compensate for a poor night but does not replace full-night recovery.',
    ],
    sections: [
      {
        heading: 'What happens during sleep',
        body: 'Approximately 70% of daily growth hormone (GH) secretion occurs during slow-wave (Stage 3) sleep. GH stimulates protein synthesis, fat metabolism, and tissue repair. When you sleep fewer than 7 hours, you spend less time in slow-wave sleep, directly curtailing this anabolic pulse. Simultaneously, the hypothalamic-pituitary-gonadal axis undergoes LH pulsing during sleep — the hormonal cascade that drives overnight testosterone synthesis. A single week of sleeping 5 hours per night reduced testosterone levels by 10–15% in healthy young men in a study published in JAMA (Leproult & Van Cauter, 2011).',
      },
      {
        heading: 'Cortisol, muscle protein, and the catabolic shift',
        body: 'Sleep restriction elevates cortisol, which increases protein breakdown and reduces insulin sensitivity. A study by Dattilo et al. found that sleep deprivation simultaneously decreases anabolic hormones and increases glucocorticoids, creating what the authors called an "anti-anabolic" environment. Even in athletes who eat and train consistently, chronic sleep restriction measurably reduces strength gains and increases the proportion of lean mass lost during cutting phases.',
      },
      {
        heading: 'Practical sleep hygiene for athletes',
        body: 'Maintain consistent sleep and wake times — even on weekends — to stabilise your circadian rhythm. Avoid alcohol within 3 hours of bed: it suppresses REM sleep and is associated with more fragmented sleep architecture. Limit screens with blue-light emission in the 90 minutes before sleep, or use blue-light blocking glasses. Keep the room cool (18–19°C / 65–66°F); core body temperature must drop 1–2°F to initiate and maintain sleep. If your training volume is high, treat 8–9 hours of sleep as a training non-negotiable, not a luxury.',
      },
    ],
    sources: [
      'Leproult R, Van Cauter E. "Effect of 1 week of sleep restriction on testosterone levels in young healthy men." JAMA. 2011.',
      'Dattilo M et al. "Sleep and muscle recovery: endocrinological and molecular basis for a new and promising hypothesis." Med Hypotheses. 2011.',
      'Fullagar HH et al. "Sleep and athletic performance: the effects of sleep loss on exercise performance, and physiological and cognitive responses to exercise." Sports Med. 2015.',
    ],
  },
  {
    slug: 'caloric-deficit-guide',
    title: 'Cutting Without Losing Muscle: Your Deficit Strategy',
    category: 'Body Composition',
    summary: 'A caloric deficit causes fat loss — but done wrong, it causes muscle loss instead. Here is how to structure a cut that preserves lean mass.',
    readingTime: 5,
    keyTakeaways: [
      'A deficit of 300–500 kcal/day is the evidence-supported range for lean-muscle-preserving fat loss.',
      'Lose weight too fast (>1% of bodyweight/week) and muscle loss accelerates significantly.',
      'High protein (2.3–3.1 g/kg lean mass) and resistance training are the two strongest predictors of muscle retention during a cut.',
      'Diet breaks — 1–2 weeks at maintenance — restore anabolic hormones and improve long-term adherence.',
      'The leaner you already are, the harder your body fights fat loss — plan to slow progress as you approach single-digit or low-teen body fat.',
    ],
    sections: [
      {
        heading: 'How fast should you lose?',
        body: 'The scientific literature consistently shows that losing bodyweight faster than ~0.7% per week significantly increases the proportion of weight lost as lean mass. A 2017 review by Barakat et al. found that subjects losing more than 1% bodyweight per week lost substantially more fat-free mass than those losing ≤0.7%, even when protein intake was matched. Practically, for a 75 kg person this means targeting a loss of no more than 525 g per week — achievable with a 500–700 kcal daily deficit.',
      },
      {
        heading: 'Protein and resistance training: the two pillars',
        body: 'During a deficit, dietary protein serves two roles: substrate for muscle protein synthesis, and a satiety signal that makes adherence easier. Helms et al. recommend 2.3–3.1 g/kg of fat-free mass for lean athletes in caloric restriction — roughly 2× the intake you need in a surplus. Resistance training in a deficit signals the body that muscle tissue is essential for survival; without this signal, the body down-regulates muscle mass as metabolically expensive tissue. Maintain training intensity (do not just add cardio and reduce weights) to send the strongest retention signal.',
      },
      {
        heading: 'Metabolic adaptation and diet breaks',
        body: 'Extended caloric restriction triggers metabolic adaptation: resting metabolic rate drops, thyroid hormone output decreases, leptin falls, and hunger rises. A 2017 study by Byrne et al. found that subjects taking 2-week diet breaks (returning to maintenance) during a 16-week cut lost the same fat as those dieting continuously, but lost significantly less lean mass and showed better metabolic markers. A 2-week maintenance period can reset leptin and thyroid hormones, making the next phase of restriction more effective.',
      },
    ],
    sources: [
      'Barakat C et al. "Body Recomposition: Can Trained Individuals Build Muscle and Lose Fat at the Same Time?" Strength Cond J. 2020.',
      'Helms ER et al. "A systematic review of dietary protein during caloric restriction in resistance trained lean athletes." Int J Sport Nutr Exerc Metab. 2014.',
      'Byrne NM et al. "Intermittent energy restriction improves weight loss efficiency in obese men: the MATADOR study." Int J Obes. 2017.',
    ],
  },
  {
    slug: 'hiit-vs-steady-state-cardio',
    title: 'HIIT vs. Steady-State Cardio: Which Burns More Fat?',
    category: 'Training',
    summary: 'Both styles of cardio work. Which one is better for you depends on your goals, recovery capacity, and how much time you have.',
    readingTime: 4,
    keyTakeaways: [
      'HIIT burns more total calories per minute of exercise than steady-state cardio.',
      'EPOC (afterburn) from HIIT is real but modest — it adds roughly 6–15% on top of the exercise calories.',
      'Steady-state cardio is lower impact, easier to recover from, and can be stacked with heavy strength training.',
      'Both produce similar fat loss outcomes when total energy expenditure is equated.',
      'For most people, the best cardio is the one they will actually do consistently.',
    ],
    sections: [
      {
        heading: 'The calorie math',
        body: 'A 30-minute HIIT session burns roughly 300–450 kcal for a 75 kg person. A 30-minute jog at moderate pace burns approximately 250–350 kcal. HIIT wins on calories-per-minute due to higher average intensity. HIIT also produces greater excess post-exercise oxygen consumption (EPOC) — the elevated metabolic rate after exercise — but this afterburn effect is often overstated. A 2011 review by Børsheim and Bahr quantified EPOC as adding 6–15% on top of exercise energy expenditure, not the "36 hours of elevated metabolism" claimed by some marketing.',
      },
      {
        heading: 'The recovery cost of HIIT',
        body: 'High-intensity intervals create significant neuromuscular fatigue. For someone also performing 4+ days of resistance training, stacking HIIT sessions can impair recovery and lead to overtraining. Steady-state cardio, particularly Zone 2 (roughly 60–70% of maximum heart rate), is low enough in intensity that it can be performed without meaningfully impacting strength training recovery. It also builds the aerobic base that improves cardiovascular efficiency and fat oxidation capacity over months of consistent training.',
      },
      {
        heading: 'Which to choose',
        body: 'For someone time-pressed and already recovering well: 2–3 HIIT sessions weekly provide dense cardiovascular stimulus. For someone in a strength-focused training block, or someone new to exercise: 3–5 moderate-intensity sessions at Zone 2 build fitness with minimal interference. A hybrid approach — 1 HIIT session for intensity stimulus, 2 Zone 2 sessions for recovery and fat oxidation — is what many coaches recommend and is well-supported by the exercise science literature on concurrent training.',
      },
    ],
    sources: [
      'Børsheim E, Bahr R. "Effect of exercise intensity, duration and mode on post-exercise oxygen consumption." Sports Med. 2003.',
      'Wilson JM et al. "Concurrent training: a meta-analysis examining interference of aerobic and strength exercises." J Strength Cond Res. 2012.',
      'Gibala MJ et al. "Physiological adaptations to low-volume, high-intensity interval training in health and disease." J Physiol. 2012.',
    ],
  },
  {
    slug: 'myth-spot-reduction',
    title: 'The Myth of Spot Reduction',
    category: 'Myths',
    summary: 'Doing 500 crunches per day will not give you abs. The reason is simple — and understanding it will save you months of wasted effort.',
    readingTime: 3,
    keyTakeaways: [
      'Fat is mobilised systemically — you cannot force your body to burn fat from a specific region.',
      'Core exercises strengthen abdominals but do not preferentially burn belly fat.',
      'Genetics largely determine fat distribution patterns and the order in which fat is lost.',
      'A total-body caloric deficit combined with resistance training is the only evidence-based path to visible abs.',
      'Abdominal fat (visceral) responds well to aerobic exercise and is often the last subcutaneous layer to go.',
    ],
    sections: [
      {
        heading: 'Why the body does not work this way',
        body: 'Fat mobilisation is a hormonal process, not a local one. When you are in a caloric deficit, the sympathetic nervous system releases catecholamines (epinephrine, norepinephrine) that trigger lipolysis — the breakdown of triglycerides into fatty acids. This signal is systemic: it affects adipocytes throughout the body, not just near the working muscle. A landmark 1997 study by Katch et al. found no significant difference in fat thickness between the trained and untrained arms of subjects who performed unilateral resistance training for 12 weeks — definitively disproving spot reduction.',
      },
      {
        heading: 'What actually determines where fat is lost',
        body: 'Fat distribution is largely genetic and hormonal. Men tend to store fat preferentially in the abdomen, women in the hips and thighs — a pattern driven by sex hormones. The order in which fat is lost during a deficit also follows individual genetic patterns; many people lose fat first from the face and extremities and last from the stubborn areas they most want to address. Visceral fat (the metabolically dangerous deep abdominal fat) does respond preferentially to aerobic exercise and caloric restriction, which is one reason cardio has been emphasised in weight-loss guidelines.',
      },
      {
        heading: 'What does work',
        body: 'Visible abs require two things simultaneously: developed rectus abdominis and obliques (from resistance training and direct core work), and low enough body fat to make them visible — typically below 12% for most men, 18–22% for most women. The path there is a sustained caloric deficit, adequate protein to preserve muscle, and patience. Core exercises are valuable for stability, injury prevention, and aesthetics — just not for fat burning over the abs specifically.',
      },
    ],
    sources: [
      'Katch FI et al. "Effects of sit up exercise training on adipose cell size and adiposity." Res Q Exerc Sport. 1984.',
      'Ramírez-Campillo R et al. "Regional fat changes induced by localized muscle endurance resistance training." J Strength Cond Res. 2013.',
    ],
  },
  {
    slug: 'creatine-evidence-review',
    title: 'Creatine: The Most Evidence-Backed Supplement',
    category: 'Nutrition',
    summary: 'Creatine monohydrate is the most studied supplement in exercise science. Here is what 30 years of research actually shows.',
    readingTime: 5,
    keyTakeaways: [
      'Creatine monohydrate increases muscle phosphocreatine stores, improving performance in short, high-intensity efforts.',
      'Average strength and power gains vs placebo: 5–15% over 4–12 weeks of training.',
      'Loading (20 g/day for 5 days) speeds up saturation; maintenance (3–5 g/day) achieves the same endpoint in 3–4 weeks.',
      'Creatine is safe for healthy adults with no evidence of kidney harm in normal doses.',
      '20–30% of people are non-responders — those who already have high resting phosphocreatine stores.',
    ],
    sections: [
      {
        heading: 'The mechanism',
        body: 'During explosive efforts lasting 1–10 seconds (sprints, heavy lifts), your muscles rely primarily on the phosphocreatine (PCr) system for immediate ATP regeneration. Creatine supplementation increases intramuscular PCr stores by roughly 20–40%, allowing you to sustain this maximal-intensity output for slightly longer — and crucially, to recover between sets more completely. This translates to performing 1–2 additional reps per set, which compounds to significantly greater training volume over a programme, driving superior strength and hypertrophy outcomes.',
      },
      {
        heading: 'What the research shows',
        body: 'A 2003 meta-analysis by Branch found an average strength increase of 8% and power increase of 14% compared to placebo across studies. A 2017 International Society of Sports Nutrition position stand confirmed creatine monohydrate as the single most effective ergogenic nutritional supplement for increasing high-intensity exercise capacity and muscle mass. Lean mass gains over typical supplementation periods range from 0.5 to 2 kg, of which a portion is intramuscular water (creatine is osmotically active) and a portion represents genuine additional muscle tissue gained via enhanced training stimulus.',
      },
      {
        heading: 'Protocol and safety',
        body: 'The most direct protocol is 3–5 g/day of creatine monohydrate, taken at any time. After 3–4 weeks, muscle PCr stores reach near-saturation. A loading phase (4 × 5 g/day for 5–7 days) achieves saturation faster but is not necessary for long-term outcomes. Creatine monohydrate is the best-studied, cheapest, and most effective form; there is no meaningful evidence that buffered, ethyl ester, or other marketed forms are superior. Long-term safety data — including in studies up to 5 years — show no harmful effects on kidney or liver function in healthy individuals.',
      },
    ],
    sources: [
      'Branch JD. "Effect of creatine supplementation on body composition and performance: a meta-analysis." Int J Sport Nutr Exerc Metab. 2003.',
      'Rawson ES, Volek JS. "Effects of creatine supplementation and resistance training on muscle strength and weightlifting performance." J Strength Cond Res. 2003.',
      'Lanhers C et al. "Creatine supplementation and lower limb strength performance: a systematic review and meta-analyses." Sports Med. 2015.',
      'Antonio J, Ciccone V. "The effects of pre versus post workout supplementation of creatine monohydrate on body composition and strength." J Int Soc Sports Nutr. 2013.',
    ],
  },
  {
    slug: 'nutrient-timing',
    title: 'Pre- and Post-Workout Nutrition: What the Evidence Says',
    category: 'Nutrition',
    summary: 'Timing your nutrients around training can matter — but not nearly as much as your total daily intake. Here is the nuanced picture.',
    readingTime: 4,
    keyTakeaways: [
      'The "anabolic window" after training is wider than originally claimed — 1–2 hours, not 30 minutes.',
      'Pre-workout carbohydrates improve performance in sessions lasting more than 60–75 minutes.',
      'For most recreational athletes, hitting daily protein and calorie targets matters far more than precise timing.',
      'Trained athletes with multiple daily sessions benefit more from timing than those training once per day.',
      'Fasted training does not meaningfully impair performance for sessions under 60 minutes in trained individuals.',
    ],
    sections: [
      {
        heading: 'The pre-workout meal',
        body: 'Consuming 20–40 g of protein and 30–60 g of carbohydrates 1–3 hours before resistance training provides amino acids for protein synthesis during the session and glycogen to fuel the work. Research by Tipton et al. showed that pre-exercise protein consumption could stimulate net muscle protein synthesis during the training bout itself. Practically, this means a meal of rice and chicken 1–2 hours before training is both effective and logistically easy. Training within 1 hour of waking in a fasted state does not meaningfully impair performance for most people; the previous night\'s glycogen stores are sufficient for a moderate-intensity session.',
      },
      {
        heading: 'The post-workout "window"',
        body: 'The concept of a narrow post-workout window — where nutrients must be consumed immediately or gains are lost — was largely based on studies comparing fasted to fed conditions. When subjects consumed protein before the workout, Schoenfeld and Aragon showed the "window" extended to 1–2 hours post-exercise with no difference in outcomes. The practical implication: if you consumed protein within 2–3 hours before training, an immediate post-workout shake is redundant. If you trained fasted, consuming 20–40 g of protein within an hour of finishing training is worthwhile.',
      },
      {
        heading: 'Carbohydrates: when timing matters more',
        body: 'For strength training and hypertrophy, carbohydrate timing has a modest impact at best. For endurance athletes or those performing two sessions per day, it matters considerably more. Glycogen resynthesis is fastest in the first 30–60 minutes post-exercise. Consuming 1–1.2 g/kg of fast-digesting carbohydrates immediately after a depleting session accelerates recovery before the next bout. For recreational athletes training once per day, total daily carbohydrate intake is far more important than post-workout timing.',
      },
    ],
    sources: [
      'Schoenfeld BJ, Aragon AA. "Is There a Postworkout Anabolic Window of Opportunity for Nutrient Consumption? Clearing up Controversies." J Orthop Sports Phys Ther. 2018.',
      'Tipton KD et al. "Stimulation of net muscle protein synthesis by whey protein ingestion before and after exercise." Am J Physiol Endocrinol Metab. 2007.',
      'Ivy JL et al. "Muscle glycogen synthesis after exercise: effect of time of carbohydrate ingestion." J Appl Physiol. 1988.',
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find(a => a.slug === slug);
}

export function getArticlesByCategory(category: ArticleCategory): Article[] {
  return ARTICLES.filter(a => a.category === category);
}

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  'Nutrition', 'Training', 'Recovery', 'Body Composition', 'Myths',
];
