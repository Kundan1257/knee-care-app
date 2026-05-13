export interface Exercise {
  name: string;
  instruction: string;
  category?: string;
}

export interface Relaxation {
  name: string;
  description: string;
}

export interface Recipe {
  name: string;
  description: string;
}

export interface Tea {
  name: string;
  benefit: string;
  description?: string;
  benefits?: string[];
  preparation?: string;
  note?: string;
}

export const EXERCISES: Exercise[] = [
  { name: "Leg Raises", instruction: "Lie on your back and lift one leg straight up while keeping the other bent.", category: "Joint Stability" },
  { name: "Hamstring Curls", instruction: "Stand hold a chair for balance, then lift your heel toward your buttocks.", category: "Strength Focus" },
  { name: "Wall Squats", instruction: "Lean against a wall and slowly slide down until your knees are slightly bent.", category: "Weight Support" },
  { name: "Step-ups", instruction: "Step up onto a low platform with one foot, then step back down.", category: "Strength Focus" },
  { name: "Calf Raises", instruction: "Stand and slowly lift your heels off the floor, then lower them back down.", category: "Daily Mobility" },
];

export const RELAXATIONS: Relaxation[] = [
  { name: "Breathing Relaxation", description: "Deep, slow breaths to calm the nervous system and reduce muscle tension." },
  { name: "Light Stretching", description: "Gentle stretches for the quadriceps and hamstrings to improve flexibility." },
  { name: "Rest Posture", description: "Elevating the legs slightly with a pillow under the knees to reduce pressure." },
  { name: "Gentle Movement", description: "Slowly swinging the legs while sitting to promote joint lubrication." },
  { name: "Mind Relaxation", description: "Focusing on the sensation of the knees and releasing any held tension." },
];

export const RECIPES: Recipe[] = [
  { name: "Turmeric Salmon", description: "Baked salmon with turmeric and lemon for a powerful anti-inflammatory boost." },
  { name: "Quinoa Salad", description: "Light quinoa with fresh greens, walnuts, and a simple olive oil dressing." },
  { name: "Steamed Broccoli & Tofu", description: "Ginger-infused steamed broccoli served with lightly sautéed tofu." },
  { name: "Berry Spinach Smoothie Bowl", description: "Antioxidant-rich berries blended with spinach and topped with chia seeds." },
  { name: "Lentil Soup", description: "Warm, comforting lentil soup with carrots, celery, and anti-inflammatory spices." },
  { name: "Avocado & Chickpea Mash", description: "Mashed avocado and chickpeas on whole-grain toast with a pinch of turmeric." },
  { name: "Roasted Sweet Potato", description: "Oven-roasted sweet potatoes with a drizzle of olive oil and fresh rosemary." },
  { name: "Walnut & Pear Salad", description: "Fresh pears, toasted walnuts, and mixed greens with a balsamic glaze." },
  { name: "Ginger Garlic Shrimp", description: "Quick-sautéed shrimp with fresh ginger and garlic for joint health." },
  { name: "Miso Vegetable Broth", description: "Light miso soup with seaweed and mushrooms for a nutrient-dense dinner." },
];

export const TEAS: Tea[] = [
  { name: "Turmeric Tea", benefit: "Contains curcumin, which helps reduce inflammation and joint pain." },
  { name: "Ginger Tea", benefit: "Known for its anti-inflammatory properties and ability to soothe muscles." },
  { name: "Green Tea", benefit: "Rich in antioxidants that protect joints and improve overall health." },
  { name: "Cinnamon Tea", benefit: "Helps improve circulation and has mild anti-inflammatory effects." },
  { name: "Chamomile Tea", benefit: "Promotes relaxation and helps reduce stress-related muscle tension." },
  {
    name: "Carom Seed Tea (Ajwain Tea)",
    benefit: "Traditional herbal drink with anti-inflammatory and digestive-support properties.",
    description: "Carom seed tea is a traditional herbal drink known for its anti-inflammatory and digestive-support properties. It may help reduce joint discomfort, support detoxification, and improve overall body balance.",
    benefits: [
      "May help reduce inflammation",
      "Supports digestion and gut health",
      "Contains natural antioxidants",
      "Can help relieve bloating and discomfort"
    ],
    preparation: "Take 1 teaspoon of carom seeds (ajwain). Boil in 1–2 cups of water for 5–7 minutes. Strain and serve warm.",
    note: "Use in moderation. If you have any medical condition or are pregnant, consult a professional before regular use."
  },
];
