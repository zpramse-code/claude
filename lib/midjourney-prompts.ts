export interface MidjourneyPrompt {
  id: string
  title: string
  prompt: string
  style: string
  tags: string[]
}

export interface PromptCategory {
  id: string
  name: string
  description: string
  icon: string
  prompts: MidjourneyPrompt[]
}

export const midjourneyPromptCategories: PromptCategory[] = [
  {
    id: 'portrait',
    name: 'Portraits & Figures',
    description: 'Expressive human forms and character studies',
    icon: 'user',
    prompts: [
      {
        id: 'portrait-1',
        title: 'Ethereal Studio Portrait',
        prompt: 'a fine art studio portrait, soft directional lighting, muted earth tones, shallow depth of field, painterly skin texture, editorial fashion pose, linen backdrop --ar 2:3 --style raw --s 300',
        style: 'Photographic / Fine Art',
        tags: ['portrait', 'studio', 'editorial'],
      },
      {
        id: 'portrait-2',
        title: 'Abstract Figure Study',
        prompt: 'abstract human figure rendered in bold gestural brushstrokes, warm ochre and deep indigo palette, textured canvas, expressive movement, inspired by Willem de Kooning --ar 3:4 --s 500 --c 30',
        style: 'Abstract Expressionism',
        tags: ['figure', 'abstract', 'painterly'],
      },
      {
        id: 'portrait-3',
        title: 'Surreal Double Exposure',
        prompt: 'a surreal double exposure portrait, human silhouette filled with a blooming garden of wildflowers, misty atmosphere, soft pastel tones, dreamy ethereal mood, fine art photography --ar 2:3 --style raw --s 400',
        style: 'Surrealist / Photography',
        tags: ['surreal', 'double-exposure', 'floral'],
      },
      {
        id: 'portrait-4',
        title: 'Renaissance Reimagined',
        prompt: 'contemporary portrait in the style of a Renaissance oil painting, dramatic chiaroscuro lighting, rich jewel-toned garments, gold leaf accents, museum-quality detail, ornate gilded frame --ar 3:4 --s 600',
        style: 'Neo-Renaissance',
        tags: ['renaissance', 'classical', 'oil-painting'],
      },
    ],
  },
  {
    id: 'landscape',
    name: 'Landscapes & Environments',
    description: 'Natural vistas and atmospheric scenes',
    icon: 'mountain',
    prompts: [
      {
        id: 'landscape-1',
        title: 'Golden Hour Valley',
        prompt: 'a sweeping valley landscape at golden hour, layered mountain ridges fading into atmospheric haze, warm amber light, impressionist brushwork, sense of vast open space --ar 16:9 --s 500',
        style: 'Impressionist Landscape',
        tags: ['landscape', 'golden-hour', 'mountains'],
      },
      {
        id: 'landscape-2',
        title: 'Moody Seascape',
        prompt: 'dramatic ocean seascape with towering waves crashing against dark basalt cliffs, stormy sky with breaks of silver light, long exposure water effect, cinematic atmosphere --ar 16:9 --style raw --s 400',
        style: 'Dramatic Realism',
        tags: ['ocean', 'seascape', 'moody'],
      },
      {
        id: 'landscape-3',
        title: 'Minimal Desert',
        prompt: 'minimalist desert landscape, vast sand dunes with geometric shadow patterns, single human figure for scale, monochromatic warm palette, clean composition, negative space --ar 3:2 --s 300 --c 10',
        style: 'Minimalist',
        tags: ['desert', 'minimal', 'geometric'],
      },
      {
        id: 'landscape-4',
        title: 'Enchanted Forest',
        prompt: 'an ancient moss-covered forest with shafts of golden light filtering through the canopy, mist rising from the forest floor, bioluminescent mushrooms, fairy-tale atmosphere, hyperdetailed --ar 9:16 --s 500',
        style: 'Fantasy Realism',
        tags: ['forest', 'magical', 'nature'],
      },
    ],
  },
  {
    id: 'abstract',
    name: 'Abstract & Conceptual',
    description: 'Non-representational forms and experimental compositions',
    icon: 'shapes',
    prompts: [
      {
        id: 'abstract-1',
        title: 'Color Field Meditation',
        prompt: 'large scale color field painting, luminous gradients of cadmium red bleeding into cerulean blue, soft edges, meditative calm, inspired by Mark Rothko, gallery exhibition view --ar 3:4 --s 600 --c 20',
        style: 'Color Field',
        tags: ['abstract', 'color-field', 'meditative'],
      },
      {
        id: 'abstract-2',
        title: 'Geometric Deconstruction',
        prompt: 'architectural geometric abstraction, overlapping translucent planes in primary colors, sharp angles, Bauhaus-inspired composition, clean vector aesthetic, white background --ar 1:1 --s 400',
        style: 'Geometric Abstraction',
        tags: ['geometric', 'bauhaus', 'modern'],
      },
      {
        id: 'abstract-3',
        title: 'Organic Fluid Forms',
        prompt: 'organic abstract forms resembling cellular structures, iridescent pearl and opal colors, flowing biomorphic shapes, macro photography aesthetic, scientific beauty --ar 1:1 --style raw --s 500',
        style: 'Biomorphic',
        tags: ['organic', 'fluid', 'biomorphic'],
      },
      {
        id: 'abstract-4',
        title: 'Digital Glitch Tapestry',
        prompt: 'abstract digital glitch art tapestry, corrupted pixel patterns forming emergent patterns, vaporwave color palette of pink cyan and purple, noise texture, cyberpunk data visualization --ar 16:9 --s 400 --c 40',
        style: 'Digital / Glitch',
        tags: ['glitch', 'digital', 'vaporwave'],
      },
    ],
  },
  {
    id: 'still-life',
    name: 'Still Life & Objects',
    description: 'Curated arrangements and object studies',
    icon: 'flower',
    prompts: [
      {
        id: 'still-life-1',
        title: 'Dutch Master Vanitas',
        prompt: 'a Dutch Golden Age vanitas still life, overflowing table with exotic fruits, wilting flowers, a human skull, an hourglass, candlelight, rich dark background, oil paint texture, museum quality --ar 4:3 --s 600',
        style: 'Dutch Masters',
        tags: ['still-life', 'vanitas', 'classical'],
      },
      {
        id: 'still-life-2',
        title: 'Modern Ceramic Study',
        prompt: 'minimalist still life of handmade ceramic vessels on a raw linen surface, warm natural light from a window, wabi-sabi aesthetic, earth tones, subtle imperfections, analog film grain --ar 4:5 --style raw --s 300',
        style: 'Contemporary Minimal',
        tags: ['ceramic', 'minimal', 'wabi-sabi'],
      },
      {
        id: 'still-life-3',
        title: 'Pop Art Objects',
        prompt: 'bold pop art still life of everyday consumer objects, bright saturated primary colors, thick black outlines, Ben-Day dots pattern, inspired by Roy Lichtenstein, graphic poster style --ar 1:1 --s 400',
        style: 'Pop Art',
        tags: ['pop-art', 'bold', 'graphic'],
      },
      {
        id: 'still-life-4',
        title: 'Botanical Illustration',
        prompt: 'detailed botanical illustration of rare exotic flowers, scientific accuracy, delicate watercolor washes on cream paper, handwritten Latin labels, vintage natural history aesthetic --ar 3:4 --s 500',
        style: 'Botanical / Scientific',
        tags: ['botanical', 'illustration', 'watercolor'],
      },
    ],
  },
  {
    id: 'texture',
    name: 'Textures & Patterns',
    description: 'Surface details and repeating motifs for creative assets',
    icon: 'grid',
    prompts: [
      {
        id: 'texture-1',
        title: 'Marble & Gold Veins',
        prompt: 'close-up macro of luxurious white Carrara marble with intricate gold leaf veining, high resolution surface texture, elegant material study, seamless pattern potential --ar 1:1 --style raw --s 300 --tile',
        style: 'Material Study',
        tags: ['marble', 'texture', 'luxury'],
      },
      {
        id: 'texture-2',
        title: 'Woven Textile Pattern',
        prompt: 'intricate hand-woven textile pattern, indigo shibori dye technique, organic irregular patterns on natural cotton, Japanese craft tradition, artisan quality, fabric swatch view --ar 1:1 --s 400 --tile',
        style: 'Textile / Craft',
        tags: ['textile', 'shibori', 'pattern'],
      },
      {
        id: 'texture-3',
        title: 'Abstract Topography',
        prompt: 'abstract topographic contour pattern, layered paper cutout effect with subtle shadows, monochromatic ivory and cream palette, clean modern graphic design, wallpaper design --ar 1:1 --s 300 --tile',
        style: 'Graphic / Topographic',
        tags: ['topography', 'pattern', 'paper'],
      },
      {
        id: 'texture-4',
        title: 'Rusted Metal Surface',
        prompt: 'heavily weathered industrial metal surface, rich rust patina in orange amber and brown, peeling paint layers revealing history, wabi-sabi beauty in decay, extreme close-up --ar 1:1 --style raw --s 400',
        style: 'Industrial / Found',
        tags: ['rust', 'metal', 'industrial'],
      },
    ],
  },
  {
    id: 'conceptual',
    name: 'Conceptual & Narrative',
    description: 'Storytelling imagery and symbolic compositions',
    icon: 'lightbulb',
    prompts: [
      {
        id: 'conceptual-1',
        title: 'Solitude in Architecture',
        prompt: 'a solitary figure standing in a vast brutalist concrete interior, dramatic shaft of light from above, existential atmosphere, Edward Hopper meets Tadao Ando, cinematic composition --ar 2:3 --style raw --s 500',
        style: 'Architectural Narrative',
        tags: ['architecture', 'solitude', 'cinematic'],
      },
      {
        id: 'conceptual-2',
        title: 'Childhood Memory Fragment',
        prompt: 'a dreamlike childhood memory scene, abandoned swing set in an overgrown meadow, soft overcast light, nostalgic faded color palette like a Polaroid photograph, melancholic beauty --ar 3:2 --s 400',
        style: 'Narrative Photography',
        tags: ['nostalgia', 'memory', 'dreamlike'],
      },
      {
        id: 'conceptual-3',
        title: 'Nature Reclaiming',
        prompt: 'nature reclaiming an abandoned urban building, lush vines and trees growing through broken windows and crumbling walls, contrast between organic and man-made, hopeful post-apocalyptic beauty --ar 9:16 --s 500',
        style: 'Post-Urban Nature',
        tags: ['nature', 'urban', 'reclamation'],
      },
      {
        id: 'conceptual-4',
        title: 'Symbolic Self-Portrait',
        prompt: 'a symbolic self-portrait where the subject dissolves into a flock of origami birds, transformation and freedom metaphor, clean white background, elegant paper craft aesthetic, studio lighting --ar 2:3 --s 400 --c 20',
        style: 'Symbolic / Surreal',
        tags: ['symbolic', 'transformation', 'origami'],
      },
    ],
  },
]

export function getAllPrompts(): MidjourneyPrompt[] {
  return midjourneyPromptCategories.flatMap((cat) => cat.prompts)
}

export function getPromptsByCategory(categoryId: string): MidjourneyPrompt[] {
  const category = midjourneyPromptCategories.find((c) => c.id === categoryId)
  return category?.prompts ?? []
}

export function searchPrompts(query: string): MidjourneyPrompt[] {
  const lower = query.toLowerCase()
  return getAllPrompts().filter(
    (p) =>
      p.title.toLowerCase().includes(lower) ||
      p.prompt.toLowerCase().includes(lower) ||
      p.style.toLowerCase().includes(lower) ||
      p.tags.some((t) => t.toLowerCase().includes(lower))
  )
}
