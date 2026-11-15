"""Draws the simple product mockups for legenddary.com/shop/ (legenddary-home/shop/img/).
Usage: python3 scripts/make-shop-mockups.py <path-to-legenddary-sparkprep-emblem-full.png>
These are preview pictures only. Real store photos come from Printful/Printify mockups later."""
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

EMBLEM = Image.open(sys.argv[1]).convert("RGBA")
OUT = os.path.join(os.path.dirname(__file__), "..", "legenddary-home", "shop", "img")
S = 900
GOLD = (212, 175, 55); GOLD_L = (240, 214, 130)
SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
SERIF_I = "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def knockout(img, lo=95):
    """Drop the dark background so the gold art sits on any color."""
    g = img.convert("L").point(lambda v: 0 if v < lo else min(255, (v - lo) * 4))
    a = Image.composite(g, Image.new("L", img.size, 0), img.split()[3]).filter(ImageFilter.GaussianBlur(0.8))
    oval = Image.new("L", img.size, 0); w, h = img.size
    ImageDraw.Draw(oval).ellipse((w * .08, h * .02, w * .92, h * .98), fill=255)
    a = ImageChops.multiply(a, oval.filter(ImageFilter.GaussianBlur(18)))
    out = img.copy(); out.putalpha(a); return out
CROWN = knockout(EMBLEM.crop((520, 20, 1015, 470)))   # crown + L = the Legenddary mark
font = lambda p, n: ImageFont.truetype(p, n)

def bg():
    im = Image.new("RGB", (S, S), (8, 7, 4))
    glow = Image.new("L", (S, S), 0); ImageDraw.Draw(glow).ellipse((150, 120, 750, 720), fill=90)
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    im.paste(Image.new("RGB", (S, S), (70, 56, 18)), (0, 0), glow)
    return im

def shape(im, draw_fn, fill, outline=None):
    """Draw a product shape with a soft drop shadow, return its mask."""
    mask = Image.new("L", (S, S), 0); draw_fn(ImageDraw.Draw(mask), 255)
    sh = mask.filter(ImageFilter.GaussianBlur(28))
    im.paste(Image.new("RGB", (S, S), (0, 0, 0)), (14, 26), sh)
    im.paste(Image.new("RGB", (S, S), fill), (0, 0), mask)
    shade = Image.new("L", (S, S), 0); ImageDraw.Draw(shade).rectangle((0, 0, S, S), fill=0)
    # gentle top-left highlight
    hl = Image.new("L", (S, S), 0); ImageDraw.Draw(hl).ellipse((-200, -250, 520, 470), fill=40)
    hl = hl.filter(ImageFilter.GaussianBlur(90)); hl = Image.composite(hl, Image.new("L", (S, S), 0), mask)
    im.paste(Image.new("RGB", (S, S), (255, 255, 255)), (0, 0), hl)
    if outline:
        edge = mask.filter(ImageFilter.FIND_EDGES)
        im.paste(Image.new("RGB", (S, S), outline), (0, 0), edge)
    return mask

def put(im, art, cx, cy, w):
    a = art.copy(); a.thumbnail((w, w * 3)); im.paste(a, (int(cx - a.width / 2), int(cy - a.height / 2)), a)

def text(im, s, cx, y, size, color=GOLD, f=SERIF, spacing=0):
    d = ImageDraw.Draw(im); fo = font(f, size)
    if spacing:
        s = (" " * spacing).join(s) if False else s
    w = d.textlength(s, font=fo); d.text((cx - w / 2, y), s, font=fo, fill=color)

def tee(d, c, y0=170):
    d.polygon([(330, y0), (240, y0 + 30), (120, y0 + 140), (190, y0 + 240), (255, y0 + 205), (255, 790), (645, 790),
               (645, y0 + 205), (710, y0 + 240), (780, y0 + 140), (660, y0 + 30), (570, y0)], fill=c)
    d.chord((365, y0 - 50, 535, y0 + 55), 0, 180, fill=0)

def hoodie(d, c):
    d.polygon([(320, 210), (210, 250), (110, 560), (190, 590), (255, 380), (255, 800), (645, 800), (645, 380),
               (710, 590), (790, 560), (690, 250), (580, 210)], fill=c)
    d.polygon([(330, 230), (360, 130), (450, 95), (540, 130), (570, 230), (450, 300)], fill=c)

def hat(d, c):
    d.chord((210, 230, 690, 720), 180, 360, fill=c)
    d.rectangle((210, 470, 690, 500), fill=c)
    d.chord((300, 400, 800, 580), 0, 180, fill=c)
    d.ellipse((435, 215, 465, 245), fill=c)

def save(im, name):
    im.save(os.path.join(OUT, name + ".jpg"), quality=84, optimize=True); print("wrote", name)

def blk(): return (16, 15, 14)

# ---------- Group 1: Legenddary / Lady Legenddary ----------
im = bg(); shape(im, lambda d, c: tee(d, c), blk(), (45, 40, 25))
put(im, CROWN, 450, 360, 190); text(im, "LEGENDDARY", 450, 470, 52); text(im, "ORGANIC", 450, 535, 22, (150, 200, 150), SANS)
save(im, "legenddary-organic-tee")

im = bg(); shape(im, hoodie, blk(), (45, 40, 25))
put(im, CROWN, 450, 450, 170); text(im, "LEGENDDARY", 450, 545, 48)
save(im, "legenddary-organic-hoodie")

im = bg(); shape(im, lambda d, c: tee(d, c), (236, 226, 208), (200, 185, 160))
put(im, CROWN, 450, 350, 170); text(im, "LADY", 450, 445, 34, (150, 112, 20), SANS); text(im, "LEGENDDARY", 450, 485, 52, (150, 112, 20))
save(im, "lady-legenddary-organic-tee")

im = bg(); shape(im, hat, blk(), (45, 40, 25)); put(im, CROWN, 450, 360, 150)
save(im, "legenddary-crown-hat")

# ---------- Group 2: The Awakening (book merch) ----------
im = bg(); shape(im, lambda d, c: tee(d, c), blk(), (45, 40, 25))
text(im, "LEGENDDARY MINDSET", 450, 330, 30, GOLD_L, SANS); text(im, "THE", 450, 380, 40, (255, 255, 255))
text(im, "AWAKENING", 450, 425, 74); text(im, "Stop living on default.", 450, 525, 34, (220, 220, 220), SERIF_I)
save(im, "awakening-tee")

im = bg(); shape(im, hat, (232, 222, 200), (200, 185, 160))
text(im, "THE", 450, 330, 34, (60, 50, 20)); text(im, "AWAKENING", 450, 368, 60, (150, 112, 20))
save(im, "awakening-hat")

im = bg()
def pen(d, c): d.rounded_rectangle((150, 420, 760, 480), 30, fill=c); d.polygon([(760, 430), (830, 450), (760, 470)], fill=c)
shape(im, pen, (196, 160, 70), (120, 95, 30))
d = ImageDraw.Draw(im); d.rounded_rectangle((180, 405, 260, 425), 6, fill=(150, 120, 45))
text(im, "THE AWAKENING  ·  LIVE IT", 470, 434, 26, (90, 70, 20), SANS)
save(im, "awakening-pen")

im = bg()
def journal(d, c): d.rounded_rectangle((230, 140, 670, 780), 18, fill=c)
shape(im, journal, (14, 13, 12), (60, 52, 30))
d = ImageDraw.Draw(im); d.rectangle((230, 140, 262, 780), fill=(40, 34, 18)); d.rectangle((640, 140, 656, 780), fill=GOLD)
put(im, CROWN, 440, 330, 150); text(im, "THE AWAKENING", 445, 430, 36); text(im, "20 CODES", 440, 490, 30, (255, 255, 255), SANS)
text(im, "Daily Planner", 440, 535, 32, GOLD_L, SERIF_I)
save(im, "awakening-planner")

# ---------- Group 3: SparkPrep author gear ----------
im = bg()
def mug(d, c): d.rounded_rectangle((220, 230, 600, 720), 30, fill=c); d.ellipse((540, 340, 740, 600), fill=c); d.ellipse((585, 390, 690, 550), fill=0)
shape(im, mug, (245, 243, 238), (200, 195, 185)); put(im, EMBLEM, 410, 470, 330)
save(im, "sparkprep-mug")

im = bg()
def nb(d, c): d.rounded_rectangle((250, 150, 680, 770), 12, fill=c)
shape(im, nb, (14, 13, 12), (60, 52, 30)); d = ImageDraw.Draw(im)
for y in range(175, 760, 34): d.ellipse((232, y, 268, y + 18), outline=(190, 190, 190), width=4)
put(im, EMBLEM, 470, 400, 340); text(im, "WRITER'S NOTEBOOK", 470, 600, 30, GOLD_L, SANS)
save(im, "sparkprep-notebook")

im = bg()
def tote(d, c): d.rectangle((210, 290, 690, 800), fill=c); d.arc((300, 110, 430, 400), 180, 360, fill=c, width=26); d.arc((470, 110, 600, 400), 180, 360, fill=c, width=26)
shape(im, tote, (232, 222, 200), (200, 185, 160)); put(im, EMBLEM, 450, 500, 380)
text(im, "I write. I publish. I succeed.", 450, 680, 30, (60, 50, 20), SERIF_I)
save(im, "sparkprep-tote")

im = bg()
def sticker(d, c): d.rounded_rectangle((170, 220, 730, 680), 60, fill=c)
shape(im, sticker, (250, 250, 250), (210, 210, 210)); put(im, EMBLEM, 450, 450, 500)
save(im, "sparkprep-sticker")
