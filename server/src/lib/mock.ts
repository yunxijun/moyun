/**
 * Mock 诗词数据 — 开发阶段使用，不依赖任何 API
 * 会尝试根据用户输入返回匹配的内容
 */

interface MockPoem {
  title: string
  genre: string
  rhyme: string
  content: string[]
  translation: string
  appreciation: string
  imageInsight?: string
}

/** 藏头诗生成（按首字匹配） */
function generateAcrostic(chars: string[]): MockPoem {
  const templates: Record<string, { line: string; trans: string }[]> = {
    // 3字藏头
    default3_7: [
      { line: '{c}辉映照满江天，', trans: '第一句以"{c}"字起，气势开阔。' },
      { line: '{c}国安邦志未迁，', trans: '第二句承接，表达志向不变。' },
      { line: '{c}气凌云书壮志，', trans: '第三句转折，书写豪情壮志。' },
    ],
    default3_5: [
      { line: '{c}光耀九州，', trans: '第一句以"{c}"字起。' },
      { line: '{c}志立千秋，', trans: '第二句承接。' },
      { line: '{c}心照日月，', trans: '第三句合。' },
    ],
  }

  const isSevenChar = chars.length <= 4
  const lines: string[] = []
  const transLines: string[] = []

  if (isSevenChar && chars.length === 3) {
    // 三字藏头 → 六句或四句
    const poemLines = [
      `${chars[0]}阳高照映晴川，`,
      `光风霁月满人间。`,
      `${chars[1]}国忠良承伟业，`,
      `壮怀激烈志弥坚。`,
      `${chars[2]}锐之师扬正气，`,
      `功成名就写新篇。`,
    ]
    return {
      title: `藏头诗·${chars.join('')}`,
      genre: '七言古风',
      rhyme: '先韵',
      content: poemLines,
      translation: `这是一首以"${chars.join('')}"为藏头的诗。每联首字依次为"${chars.join('""')}"，暗含"${chars.join('')}"之意。全诗气势豪迈，表达了建功立业的壮志。`,
      appreciation: `藏头诗是一种特殊的诗歌形式，将特定文字隐藏在每句诗的首字中。此诗以"${chars.join('')}"藏头，浑然天成，不露痕迹，且诗意连贯，实属难得。`,
    }
  }

  // 通用处理：每个字一联（两句）
  const couplets: string[][] = chars.map((ch, i) => {
    const oddLines = [
      [`${ch}临天下展宏图，`, `山河万里入画途。`],
      [`${ch}照乾坤气象新，`, `春风化雨润无尘。`],
      [`${ch}立潮头观沧海，`, `云帆万里共徘徊。`],
      [`${ch}心铸就凌云志，`, `笔墨纵横写传奇。`],
    ]
    return oddLines[i % oddLines.length]
  })

  const allLines = couplets.flat()

  return {
    title: `藏头诗·${chars.join('')}`,
    genre: '七言古风',
    rhyme: '多韵',
    content: allLines,
    translation: `这是一首以"${chars.join('')}"为藏头的诗。依次取每联首句的第一个字，可得"${chars.join('')}"。`,
    appreciation: `此诗将"${chars.join('')}"巧妙地嵌入每联之首，既保持了诗歌的流畅性，又暗含深意，构思精巧。`,
  }
}

/** 根据关键词匹配主题 */
function matchThemePoem(prompt: string): MockPoem {
  const themes: { keywords: string[]; poem: MockPoem }[] = [
    {
      keywords: ['春', '花', '桃', '樱'],
      poem: {
        title: '春日即景',
        genre: '七言绝句',
        rhyme: '阳韵',
        content: ['桃花三月映斜阳，', '燕子双飞入画廊。', '最爱春风拂面过，', '一川烟雨百花香。'],
        translation: '三月桃花在斜阳映照下分外妖艳，燕子双飞如同穿行在画卷之中。最喜爱那春风拂面而过的感觉，一川烟雨之中百花飘香。',
        appreciation: '此诗描绘了一幅明媚的春日画卷，桃花、燕子、春风、烟雨，意象丰富而和谐，末句以嗅觉收束，余韵悠长。',
      },
    },
    {
      keywords: ['秋', '月', '思', '愁', '乡'],
      poem: {
        title: '秋思',
        genre: '七言绝句',
        rhyme: '先韵',
        content: ['枫林晚照映长天，', '雁字南归带暮烟。', '独倚西楼人不见，', '一江秋水月如弦。'],
        translation: '深秋枫林在夕阳映照下与长天相接，南归的雁阵带着暮色中的薄烟远去。独自倚靠西楼，思念之人不见踪影，一江秋水上弦月如钩。',
        appreciation: '此诗以枫林、归雁、西楼、秋水构成完整秋景，末句「月如弦」喻相思不圆满，含蓄深远。',
      },
    },
    {
      keywords: ['夏', '荷', '蝉', '热'],
      poem: {
        title: '夏日荷塘',
        genre: '七言绝句',
        rhyme: '阳韵',
        content: ['接天莲叶碧无疆，', '映日荷花别样妆。', '蝉噪林深风自远，', '一池清水送幽香。'],
        translation: '连天的莲叶碧绿无边，映着阳光的荷花姿态各异。蝉声在密林深处回荡，清风从远方吹来，一池清水送来幽幽荷香。',
        appreciation: '化用杨万里"接天莲叶"意境，以视觉（碧叶红花）、听觉（蝉噪）、嗅觉（幽香）多感官描绘夏日荷塘。',
      },
    },
    {
      keywords: ['冬', '雪', '梅', '寒'],
      poem: {
        title: '咏梅',
        genre: '五言绝句',
        rhyme: '支韵',
        content: ['独立风霜里，', '凌寒自不知。', '暗香浮月下，', '疏影落冰池。'],
        translation: '梅花独自立于风霜之中，不畏严寒犹自绽放。暗香在月光下浮动，疏落的枝影映在冰冷的池水上。',
        appreciation: '化用林逋「暗香浮动月黄昏」意境，以「独立」「凌寒」写梅之品格，意在言外。',
      },
    },
    {
      keywords: ['送别', '离别', '别', '友', '远行'],
      poem: {
        title: '送别',
        genre: '七言绝句',
        rhyme: '微韵',
        content: ['长亭古道柳丝垂，', '一曲离歌泪满衣。', '此去关山千万里，', '何年何月再相依。'],
        translation: '长亭古道旁杨柳低垂，一曲离别的歌声让人泪湿衣襟。此去关山万里路途遥远，不知何年何月才能再次相聚。',
        appreciation: '以长亭、古道、柳丝等经典送别意象开篇，后两句以关山万里与归期无定将离愁推向高潮。',
      },
    },
    {
      keywords: ['爱', '情', '恋', '相思', '相'],
      poem: {
        title: '相思引',
        genre: '七言绝句',
        rhyme: '先韵',
        content: ['月照西窗人未眠，', '一笺心事寄云天。', '相思欲寄无从寄，', '化作清风到枕边。'],
        translation: '月光照进西窗，人辗转难以入眠，将满腹心事写在信笺上寄向远方。相思之情想要寄出却无处可寄，只好化作清风飘到你的枕边。',
        appreciation: '此诗层层递进，由月夜不眠到书写心事，再到无处寄托，最终化虚为实，以清风传情，构思巧妙。',
      },
    },
  ]

  for (const t of themes) {
    if (t.keywords.some(k => prompt.includes(k))) {
      return t.poem
    }
  }

  // 默认：根据输入内容生成标题
  return {
    title: `题${prompt.slice(0, 6)}`,
    genre: '七言绝句',
    rhyme: '东韵',
    content: ['天高云淡远山东，', '万里风光入眼中。', '莫道前程多险阻，', '行舟破浪自从容。'],
    translation: '天高云淡，极目远眺东方的群山，万里风光尽收眼底。不要说前方路途多么艰险，驾舟破浪自有一份从容。',
    appreciation: `应"${prompt}"之题而作，以开阔的自然意象起笔，后两句转入励志，表达面对困难的从容态度。`,
  }
}

/**
 * 智能 Mock — 根据用户输入判断类型并返回相应内容
 */
export async function mockGeneratePoem(prompt: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 600))

  // 检测藏头诗请求
  const acrosticMatch = prompt.match(/藏头[诗词]?[：:·]?\s*[「「]?([^\s」」]{2,8})[」」]?/)
    || prompt.match(/[以用].*?[「「]?([^\s」」]{2,8})[」」]?\s*(?:做|写|作|来).*?藏头/)
    || prompt.match(/(?:名字|姓名)[是为]?\s*[「「]?([^\s」」]{2,8})[」」]?/)

  if (prompt.includes('藏头') && acrosticMatch) {
    const chars = [...acrosticMatch[1]]
    const poem = generateAcrostic(chars)
    return JSON.stringify(poem)
  }

  // 如果提到"藏头"但没匹配到具体文字，尝试提取中文名
  if (prompt.includes('藏头')) {
    const nameMatch = prompt.match(/[\u4e00-\u9fa5]{2,4}(?=.*藏头)/)
      || prompt.match(/藏头.*?([\u4e00-\u9fa5]{2,4})/)
    if (nameMatch) {
      const chars = [...nameMatch[nameMatch.length > 1 ? 1 : 0]]
      const poem = generateAcrostic(chars)
      return JSON.stringify(poem)
    }
  }

  // 主题匹配
  const poem = matchThemePoem(prompt)
  return JSON.stringify(poem)
}

export async function mockPoemFromImage(): Promise<string> {
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 800))
  const poem: MockPoem = {
    title: '即景',
    genre: '七言绝句',
    rhyme: '阳韵',
    content: ['青山如黛水如裳，', '天地之间一画廊。', '最是此间风物好，', '不须远行到他乡。'],
    translation: '青山如画眉般秀美，水面如裙裳般柔和，天地之间宛如一座画廊。这里的风景最为美好，不需要远行去其他地方。',
    appreciation: '此诗以「如黛」「如裳」比喻山水，将自然比作画廊，抒发对眼前美景的赞叹与满足。',
    imageInsight: '从画面中提取了山水交融的自然意境',
  }
  return JSON.stringify(poem)
}
