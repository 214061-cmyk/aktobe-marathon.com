import { RaceResult } from '../types/marathon';

export interface DiplomaOptions {
  eventTitle?: string;
  eventDate?: string;
  bgUrl?: string | null;
}

/**
 * Loads an image from URL or dataURL into an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Generates a high-resolution PNG dataURL of the finisher diploma
 */
export async function generateDiplomaDataUrl(
  result: RaceResult,
  options: DiplomaOptions = {}
): Promise<string> {
  const width = 1920;
  const height = 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const title = options.eventTitle || 'AQTOBE INTERNATIONAL MARATHON';
  const dateStr = options.eventDate || '17 Мая 2026 г. • г. Актобе';

  let hasCustomBg = false;

  // 1. Draw custom background if provided
  if (options.bgUrl) {
    try {
      const bgImg = await loadImage(options.bgUrl);
      ctx.drawImage(bgImg, 0, 0, width, height);
      hasCustomBg = true;
    } catch (e) {
      console.warn('Could not load custom diploma background, falling back to built-in template', e);
    }
  }

  // 2. Built-in backdrop if no custom background
  if (!hasCustomBg) {
    // Rich dark gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0b12');
    bgGrad.addColorStop(0.5, '#121422');
    bgGrad.addColorStop(1, '#06070a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative geometric accents & glows
    const radial = ctx.createRadialGradient(width / 2, 300, 50, width / 2, 300, 700);
    radial.addColorStop(0, 'rgba(217, 249, 157, 0.08)');
    radial.addColorStop(0.5, 'rgba(234, 179, 8, 0.04)');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Outer double golden border
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, width - 100, height - 100);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(62, 62, width - 124, height - 124);

    // Corner decorative triangles
    const cornerSize = 40;
    ctx.fillStyle = '#eab308';
    // Top-left
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(50 + cornerSize, 50);
    ctx.lineTo(50, 50 + cornerSize);
    ctx.closePath();
    ctx.fill();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - 50, 50);
    ctx.lineTo(width - 50 - cornerSize, 50);
    ctx.lineTo(width - 50, 50 + cornerSize);
    ctx.closePath();
    ctx.fill();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(50, height - 50);
    ctx.lineTo(50 + cornerSize, height - 50);
    ctx.lineTo(50, height - 50 - cornerSize);
    ctx.closePath();
    ctx.fill();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - 50, height - 50);
    ctx.lineTo(width - 50 - cornerSize, height - 50);
    ctx.lineTo(width - 50, height - 50 - cornerSize);
    ctx.closePath();
    ctx.fill();
  } else {
    // If custom background, add subtle translucent dark overlay box in the center to guarantee readability of text
    ctx.fillStyle = 'rgba(10, 12, 20, 0.72)';
    ctx.beginPath();
    ctx.roundRect(140, 100, width - 280, height - 200, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // --- CERTIFICATE CONTENT ---
  ctx.textAlign = 'center';

  // 1. Top Ribbon / Subtitle
  ctx.font = 'bold 22px "Montserrat", sans-serif';
  ctx.fillStyle = '#a3e635'; // Lime-400
  ctx.letterSpacing = '6px';
  ctx.fillText('ОФИЦИАЛЬНЫЙ СЕРТИФИКАТ ФИНИШЕРА', width / 2, 170);

  // 2. Main Title
  ctx.font = '900 56px "Bebas Neue", "Oswald", "Montserrat", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.letterSpacing = '3px';
  ctx.fillText(title.toUpperCase(), width / 2, 240);

  // Divider line
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 250, 270);
  ctx.lineTo(width / 2 + 250, 270);
  ctx.stroke();

  // 3. Awarded to
  ctx.font = 'italic 500 20px "Montserrat", sans-serif';
  ctx.fillStyle = '#a1a1aa';
  ctx.letterSpacing = '2px';
  ctx.fillText('Настоящим подтверждается, что атлет', width / 2, 320);

  // 4. Athlete Full Name
  ctx.font = '900 68px "Montserrat", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.letterSpacing = '2px';
  ctx.fillText(result.fullName.toUpperCase(), width / 2, 400);

  // 5. Distance and Bib Pill
  const distText = `ДИСТАНЦИЯ: ${result.distanceName.toUpperCase()}    •    BIB № ${result.bibNumber}`;
  ctx.font = 'bold 24px "Montserrat", sans-serif';
  ctx.fillStyle = '#facc15'; // Amber-400
  ctx.letterSpacing = '3px';
  ctx.fillText(distText, width / 2, 455);

  // 6. Metrics Grid (Boxes for Chip Time, Avg Pace, Overall Rank, Category Rank)
  const cardWidth = 330;
  const cardHeight = 150;
  const cardY = 510;
  const gap = 30;
  const totalCardsWidth = cardWidth * 4 + gap * 3;
  let startX = (width - totalCardsWidth) / 2;

  const cardsData = [
    { label: 'ЧИСТОЕ ВРЕМЯ (CHIP)', value: result.chipTime, color: '#a3e635' },
    { label: 'СРЕДНИЙ ТЕМП', value: result.avgPace, color: '#38bdf8' },
    { label: 'МЕСТО В АБСОЛЮТЕ', value: `#${result.overallPlace}`, color: '#fbbf24' },
    { label: `КАТЕГОРИЯ (${result.ageGroup})`, value: `№ ${result.categoryPlace}`, color: '#f43f5e' }
  ];

  cardsData.forEach((c, idx) => {
    const x = startX + idx * (cardWidth + gap);

    // Box background
    ctx.fillStyle = 'rgba(24, 27, 44, 0.85)';
    ctx.beginPath();
    ctx.roundRect(x, cardY, cardWidth, cardHeight, 18);
    ctx.fill();

    // Box border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Box Label
    ctx.font = '700 13px "Montserrat", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.letterSpacing = '1.5px';
    ctx.fillText(c.label, x + cardWidth / 2, cardY + 45);

    // Box Value
    ctx.font = '900 42px "Bebas Neue", "Oswald", "Montserrat", monospace';
    ctx.fillStyle = c.color;
    ctx.letterSpacing = '1px';
    ctx.fillText(c.value, x + cardWidth / 2, cardY + 105);
  });

  // 7. Secondary Info (Gun time, Gender rank, City/Club)
  let subInfo = `Время Gun: ${result.gunTime}   |   Место в поле: #${result.genderPlace}`;
  if (result.team) subInfo += `   |   Клуб: ${result.team}`;
  if (result.city) subInfo += `   |   Город: ${result.city}`;

  ctx.font = '500 18px "Montserrat", sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.letterSpacing = '1px';
  ctx.fillText(subInfo, width / 2, 720);

  // 8. Seal / Organization Stamp & Signatures
  // Left: Date & City
  ctx.textAlign = 'left';
  ctx.font = 'bold 18px "Montserrat", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(dateStr, 220, 840);
  ctx.font = '500 14px "Montserrat", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Дата и место проведения старта', 220, 868);

  // Center: Timing Verification Badge
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px "Montserrat", sans-serif';
  ctx.fillStyle = '#a3e635';
  ctx.letterSpacing = '1px';
  ctx.fillText('✓ ОФИЦИАЛЬНО ЗАФИКСИРОВАНО', width / 2, 835);
  ctx.font = '500 13px "Montserrat", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Электронная система хронометража MyLaps BibTag & ChronoTrack', width / 2, 862);

  // Right: Organizing committee
  ctx.textAlign = 'right';
  ctx.font = 'bold 18px "Montserrat", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Оргкомитет Qazaq Marathon Series', width - 220, 840);
  ctx.font = '500 14px "Montserrat", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Главный судья соревнований', width - 220, 868);

  // Signature line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width - 420, 820);
  ctx.lineTo(width - 220, 820);
  ctx.stroke();

  return canvas.toDataURL('image/png', 0.98);
}

/**
 * Triggers a download of the finisher diploma as a high-res PNG file
 */
export async function downloadDiploma(
  result: RaceResult,
  options: DiplomaOptions = {}
): Promise<void> {
  const dataUrl = await generateDiplomaDataUrl(result, options);
  const link = document.createElement('a');
  const safeName = (result.fullName || 'athlete').trim().replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]+/g, '_');
  link.download = `Диплом_${result.bibNumber}_${safeName}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
