import os
from PIL import Image, ImageDraw, ImageFont

# Define image properties
width, height = 1350, 950
image = Image.new("RGB", (width, height), "#121212") # Dark theme background
draw = ImageDraw.Draw(image)

# Load modern sans-serif font (Segoe UI)
try:
    font_path = "C:\\Windows\\Fonts\\segoeui.ttf"
    font_bold_path = "C:\\Windows\\Fonts\\segoeuib.ttf"
    font = ImageFont.truetype(font_path, 13)
    font_bold = ImageFont.truetype(font_bold_path, 15)
    font_small = ImageFont.truetype(font_path, 12)
except Exception:
    font = ImageFont.load_default()
    font_bold = ImageFont.load_default()
    font_small = ImageFont.load_default()

# Helper function to draw sharp rectangles
def draw_rect(draw, box, fill, outline, width=2):
    x0, y0, x1, y1 = [int(v) for v in box]
    draw.rectangle([x0, y0, x1, y1], fill=fill, outline=outline, width=width)

# Helper function to draw text aligned to center of a box
def draw_text_centered(draw, text, center, font, fill="white"):
    cx, cy = center
    lines = text.split("\n")
    line_heights = []
    line_widths = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        line_widths.append(w)
        line_heights.append(h + 4)
    
    total_height = sum(line_heights)
    current_y = cy - total_height / 2
    
    for i, line in enumerate(lines):
        w = line_widths[i]
        draw.text((int(cx - w/2), int(current_y)), line, font=font, fill=fill)
        current_y += line_heights[i]

# Helper function to draw a clean arrow with label
def draw_arrow(draw, start, end, label, font, color="#A1A1AA", offset_label=(0, 0)):
    # Draw line
    draw.line([int(start[0]), int(start[1]), int(end[0]), int(end[1])], fill=color, width=2)
    
    # Calculate arrowhead
    x1, y1 = start
    x2, y2 = end
    dx = x2 - x1
    dy = y2 - y1
    length = (dx**2 + dy**2)**0.5
    if length == 0:
        return
    ux = dx / length
    uy = dy / length
    
    # Arrowhead points
    arrow_len = 10
    arrow_width = 5
    px = -ux * arrow_len
    py = -uy * arrow_len
    nx = -uy * arrow_width
    ny = ux * arrow_width
    
    ap1 = (int(x2 + px + nx), int(y2 + py + ny))
    ap2 = (int(x2 + px - nx), int(y2 + py - ny))
    draw.polygon([(int(x2), int(y2)), ap1, ap2], fill=color)
    
    # Draw label in the middle of the line
    mx = (x1 + x2) / 2 + offset_label[0]
    my = (y1 + y2) / 2 + offset_label[1]
    
    lines = label.split("\n")
    line_heights = []
    line_widths = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        line_widths.append(w)
        line_heights.append(h + 2)
    
    total_height = sum(line_heights)
    current_y = my - total_height / 2
    
    for i, line in enumerate(lines):
        w = line_widths[i]
        # Draw background dark box for readability
        bx0 = int(mx - w/2 - 4)
        by0 = int(current_y - 2)
        bx1 = int(mx + w/2 + 4)
        by1 = int(current_y + line_heights[i])
        draw.rectangle([bx0, by0, bx1, by1], fill="#121212")
        draw.text((int(mx - w/2), int(current_y)), line, font=font, fill="#E4E4E7")
        current_y += line_heights[i]

# --- LAYOUT DEFINITION (Perfect Grid Alignment) ---
# Center System Node
system_center = (675, 475)
sys_w, sys_h = 300, 140
sys_box = [system_center[0] - sys_w/2, system_center[1] - sys_h/2, 
           system_center[0] + sys_w/2, system_center[1] + sys_h/2]

# Draw central System Node (Modern Blue Rectangle)
draw_rect(draw, sys_box, fill="#1E3A8A", outline="#3B82F6", width=3) # Royal Blue
draw_text_centered(draw, "HACKATHON\nMANAGEMENT SYSTEM", system_center, font_bold, fill="white")

# Define external entities coordinates & box sizes
box_w, box_h = 230, 80

# Entities definition: (name, center_x, center_y, fill, outline, text_color)
entities = {
    "Participant": ("PARTICIPANT", 180, 150, "#1E3A8A", "#3B82F6", "#DBEAFE"),  # Top Left 1
    "Judge": ("JUDGE", 425, 150, "#312E81", "#6366F1", "#E0E7FF"),            # Top Left 2
    "Organizer": ("ORGANIZER", 675, 150, "#78350F", "#F59E0B", "#FEF3C7"),  # Top Middle
    "Admin": ("ADMIN", 925, 150, "#7F1D1D", "#EF4444", "#FEE2E2"),         # Top Right 2
    "Guest": ("GUEST / PUBLIC", 1170, 150, "#27272A", "#71717A", "#F4F4F5"), # Top Right 1
    "Mentor": ("MENTOR", 675, 800, "#064E3B", "#10B981", "#D1FAE5"),             # Bottom Middle
}

# Draw entity boxes
for name, data in entities.items():
    label, cx, cy, fill, outline, txt_color = data
    draw_rect(draw, [cx - box_w/2, cy - box_h/2, cx + box_w/2, cy + box_h/2], fill, outline, width=2)
    draw_text_centered(draw, label, (cx, cy), font_bold, fill=txt_color)

# Helper to calculate intersection points on boundaries
def get_rect_border(cx, cy, target_x, target_y, w, h):
    dx = target_x - cx
    dy = target_y - cy
    if dx == 0:
        return (cx, cy + (h/2 if dy > 0 else -h/2))
    if dy == 0:
        return (cx + (w/2 if dx > 0 else -w/2), cy)
    
    rect_ratio = w / h
    val_ratio = abs(dx / dy)
    if val_ratio > rect_ratio:
        rx = cx + (w/2 if dx > 0 else -w/2)
        ry = cy + (dy * (w/2) / abs(dx))
    else:
        ry = cy + (h/2 if dy > 0 else -h/2)
        rx = cx + (dx * (h/2) / abs(dy))
    return (int(rx), int(ry))

# Helper function to calculate angled arrow coordinates and draw flow pairs
def draw_flow_pair(draw, c1, c2, label_in, label_out, font_small, color="#9CA3AF", d=16):
    x1, y1 = c1
    x2, y2 = c2
    dx = x2 - x1
    dy = y2 - y1
    L = (dx**2 + dy**2)**0.5
    if L == 0:
        return
    ux = dx / L
    uy = dy / L
    # Perpendicular vector
    px = -uy
    py = ux
    
    # Calculate boundary points
    p1_in = (x1 + px * d, y1 + py * d)
    p1_out = (x1 - px * d, y1 - py * d)
    p2_in = (x2 + px * d, y2 + py * d)
    p2_out = (x2 - px * d, y2 - py * d)
    
    border1_in = get_rect_border(x1, y1, p2_in[0], p2_in[1], box_w, box_h)
    border1_out = get_rect_border(x1, y1, p2_out[0], p2_out[1], box_w, box_h)
    
    border2_in = get_rect_border(x2, y2, p1_in[0], p1_in[1], sys_w, sys_h)
    border2_out = get_rect_border(x2, y2, p1_out[0], p1_out[1], sys_w, sys_h)
    
    # Add small gaps to offset lines from borders
    start_in = (border1_in[0] + px * 2, border1_in[1] + py * 2)
    end_in = (border2_in[0] + px * 2, border2_in[1] + py * 2)
    
    start_out = (border2_out[0] - px * 2, border2_out[1] - py * 2)
    end_out = (border1_out[0] - px * 2, border1_out[1] - py * 2)
    
    # Calculate middle offsets to move labels perpendicular to lines
    label_shift = 32
    if abs(ux) > 0.8: # Horizontal-ish lines
        offset_in = (0, -label_shift)
        offset_out = (0, label_shift)
    else: # Vertical or angled lines
        offset_in = (px * label_shift, py * label_shift)
        offset_out = (-px * label_shift, -py * label_shift)
        
    draw_arrow(draw, start_in, end_in, label_in, font_small, color=color, offset_label=offset_in)
    draw_arrow(draw, start_out, end_out, label_out, font_small, color=color, offset_label=offset_out)

# Draw arrows and data flows using the smart vector calculation

# --- 1. PARTICIPANT <-> SYSTEM ---
draw_flow_pair(draw, (180, 150), system_center,
               "1. Register & Profile Setup (UC01)\n2. Register for Hackathon (UC03)\n3. Team creation & Member invites (UC04, UC17)\n4. Submit project (UC05)\n5. Send mentorship requests (UC06)",
               "1. System notifications & Invites (UC18, UC17)\n2. Grades, reviews & feedback (UC07, UC08)\n3. Round leaderboard / Rankings (UC16)",
               font_small, color="#9CA3AF")

# --- 2. JUDGE <-> SYSTEM ---
draw_flow_pair(draw, (425, 150), system_center,
               "1. Register & Profile Setup (UC01)\n2. Enter scores & feedback (UC07, UC08)",
               "1. Assigned submissions list (UC19)\n2. Criteria configurations (UC21)",
               font_small, color="#9CA3AF")

# --- 3. ORGANIZER <-> SYSTEM ---
draw_flow_pair(draw, (675, 150), system_center,
               "1. Hackathon & Round configurations (UC09, UC23)\n2. Criteria & Prizes setup (UC20, UC21)\n3. Judge & Mentor assignments (UC19, UC22)\n4. Advance teams to next round (UC15)\n5. User management & CSV requests (UC10, UC14)",
               "1. Statistical reports & analytics (UC12)\n2. Grade lists & team CSV data (UC14)",
               font_small, color="#9CA3AF")

# --- 4. ADMIN <-> SYSTEM ---
draw_flow_pair(draw, (925, 150), system_center,
               "1. Manage roles & permissions (UC11)\n2. Manage all system users (UC10)\n3. Manage category customers (UC24)\n4. System audit logs request (UC13)",
               "1. Audit logs data (UC13)\n2. Category customer CRUD responses (UC24)",
               font_small, color="#9CA3AF")

# --- 5. GUEST <-> SYSTEM ---
draw_flow_pair(draw, (1170, 150), system_center,
               "1. View Hackathons (UC02)\n2. View round leaderboard (UC16)",
               "1. Hackathon information & rules (UC02)\n2. Real-time scores & rankings (UC16)",
               font_small, color="#9CA3AF")

# --- 6. MENTOR <-> SYSTEM ---
draw_flow_pair(draw, (675, 800), system_center,
               "1. Register & Profile Setup (UC01)\n2. Provide feedback & response (UC08)",
               "1. Mentorship requests (UC06)\n2. Track & assigned team details (UC22)",
               font_small, color="#9CA3AF")

# Ensure output directory exists
os.makedirs("d:\\Intellji\\SWP391-Project\\documentation", exist_ok=True)

# Save image
output_path = "d:\\Intellji\\SWP391-Project\\documentation\\context_diagram_eng.png"
image.save(output_path, "PNG")
print(f"Successfully saved English context diagram to {output_path}")
